"""Conservative sector measurement and seam helpers. No historical map builder or API calls."""

from __future__ import annotations

import hashlib
import itertools
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


RECTS = {}  # Caller must supply an explicit world grid before analyze_sector.

DEFAULTS = {
    "registration": {
        "analysisSize": 308, "patchSizePx": 196, "searchRadiusPx": 72,
        "minNcc": 0.24, "minPeakMargin": 0.006, "minTexture": 0.003,
        "maxRoundTripPx": 8.0, "minMatches": 6, "minCoverage": 0.44,
        "ransacResidualPx": 8.0, "minInlierFraction": 0.8,
        "maxRmsPx": 5.5, "maxP90Px": 10.0, "maxLocalResidualPx": 18.0,
        "maxScaleDeviation": 0.02, "maxRotationDeg": 0.8,
        "maxShear": 0.012, "maxTranslationPx": 24.0,
        "maxCornerDriftPx": 32.0, "guardBorderPx": 8,
        "maxAspectDeviation": 0.02,
    },
    "stitch": {"blendWidthPx": 12, "maxRgbOffset": 8, "edgeWeight": 0.35,
               "seamMarginPx": 16, "webQuality": 94},
}
CAUTION = (
    "Patch correlation and a small affine fit diagnose layout drift; they do not "
    "prove exact collision footprints, stairs, or every silhouette. Owner visual "
    "approval and native-detail acceptance remain separate."
)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(path)


def resolve(base: Path, value: str | dict | None, fallback: str | None = None) -> Path:
    if isinstance(value, dict):
        value = value.get("path") or value.get("file") or value.get("image")
    value = value or fallback
    if not value:
        raise ValueError("Image path is missing")
    path = Path(value)
    return path.resolve() if path.is_absolute() else (base / path).resolve()


def rel(path: Path, base: Path) -> str:
    try:
        return path.relative_to(base).as_posix()
    except ValueError:
        return str(path)


def settings(path: Path | None, manifest: dict) -> dict:
    cfg = json.loads(json.dumps(DEFAULTS))
    supplied = manifest.get("processing", {})
    if path:
        supplied = json.loads(path.read_text(encoding="utf-8-sig"))
    for section, values in supplied.items():
        if section not in cfg or not isinstance(values, dict):
            raise ValueError(f"Unknown configuration section: {section}")
        for key, value in values.items():
            if key not in cfg[section] or not isinstance(value, (int, float)) or isinstance(value, bool):
                raise ValueError(f"Invalid numeric setting: {section}.{key}")
            if not math.isfinite(value) or value < 0:
                raise ValueError(f"Invalid range for {section}.{key}")
            cfg[section][key] = value
    r, s = cfg["registration"], cfg["stitch"]
    if not (128 <= r["analysisSize"] <= 616 and 96 <= r["patchSizePx"] <= 320):
        raise ValueError("Analysis/patch dimensions are outside supported bounds")
    if not (8 <= r["searchRadiusPx"] <= 100 and 0.12 <= r["minNcc"] <= 1):
        raise ValueError("Search/NCC settings are outside conservative bounds")
    if not (0.001 <= r["minPeakMargin"] <= 0.2 and 0.001 <= r["minTexture"] <= 0.1 and
            0 < r["maxRoundTripPx"] <= 8 and 4 <= r["ransacResidualPx"] <= 10 and
            r["maxAspectDeviation"] <= 0.02):
        raise ValueError("Patch confidence, round-trip, residual or aspect bounds are excessive")
    if not (4 <= r["minMatches"] <= 12 and 0.4 <= r["minCoverage"] <= 0.8):
        raise ValueError("Too few or insufficiently distributed landmarks")
    if not (r["maxScaleDeviation"] <= 0.025 and r["maxRotationDeg"] <= 1 and
            r["maxShear"] <= 0.02 and r["maxTranslationPx"] <= 32 and
            r["maxCornerDriftPx"] <= 40 and r["guardBorderPx"] <= 12):
        raise ValueError("Requested affine limits would permit excessive distortion")
    if not (r["maxRmsPx"] <= 8 and r["maxP90Px"] <= 14 and
            r["maxLocalResidualPx"] <= 24 and 0.75 <= r["minInlierFraction"] <= 1):
        raise ValueError("Requested residual limits would hide local layout drift")
    if not (4 <= s["blendWidthPx"] <= 16 and s["maxRgbOffset"] <= 8 and
            0 <= s["edgeWeight"] <= 2 and 4 <= s["seamMarginPx"] <= 32 and
            80 <= s["webQuality"] <= 100):
        raise ValueError("Stitch parameters exceed the narrow-blend/small-color contract")
    return cfg


def feature(image: Image.Image, size: tuple[int, int]) -> np.ndarray:
    # This low-pass is for measurement only; production RGB pixels are untouched.
    gray = np.asarray(image.convert("L").resize(size, Image.Resampling.LANCZOS)
                      .filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float64) / 255
    gy, gx = np.gradient(gray)
    return np.sqrt(gx * gx + gy * gy)


def window_sums(a: np.ndarray, h: int, w: int) -> np.ndarray:
    integral = np.pad(a, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    return integral[h:, w:] - integral[:-h, w:] - integral[h:, :-w] + integral[:-h, :-w]


def ncc(search: np.ndarray, patch: np.ndarray) -> np.ndarray:
    """Zero-mean valid normalized cross correlation without cv2/scipy."""
    h, w = patch.shape
    oh, ow = search.shape[0] - h + 1, search.shape[1] - w + 1
    if oh <= 0 or ow <= 0:
        raise ValueError("NCC search is smaller than its patch")
    centered = patch - patch.mean()
    energy = float((centered * centered).sum())
    shape = (search.shape[0] + h - 1, search.shape[1] + w - 1)
    corr = np.fft.irfftn(np.fft.rfftn(search, s=shape, axes=(0, 1)) *
                         np.conj(np.fft.rfftn(centered, s=shape, axes=(0, 1))),
                         s=shape, axes=(0, 1))[:oh, :ow]
    sums = window_sums(search, h, w)
    squares = window_sums(search * search, h, w)
    denominator = np.sqrt(np.maximum(squares - sums * sums / (h * w), 0) * energy)
    return np.clip(np.divide(corr, denominator, out=np.full_like(corr, -1),
                             where=denominator > 1e-12), -1, 1)


def peak(scores: np.ndarray) -> tuple[float, float, float, float, bool]:
    iy, ix = np.unravel_index(int(scores.argmax()), scores.shape)
    best = float(scores[iy, ix])
    remaining = scores.copy()
    remaining[max(0, iy - 3):iy + 4, max(0, ix - 3):ix + 4] = -1
    second = float(remaining.max())
    dx = dy = 0.0
    if 0 < ix < scores.shape[1] - 1:
        left, middle, right = scores[iy, ix - 1:ix + 2]
        den = left - 2 * middle + right
        dx = float(np.clip(0.5 * (left - right) / den, -0.5, 0.5)) if den < -1e-12 else 0
    if 0 < iy < scores.shape[0] - 1:
        above, middle, below = scores[iy - 1:iy + 2, ix]
        den = above - 2 * middle + below
        dy = float(np.clip(0.5 * (above - below) / den, -0.5, 0.5)) if den < -1e-12 else 0
    boundary = ix in (0, scores.shape[1] - 1) or iy in (0, scores.shape[0] - 1)
    return ix + dx, iy + dy, best, best - second, boundary


def match_patches(reference: Image.Image, generated: Image.Image, cfg: dict) -> list[dict]:
    width, height = reference.size
    factor = max(width, height) / int(cfg["analysisSize"])
    size = (round(width / factor), round(height / factor))
    a, b = feature(reference, size), feature(generated, size)
    half = round(cfg["patchSizePx"] / factor / 2)
    radius = round(cfg["searchRadiusPx"] / factor)
    patches = []
    for yi, xi in itertools.product((0.2, 0.5, 0.8), repeat=2):
        cx, cy = round(xi * size[0]), round(yi * size[1])
        ax, ay = cx - half, cy - half
        patch = a[ay:cy + half + 1, ax:cx + half + 1]
        sx, sy = max(0, ax - radius), max(0, ay - radius)
        ex = min(size[0], cx + half + radius + 1)
        ey = min(size[1], cy + half + radius + 1)
        texture = float(patch.std())
        px, py, score, margin, boundary = peak(ncc(b[sy:ey, sx:ex], patch))
        mx, my = sx + px + half, sy + py + half
        bx, by = round(mx) - half, round(my) - half
        matched = b[by:by + patch.shape[0], bx:bx + patch.shape[1]]
        roundtrip = float("inf")
        if matched.shape == patch.shape:
            rx, ry, _, _, _ = peak(ncc(a[sy:ey, sx:ex], matched))
            roundtrip = float(np.hypot(sx + rx + half - cx, sy + ry + half - cy) * factor)
        reasons = []
        if texture < cfg["minTexture"]: reasons.append("low-texture")
        if score < cfg["minNcc"]: reasons.append("low-correlation")
        if margin < cfg["minPeakMargin"]: reasons.append("ambiguous-peak")
        if boundary: reasons.append("search-boundary")
        if roundtrip > cfg["maxRoundTripPx"]: reasons.append("round-trip-mismatch")
        patches.append({"target": [cx * factor, cy * factor],
                        "generated": [mx * factor, my * factor],
                        "ncc": score, "peakMargin": margin, "texture": texture,
                        "roundTripPx": roundtrip if math.isfinite(roundtrip) else None,
                        "trusted": not reasons, "reasons": reasons, "kind": "edge-patch"})
    return patches


def fit_affine(matches: list[dict], cfg: dict, size: tuple[int, int]) -> tuple[dict | None, list[str]]:
    trusted = [p for p in matches if p["trusted"]]
    failures = []
    if len(trusted) < cfg["minMatches"]:
        return None, [f"Only {len(trusted)} trusted landmarks; need {cfg['minMatches']}"]
    target = np.asarray([p["target"] for p in trusted], dtype=np.float64)
    generated = np.asarray([p["generated"] for p in trusted], dtype=np.float64)
    coverage = np.ptp(target, axis=0) / np.asarray(size)
    if float(coverage.min()) < cfg["minCoverage"]:
        failures.append("Landmarks do not span enough of both sector axes")
    design = np.column_stack((target, np.ones(len(target))))
    best_mask, best_key = None, (-1, -float("inf"))
    for triple in itertools.combinations(range(len(trusted)), 3):
        if abs(np.linalg.det(design[list(triple)])) < 1e-6:
            continue
        candidate = np.linalg.solve(design[list(triple)], generated[list(triple)])
        errors = np.linalg.norm(design @ candidate - generated, axis=1)
        mask = errors <= cfg["ransacResidualPx"]
        key = (int(mask.sum()), -float(np.median(errors[mask])) if mask.any() else -float("inf"))
        if key > best_key:
            best_mask, best_key = mask, key
    if best_mask is None or best_mask.sum() < cfg["minMatches"]:
        return None, failures + ["No robust affine fit has enough distributed inliers"]
    affine = np.linalg.lstsq(design[best_mask], generated[best_mask], rcond=None)[0].T
    residual = np.linalg.norm(design @ affine.T - generated, axis=1)
    inliers = residual <= cfg["ransacResidualPx"]
    if not inliers.any():
        return None, failures + ["Affine refit has no reliable landmark inliers"]
    if int(inliers.sum()) < cfg["minMatches"]:
        failures.append("Affine refit lost too many reliable landmark inliers")
    inlier_coverage = np.ptp(target[inliers], axis=0) / np.asarray(size)
    if float(inlier_coverage.min()) < cfg["minCoverage"]:
        failures.append("Affine inliers do not span enough of both sector axes")
    linear = affine[:, :2]
    _, singular, _ = np.linalg.svd(linear)
    rotation = math.degrees(math.atan2(linear[1, 0] - linear[0, 1],
                                      linear[0, 0] + linear[1, 1]))
    shear = abs(float(np.dot(linear[:, 0], linear[:, 1]))) / max(
        float(np.linalg.norm(linear[:, 0]) * np.linalg.norm(linear[:, 1])), 1e-9)
    corners = np.array([[0, 0], [size[0] - 1, 0], [0, size[1] - 1],
                        [size[0] - 1, size[1] - 1]], dtype=np.float64)
    mapped = np.column_stack((corners, np.ones(4))) @ affine.T
    drift = np.linalg.norm(mapped - corners, axis=1)
    overflow = max(0.0, float(-mapped.min()), float(mapped[:, 0].max() - (size[0] - 1)),
                   float(mapped[:, 1].max() - (size[1] - 1)))
    rms = float(np.sqrt(np.mean(residual[inliers] ** 2))) if inliers.any() else float("inf")
    p90, maximum = float(np.percentile(residual, 90)), float(residual.max())
    checks = [
        (float(inliers.mean()) < cfg["minInlierFraction"], "Too many local landmark outliers"),
        (rms > cfg["maxRmsPx"], "Affine inlier RMS exceeds bound"),
        (p90 > cfg["maxP90Px"], "Landmark residual p90 exceeds bound"),
        (maximum > cfg["maxLocalResidualPx"], "Significant local layout drift"),
        (float(np.max(np.abs(singular - 1))) > cfg["maxScaleDeviation"], "Scale correction exceeds near-unit bound"),
        (abs(rotation) > cfg["maxRotationDeg"], "Rotation correction exceeds small-angle bound"),
        (shear > cfg["maxShear"], "Shear correction exceeds bound"),
        (float(np.linalg.norm(affine[:, 2])) > cfg["maxTranslationPx"], "Global translation exceeds bound"),
        (float(drift.max()) > cfg["maxCornerDriftPx"], "Corner drift exceeds bound"),
        (overflow > cfg["guardBorderPx"], "Correction needs more border pixels than the guard permits"),
        (np.linalg.det(linear) <= 0, "Affine would reflect the image"),
    ]
    failures += [reason for failed, reason in checks if failed]
    for p, error, inside in zip(trusted, residual, inliers):
        p["residualPx"], p["inlier"] = float(error), bool(inside)
    report = {"targetToGeneratedAffine": affine.tolist(), "singularScales": singular.tolist(),
              "rotationDeg": rotation, "shear": shear, "translationPx": affine[:, 2].tolist(),
              "cornerDriftPx": drift.tolist(), "borderExtensionNeededPx": overflow,
              "coverageFraction": coverage.tolist(), "inlierCoverageFraction": inlier_coverage.tolist(),
              "inlierCount": int(inliers.sum()),
              "matchCount": len(trusted), "inlierFraction": float(inliers.mean()),
              "inlierRmsPx": rms, "allMatchesP90Px": p90, "allMatchesMaxPx": maximum}
    return report, failures


def image_record(path: Path, base: Path, size: tuple[int, int] | None = None) -> dict:
    if size is None:
        with Image.open(path) as image:
            size = image.size
    return {"path": rel(path, base), "width": size[0], "height": size[1],
            "bytes": path.stat().st_size, "sha256": sha(path)}


def diagnostic(reference: Image.Image, generated: Image.Image, matches: list[dict], path: Path) -> None:
    ratio = 616 / reference.width
    view_size = (616, round(reference.height * ratio))
    view = Image.new("RGB", (view_size[0] * 2, view_size[1] + 30), "#172b2d")
    view.paste(reference.resize(view_size, Image.Resampling.LANCZOS), (0, 30))
    view.paste(generated.resize(view_size, Image.Resampling.LANCZOS), (616, 30))
    draw = ImageDraw.Draw(view)
    draw.text((8, 8), "Layout reference (measurement only)", fill="white")
    draw.text((624, 8), "Generated normalized sector / measured landmarks", fill="white")
    for i, p in enumerate(matches):
        color = "#52ff91" if p["trusted"] and p.get("inlier", True) else "#ff6978"
        for side, coordinate in enumerate((p["target"], p["generated"])):
            x, y = coordinate[0] * ratio + side * 616, coordinate[1] * ratio + 30
            draw.ellipse((x - 4, y - 4, x + 4, y + 4), outline=color, width=2)
            draw.text((x + 6, y - 5), str(i + 1), fill=color)
    path.parent.mkdir(parents=True, exist_ok=True)
    view.save(path)


def analyze_sector(sector: dict, source: Image.Image, world: tuple[int, int], base: Path,
                   out: Path, cfg: dict, generated_override: Path | None = None) -> dict:
    sid, rect = sector["id"], sector.get("rect", sector.get("rectangle", RECTS.get(sector["id"])))
    if rect != RECTS.get(sid):
        raise ValueError(f"{sid}: rectangle must be the recorded new Van Ngoc six-sector rectangle")
    width, height = rect[2] - rect[0], rect[3] - rect[1]
    path = generated_override or resolve(base, sector.get("generated") or sector.get("raw"), f"generated/{sid}.png")
    record = {"id": sid, "rect": rect, "status": "missing", "blockers": [],
              "ownerApproved": False, "artApproved": False, "nativeDetailVerified": False,
              "exactFootprintVerified": False, "caution": CAUTION}
    visual = sector.get("visualReview", {"status": "pending"})
    if not isinstance(visual, dict) or visual.get("status") not in ("pending", "accepted", "rejected"):
        raise ValueError(f"{sid}: visualReview requires pending/accepted/rejected status")
    if visual["status"] != "pending" and (not visual.get("reviewer") or not visual.get("evidence")):
        raise ValueError(f"{sid}: completed visualReview requires reviewer and evidence")
    record["visualReview"] = visual
    if not path.exists():
        record["blockers"] = [f"Generated source does not exist: {path}"]
        return record
    original_hash = sha(path)
    with Image.open(path) as image:
        image.load()
        raw = image.convert("RGB")
        if (("A" in image.getbands() or "transparency" in image.info) and
                image.convert("RGBA").getchannel("A").getextrema() != (255, 255)):
            record["blockers"].append("Generated map source contains nonopaque alpha")
    record["raw"] = image_record(path, base, raw.size)
    if original_hash != record["raw"]["sha256"]:
        raise ValueError(f"{sid}: raw image changed while it was being read")
    aspect = abs((raw.width / raw.height) / (width / height) - 1)
    normalization = {"from": list(raw.size), "to": [width, height],
                     "resampling": "bicubic only if size differs", "aspectDeviation": aspect,
                     "sectorUpsampled": raw.width < width or raw.height < height,
                     "note": "Resolution normalization cannot create or verify native detail."}
    record["normalization"] = normalization
    normalized = raw if raw.size == (width, height) else raw.resize((width, height), Image.Resampling.BICUBIC)
    sx, sy = source.width / world[0], source.height / world[1]
    source_box = (round(rect[0] * sx), round(rect[1] * sy), round(rect[2] * sx), round(rect[3] * sy))
    reference = source.crop(source_box).resize((width, height), Image.Resampling.LANCZOS)
    record["measurementReference"] = {"sourceCropPx": list(source_box), "normalizedSize": [width, height],
                                      "usage": "layout measurement only; never delivered as ART"}
    r = cfg["registration"]
    matches = match_patches(reference, normalized, r)
    manual = sector.get("registration", {}).get("landmarks", [])
    if manual:
        if not isinstance(manual, list):
            raise ValueError(f"{sid}: manual registration landmarks must be an array")
        for p in manual:
            if not isinstance(p, dict) or any(k not in p for k in ("target", "generated")):
                raise ValueError(f"{sid}: manual landmarks need target/generated [x,y]")
            for name in ("target", "generated"):
                if len(p[name]) != 2 or any(not isinstance(x, (float, int)) or not math.isfinite(x) for x in p[name]):
                    raise ValueError(f"{sid}: invalid manual landmark coordinates")
                if not (0 <= p[name][0] < width and 0 <= p[name][1] < height):
                    raise ValueError(f"{sid}: manual landmark is outside normalized sector")
            matches.append({"target": p["target"], "generated": p["generated"],
                            "kind": "manual-landmark", "trusted": True, "reasons": [],
                            "measuredBy": p.get("measuredBy", "unspecified")})
    fit, failures = fit_affine(matches, r, (width, height))
    failures += record["blockers"]
    if aspect > r["maxAspectDeviation"]:
        failures.append("Returned aspect ratio would require excessive anisotropic normalization")
    record["patches"], record["fit"], record["blockers"] = matches, fit, failures
    diag = out / "diagnostics" / f"{sid}-alignment.png"
    diagnostic(reference, normalized, matches, diag)
    record["diagnostic"] = image_record(diag, base)
    if failures or fit is None:
        record["status"] = "blocked"
        return record
    guard = int(r["guardBorderPx"])
    padded = Image.fromarray(np.pad(np.asarray(normalized), ((guard, guard), (guard, guard), (0, 0)), mode="edge"))
    matrix = np.asarray(fit["targetToGeneratedAffine"])
    matrix[:, 2] += guard
    registered = padded.transform((width, height), Image.Transform.AFFINE, tuple(matrix.flatten()),
                                  resample=Image.Resampling.BICUBIC)
    target = out / "registered" / f"{sid}.png"
    if target.resolve() == path.resolve():
        raise ValueError(f"{sid}: registered output would overwrite its original generated source")
    target.parent.mkdir(parents=True, exist_ok=True)
    registered.save(target)
    record["status"] = "registration-passed-awaiting-visual-review"
    record["registered"] = image_record(target, base, registered.size)
    record["guard"] = {"sizePx": guard, "method": "edge extension only for bounded affine sampling",
                       "extensionUsedPx": fit["borderExtensionNeededPx"]}
    return record


def seam_path(cost: np.ndarray, margin: int) -> np.ndarray:
    """Top-to-bottom minimum-cost seam, with at most one horizontal pixel per row."""
    height, width = cost.shape
    if width <= 2 * margin + 2:
        raise ValueError("Overlap is too narrow for the seam margin")
    bounded = cost.copy()
    bounded[:, :margin], bounded[:, width - margin:] = np.inf, np.inf
    previous = bounded[0].copy()
    parents = np.zeros((height, width), dtype=np.int8)
    for y in range(1, height):
        options = np.vstack((np.r_[np.inf, previous[:-1]], previous,
                             np.r_[previous[1:], np.inf]))
        choice = options.argmin(axis=0)
        parents[y] = choice - 1
        previous = bounded[y] + options[choice, np.arange(width)]
    path = np.empty(height, dtype=np.int32)
    path[-1] = int(previous.argmin())
    for y in range(height - 1, 0, -1):
        path[y - 1] = path[y] + parents[y, path[y]]
    return path


def stitch_pair(old: np.ndarray, new: np.ndarray, overlap: int, horizontal: bool,
                cfg: dict, seam_name: str,
                offset_bounds: tuple[np.ndarray, np.ndarray] | None = None) -> tuple[np.ndarray, dict]:
    # Transposition lets the same vertical-seam code handle a top/bottom join.
    if not horizontal:
        old, new = old.transpose(1, 0, 2), new.transpose(1, 0, 2)
    old = old.astype(np.float32)
    new = new.astype(np.float32)
    a, b = old[:, -overlap:], new[:, :overlap]
    raw_difference = np.abs(a - b).mean(axis=2)
    stable = raw_difference <= np.percentile(raw_difference, 50)
    requested = np.median((a - b)[stable], axis=0)
    lower, upper = (-cfg["maxRgbOffset"], cfg["maxRgbOffset"])
    if offset_bounds is not None:
        lower, upper = offset_bounds
    correction = np.clip(requested, lower, upper)
    new = np.clip(new + correction, 0, 255)
    b = new[:, :overlap]
    difference = np.abs(a - b).mean(axis=2)
    ga, gb = np.gradient(a.mean(axis=2)), np.gradient(b.mean(axis=2))
    edge = np.hypot(*ga) + np.hypot(*gb)
    cost = difference + cfg["edgeWeight"] * edge
    path = seam_path(cost, int(cfg["seamMarginPx"]))
    width = cfg["blendWidthPx"]
    alpha = np.clip((np.arange(overlap)[None, :] - path[:, None] + width / 2) / width, 0, 1)[..., None]
    blended = a * (1 - alpha) + b * alpha
    result = np.concatenate((old[:, :-overlap], blended, new[:, overlap:]), axis=1)
    start = old.shape[1] - overlap
    points = [[start + int(x), int(y)] if horizontal else [int(y), start + int(x)]
              for y, x in enumerate(path)]
    selected = difference[np.arange(len(path)), path]
    report = {"id": seam_name, "orientation": "vertical" if horizontal else "horizontal",
              "overlapPx": overlap, "blendWidthPx": width,
              "rgbOffsetRequested": requested.tolist(), "rgbOffsetApplied": correction.tolist(),
              "rgbOffsetClipped": bool(np.any(np.abs(requested - correction) > 1e-5)),
              "differenceBeforeMean": float(raw_difference.mean()), "differenceAfterMean": float(difference.mean()),
              "seamDifferenceMean": float(selected.mean()), "seamDifferenceP90": float(np.percentile(selected, 90)),
              "pathPx": points, "visualReviewRequired": True,
              "visualWarnings": (["High source difference along seam; inspect native architecture/routes"]
                                 if float(np.percentile(selected, 90)) > 45 else [])}
    result = np.clip(np.rint(result), 0, 255).astype(np.uint8)
    return (result if horizontal else result.transpose(1, 0, 2)), report


def self_test() -> None:
    rng = np.random.default_rng(61012)
    search = rng.normal(size=(35, 39))
    patch = search[9:20, 13:26]
    scores = ncc(search, patch)
    assert np.unravel_index(scores.argmax(), scores.shape) == (9, 13)
    assert abs(float(scores[9, 13]) - 1) < 1e-10
    # Tests arrays and equations only; no fixture ART or output images are created.
    cost = np.full((30, 50), 20.0)
    cost[:, 25] = 0
    assert np.array_equal(seam_path(cost, 8), np.full(30, 25))
    matches = [{"target": [x, y], "generated": [x + 2, y - 1], "trusted": True}
               for x, y in itertools.product((246, 616, 986), repeat=2)]
    fit, failures = fit_affine(matches, DEFAULTS["registration"], (1232, 1232))
    assert fit and not failures, failures
    assert np.allclose(fit["targetToGeneratedAffine"], [[1, 0, 2], [0, 1, -1]], atol=1e-10)
    matches[-1]["generated"] = [1030, 1018]
    _, failures = fit_affine(matches, DEFAULTS["registration"], (1232, 1232))
    assert failures, "Local drift must not pass the affine gate"
    stitch_cfg = {**DEFAULTS["stitch"], "seamMarginPx": 4}
    gradient = np.repeat(np.arange(100, dtype=np.uint8)[None, :, None], 40, axis=0)
    gradient = np.repeat(gradient, 3, axis=2)
    left, right = gradient[:, :60].copy(), gradient[:, 40:].copy() + 5
    original_left, original_right = left.copy(), right.copy()
    stitched, join = stitch_pair(left, right, 20, True, stitch_cfg, "self-test")
    assert np.array_equal(stitched, gradient)
    assert np.array_equal(left, original_left) and np.array_equal(right, original_right)
    assert join["rgbOffsetApplied"] == [-5, -5, -5]
    vertical, _ = stitch_pair(left.transpose(1, 0, 2), right.transpose(1, 0, 2),
                              20, False, stitch_cfg, "self-test-vertical")
    assert np.array_equal(vertical, gradient.transpose(1, 0, 2))
    _, clipped = stitch_pair(left, right, 20, True, stitch_cfg, "self-test-bounded",
                            (np.array([-2, -2, -2]), np.array([1, 1, 1])))
    assert clipped["rgbOffsetApplied"] == [-2, -2, -2] and clipped["rgbOffsetClipped"]
    print("self-test: NCC, DP seam, near-unit affine, local drift rejection, both stitch axes, "
          "RGB limits and input preservation passed; no ART written")
