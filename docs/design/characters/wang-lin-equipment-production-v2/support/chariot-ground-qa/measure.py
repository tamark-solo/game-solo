#!/usr/bin/env python3
"""Read-only QA for the Xạ Thần Xa directional gear registration.

This helper never edits gear, actor, runtime, or source images. It audits the
16 existing full/front/rear PNGs and emits measurement/verification JSON in
this support folder. Run from the repository root:

    python support/chariot-ground-qa/measure.py

Use --check-only to validate without writing the two JSON reports.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Pillow is required for chariot ground QA") from exc

HERE = Path(__file__).resolve().parent
DEFAULT_ROOT = HERE.parents[5]
REG_REL = Path("docs/design/characters/wang-lin-equipment-production-v2/gear/chariot/registration.json")
BRIEF_REL = Path("docs/design/characters/wang-lin-equipment-production-v2/support/p5-next-family-briefs/chariot")
DIRECTIONS = ("north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest")
IDENTITIES = {"a": "Huyễn Tâm", "b": "Tịch Bạch"}
EXPECTED_VIEWS = {f"chariot-{identity}-{direction}" for identity in IDENTITIES for direction in DIRECTIONS}
PNG_EXTS = {".png", ".webp"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def rel_or_absolute(root: Path, raw: str) -> Path:
    p = Path(raw)
    if p.is_absolute():
        return p
    # Registration paths are relative to its owning v2 package, except
    # ../wang-lin-equipment-production-v1 paths which resolve the same way.
    return (root / "docs/design/characters/wang-lin-equipment-production-v2" / p).resolve()


def alpha_bounds(path: Path) -> dict[str, Any]:
    with Image.open(path) as image:
        rgba = image.convert("RGBA")
        width, height = rgba.size
        pix = rgba.load()
        occupied = [(x, y) for y in range(height) for x in range(width) if pix[x, y][3] >= 128]
        if occupied:
            xs = [p[0] for p in occupied]
            ys = [p[1] for p in occupied]
            bounds = [min(xs), min(ys), max(xs), max(ys)]
            edge = {
                "left": bounds[0] == 0,
                "top": bounds[1] == 0,
                "right": bounds[2] == width - 1,
                "bottom": bounds[3] == height - 1,
            }
        else:
            bounds, edge = None, {k: False for k in ("left", "top", "right", "bottom")}
        return {
            "dimensions": [width, height],
            "alpha128Pixels": sum(1 for y in range(height) for x in range(width) if pix[x, y][3] >= 128),
            "alphaAnyPixels": sum(1 for y in range(height) for x in range(width) if pix[x, y][3] > 0),
            "alphaBounds": bounds,
            "touchesCanvasEdge": edge,
        }


def check(condition: bool, name: str, detail: str = "") -> dict[str, Any]:
    return {"name": name, "pass": bool(condition), **({"detail": detail} if detail else {})}


def resolve_source(root: Path, raw: str) -> Path:
    return rel_or_absolute(root, raw)


def record_measurement(root: Path, rec: dict[str, Any], checks: list[dict[str, Any]]) -> dict[str, Any]:
    full = resolve_source(root, rec["fullFile"])
    checks.append(check(full.exists(), f"{rec['id']}-full-exists", str(full)))
    if full.exists():
        actual = sha256(full)
        checks.append(check(actual == rec.get("fullSha256"), f"{rec['id']}-full-sha256", f"expected {rec.get('fullSha256')} got {actual}"))
        full_meta = alpha_bounds(full)
    else:
        actual, full_meta = None, {"dimensions": None, "alpha128Pixels": 0, "alphaAnyPixels": 0, "alphaBounds": None, "touchesCanvasEdge": {}}
    checks.append(check(full_meta["dimensions"] == rec.get("canvas"), f"{rec['id']}-full-canvas", f"expected {rec.get('canvas')} got {full_meta['dimensions']}"))
    checks.append(check(full_meta["alpha128Pixels"] > 0, f"{rec['id']}-full-opaque", "device must contain alpha>=128 pixels"))
    checks.append(check(not any(full_meta["touchesCanvasEdge"].values()), f"{rec['id']}-full-gutter", str(full_meta["touchesCanvasEdge"])))

    layers = {}
    for layer in rec.get("layers", []):
        path = resolve_source(root, layer["file"])
        role = layer.get("role", "unknown")
        checks.append(check(path.exists(), f"{rec['id']}-{role}-exists", str(path)))
        if path.exists():
            got = sha256(path)
            checks.append(check(got == layer.get("sha256"), f"{rec['id']}-{role}-sha256", f"expected {layer.get('sha256')} got {got}"))
            meta = alpha_bounds(path)
        else:
            got, meta = None, {"dimensions": None, "alpha128Pixels": 0, "alphaAnyPixels": 0, "alphaBounds": None, "touchesCanvasEdge": {}}
        checks.append(check(meta["dimensions"] == rec.get("canvas"), f"{rec['id']}-{role}-canvas", f"expected {rec.get('canvas')} got {meta['dimensions']}"))
        checks.append(check((meta["alpha128Pixels"] > 0) if role == "front" else True, f"{rec['id']}-{role}-opaque", "front layer must contain alpha>=128 pixels; rear may be empty in the frozen SE pilot"))
        checks.append(check(not any(meta["touchesCanvasEdge"].values()), f"{rec['id']}-{role}-gutter", str(meta["touchesCanvasEdge"])))
        layers[role] = {"file": layer["file"], "sha256": got, **meta}
    checks.append(check({"front", "rear"}.issubset(layers), f"{rec['id']}-front-rear-present"))

    source = resolve_source(root, rec["source"])
    checks.append(check(source.exists(), f"{rec['id']}-source-exists", str(source)))
    if source.exists():
        source_sha = sha256(source)
        checks.append(check(source_sha == rec.get("sourceSha256"), f"{rec['id']}-source-sha256", f"expected {rec.get('sourceSha256')} got {source_sha}"))
        source_meta = alpha_bounds(source)
    else:
        source_sha, source_meta = None, {"dimensions": None}
    cell = rec.get("sourceCell")
    cell_ok = bool(cell and len(cell) == 4 and cell[2] > 0 and cell[3] > 0 and source_meta.get("dimensions") and cell[0] >= 0 and cell[1] >= 0 and cell[0] + cell[2] <= source_meta["dimensions"][0] and cell[1] + cell[3] <= source_meta["dimensions"][1])
    checks.append(check(cell_ok, f"{rec['id']}-source-cell-in-bounds", f"cell={cell} source={source_meta.get('dimensions')}"))

    ground = rec.get("registeredGround")
    pivot = rec.get("pivot")
    grip = rec.get("registeredGrip")
    ground_ok = bool(isinstance(ground, list) and len(ground) == 2 and all(isinstance(v, (int, float)) and math.isfinite(v) for v in ground) and 0 <= ground[0] < rec["canvas"][0] and 0 <= ground[1] < rec["canvas"][1])
    checks.append(check(ground_ok, f"{rec['id']}-registered-ground-in-canvas", str(ground)))
    near_bottom = bool(ground_ok and ground[1] >= rec["pivot"][1] - 8 and ground[1] <= rec["canvas"][1] - 1)
    checks.append(check(near_bottom, f"{rec['id']}-registered-ground-near-bottom", f"ground={ground} pivot={pivot}"))
    checks.append(check(isinstance(rec.get("sourceGround"), list) and len(rec["sourceGround"]) == 2, f"{rec['id']}-source-ground-recorded"))
    checks.append(check(isinstance(grip, list) and len(grip) == 2, f"{rec['id']}-registered-grip-recorded"))
    policy = rec.get("deviceAnchorPolicy", "")
    checks.append(check("ground-rooted" in policy.lower() and "not drag" in policy.lower(), f"{rec['id']}-ground-root-policy", policy))
    checks.append(check(rec.get("wearerHandAnchor") is None, f"{rec['id']}-no-wearer-hand-anchor"))

    gp = [round(ground[i] - pivot[i], 6) for i in (0, 1)] if ground_ok else None
    gg = [round(ground[i] - grip[i], 6) for i in (0, 1)] if ground_ok and isinstance(grip, list) and len(grip) == 2 else None
    return {
        "id": rec["id"],
        "identityId": rec.get("identityId"),
        "identityName": IDENTITIES.get(rec.get("identityId")),
        "direction": rec.get("direction"),
        "fullFile": rec.get("fullFile"),
        "fullSha256": rec.get("fullSha256"),
        "fullActualSha256": actual,
        "frontFile": next((x.get("file") for x in rec.get("layers", []) if x.get("role") == "front"), None),
        "frontSha256": next((x.get("sha256") for x in rec.get("layers", []) if x.get("role") == "front"), None),
        "frontActualSha256": layers.get("front", {}).get("sha256"),
        "rearFile": next((x.get("file") for x in rec.get("layers", []) if x.get("role") == "rear"), None),
        "rearSha256": next((x.get("sha256") for x in rec.get("layers", []) if x.get("role") == "rear"), None),
        "rearActualSha256": layers.get("rear", {}).get("sha256"),
        "canvas": rec.get("canvas"),
        "pivot": pivot,
        "registeredGrip": grip,
        "source": rec.get("source"),
        "sourceSha256": rec.get("sourceSha256"),
        "sourceActualSha256": source_sha,
        "sourceCell": cell,
        "sourceScale": rec.get("scale"),
        "sourceGround": rec.get("sourceGround"),
        "registeredGround": ground,
        "groundMinusPivot": gp,
        "groundMinusGrip": gg,
        "measurementUncertaintyNativePx": 1.0,
        "measurementUncertaintyReason": "Source ground is an explicitly recorded wheel/apparatus endpoint; uncertainty is retained as a one-native-pixel review tolerance. No bone or hand estimate is substituted.",
        "groundMethod": "Read-only audit of registeredGround against the immutable full/front/rear layers. Deployment root uses this wheel/device endpoint and a world offset; it does not drag the device from a body hand socket.",
        "supportPlane": {
            "kind": "wheel-ground-endpoint",
            "coordinateSpace": "native-pivot-local",
            "sourceAnchor": "sourceGround",
            "nativeAnchor": "registeredGround",
            "worldPlacement": "caster-origin + reviewed presentation offset",
            "uncertaintyNativePx": 1.0,
            "handDrag": False,
        },
        "fullMeta": full_meta,
        "layers": layers,
        "ownerApproved": bool(rec.get("ownerApproved")),
        "runtimeIntegrated": bool(rec.get("runtimeIntegrated")),
        "deviceAnchorPolicy": policy,
    }


def lineage_check(root: Path) -> dict[str, Any]:
    plan_path = root / BRIEF_REL / "plan.json"
    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    checks: list[dict[str, Any]] = []
    jobs = plan.get("jobs", [])
    checks.append(check(len(jobs) == 48, "lineage-48-jobs", f"got {len(jobs)}"))
    ready = 0
    groups: dict[str, int] = {}
    missing: list[str] = []
    wrong_roles: list[str] = []
    for job in jobs:
        jid = job.get("id", "")
        groups[job.get("group", "unknown")] = groups.get(job.get("group", "unknown"), 0) + 1
        prompt_raw = job.get("prompt")
        prompt = root / "docs/design/characters/wang-lin-equipment-production-v2/support/p5-next-family-briefs" / prompt_raw if prompt_raw else None
        prompt_ok = bool(prompt and prompt.exists())
        checks.append(check(prompt_ok, f"{jid}-prompt-exists", str(prompt)))
        if not prompt_ok:
            missing.append(f"prompt:{jid}")
        if prompt_ok:
            got = sha256(prompt)
            checks.append(check(got == job.get("promptSha256"), f"{jid}-prompt-sha256", f"expected {job.get('promptSha256')} got {got}"))
        inputs = job.get("inputs", [])
        input_ok = True
        for entry in inputs:
            raw = entry.get("file")
            # Absolute entries are intended external pinned Wang support and
            # are allowed only when the plan explicitly marks them ready.
            p = Path(raw) if raw and Path(raw).is_absolute() else (root / "docs/design/characters/wang-lin-equipment-production-v2/support/p5-next-family-briefs" / raw if raw else None)
            exists = bool(p and p.exists())
            if entry.get("ready") and not exists:
                input_ok = False
                missing.append(f"input:{jid}:{entry.get('index')}")
            checks.append(check((not entry.get("ready")) or exists, f"{jid}-input-{entry.get('index')}-exists", str(p)))
            role = entry.get("role", "")
            if entry.get("index") == 1:
                role_ok = ("own" in role.lower() and "primary" in role.lower())
                wrong_roles.extend([] if role_ok else [f"{jid}:input1:{role}"])
                checks.append(check(role_ok, f"{jid}-input1-own-primary", role))
            if entry.get("index") == 2:
                role_ok = "wang" in role.lower() and "support" in role.lower()
                wrong_roles.extend([] if role_ok else [f"{jid}:input2:{role}"])
                checks.append(check(role_ok, f"{jid}-input2-wang-support-only", role))
            if entry.get("index") == 3:
                role_ok = "own" in role.lower() and "support" in role.lower()
                wrong_roles.extend([] if role_ok else [f"{jid}:input3:{role}"])
                checks.append(check(role_ok, f"{jid}-input3-own-support", role))
        if input_ok and all(x.get("ready") for x in inputs):
            ready += 1
        checks.append(check(job.get("generationAllowed") is False, f"{jid}-generation-closed", str(job.get("generationAllowed"))))
        checks.append(check(job.get("rawProduced") is False, f"{jid}-raw-not-produced-yet", str(job.get("rawProduced"))))
    checks.append(check(groups == {"core": 16, "damage": 16, "practice": 16}, "lineage-groups", str(groups)))
    checks.append(check(not wrong_roles, "lineage-input-role-policy", str(wrong_roles)))
    return {
        "schema": "chariot-body-lineage-checklist-1",
        "date": "2026-10-14",
        "familyId": "chariot",
        "sourcePlan": str(BRIEF_REL / "plan.json").replace("\\", "/"),
        "jobs": len(jobs),
        "readyJobs": ready,
        "inputPolicy": {
            "input1": "own-P1 or own same-view chariot identity PRIMARY; this controls face/outfit/identity",
            "input2": "Wang same-view nearest8x only for anatomy/proportion/pixel camera support",
            "input3": "own same-family full source support; never overrides input1/view identity",
            "noMirrorOrRotation": True,
            "noSwordBannerPixelFallback": True,
            "actualGenerationMustRecord": ["raw path", "raw SHA-256", "original ImageGen path", "prompt SHA-256", "input snapshot SHA-256", "transparentRequested", "tool=built-in ImageGen"],
        },
        "missingReadyInputs": missing,
        "checks": checks,
        "passed": all(item["pass"] for item in checks),
        "bodyWorkersNext": "After each own neutral/core source is reviewed, snapshot exact bytes as input1/2/3, record actual source geometry/scale/root, then allow body generation. Chariot device remains ground-rooted; body does not hold the command loop.",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    ap.add_argument("--check-only", action="store_true", help="do not write reports")
    args = ap.parse_args()
    root = args.root.resolve()
    reg_path = root / REG_REL
    reg_sha = sha256(reg_path)
    reg = json.loads(reg_path.read_text(encoding="utf-8"))
    checks: list[dict[str, Any]] = []
    records = reg.get("records", [])
    checks.append(check(len(records) == 16, "registration-16-records", f"got {len(records)}"))
    ids = {r.get("id") for r in records}
    checks.append(check(ids == EXPECTED_VIEWS, "registration-identity-direction-matrix", f"missing={sorted(EXPECTED_VIEWS - ids)} extra={sorted(ids - EXPECTED_VIEWS)}"))
    checks.append(check(all(r.get("familyId") == "chariot" for r in records), "registration-family-chariot"))
    measurements = [record_measurement(root, r, checks) for r in records]
    checks.append(check(all(m["ownerApproved"] is False for m in measurements), "registration-owner-approval-remains-false"))
    checks.append(check(all(m["runtimeIntegrated"] is False for m in measurements), "registration-runtime-remains-false"))
    lineage = lineage_check(root)
    checks.extend(lineage["checks"])
    passed = all(c["pass"] for c in checks) and lineage["passed"]
    report = {
        "schema": "chariot-ground-device-measurement-1",
        "date": "2026-10-14",
        "familyId": "chariot",
        "registrationFile": str(REG_REL).replace("\\", "/"),
        "registrationSha256": reg_sha,
        "coverage": len(measurements),
        "identities": {k: sum(1 for m in measurements if m["identityId"] == k) for k in IDENTITIES},
        "directions": DIRECTIONS,
        "records": measurements,
        "groundPolicy": {
            "deviceRoot": "registeredGround / wheel-ground endpoint",
            "worldPresentationOffsetPx": [55, 0],
            "offsetStatus": "review fixture only; not range, collision, or balance",
            "handAnchor": None,
            "handMeaning": "command palm cue only; never a command-loop grip",
            "uncertaintyNativePx": 1.0,
            "supportPlane": "wheel-ground-endpoint; registeredGround is the only deployment root",
            "noHandDrag": True,
            "noEntityRotation": True,
            "noMirror": True,
        },
        "checks": len(checks),
        "passed": passed,
        "ownerApproved": False,
        "runtimeIntegrated": False,
    }
    verification = {
        "schema": "chariot-ground-device-verification-1",
        "date": "2026-10-14",
        "familyId": "chariot",
        "registrationSha256": reg_sha,
        "coverage": len(measurements),
        "checks": len(checks),
        "passed": passed,
        "failed": [c for c in checks if not c["pass"]],
        "details": checks,
        "lineage": {"checks": len(lineage["checks"]), "passed": lineage["passed"], "readyJobs": lineage["readyJobs"], "jobs": lineage["jobs"]},
        "gearModified": False,
        "ownerApproved": False,
        "runtimeIntegrated": False,
    }
    if not args.check_only:
        (HERE / "measurement.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (HERE / "verification.json").write_text(json.dumps(verification, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (HERE / "lineage-checklist.json").write_text(json.dumps(lineage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"passed": passed, "coverage": len(measurements), "checks": len(checks), "lineageJobs": lineage["jobs"], "lineageReadyJobs": lineage["readyJobs"], "failed": len(verification["failed"])}, ensure_ascii=False))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
