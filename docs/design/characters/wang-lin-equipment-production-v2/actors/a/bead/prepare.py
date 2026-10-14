"""Prepare (but never dispatch) the Thiên Nghịch Châu body source jobs for Huyễn Tâm.

This is deliberately a non-destructive gate.  It copies only the immutable
prompt/input snapshots that are already present in the bead brief and writes a
generation ledger with generationAllowed=false.  ImageGen, source writers and
packers are separate steps after the parent task opens the P5 gate.
"""
from __future__ import annotations

from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent
V2 = ROOT.parents[2]
BRIEF = V2 / "support/p5-next-family-briefs/bead"
PLAN = json.loads((BRIEF / "plan.json").read_text(encoding="utf-8"))
IDENTITY = "a"
PREFIX = "actors/a/bead/"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rel(path: Path) -> str:
    return str(path.relative_to(V2)).replace("\\", "/")


def main() -> None:
    if (ROOT / "generation.json").exists():
        raise RuntimeError("Bead A preparation already exists; do not overwrite source history")
    for name in ("inputs", "inputs/core", "sources", "prompts", "review", "tool"):
        (ROOT / name).mkdir(parents=True, exist_ok=True)

    records = []
    checks: list[str] = []
    jobs = [job for job in PLAN["jobs"] if job["identityId"] == IDENTITY]
    assert len(jobs) == 24, len(jobs)

    # Keep the three approved P1 bytes available as explicit provenance, without
    # editing the V1 package.  These are supporting inputs, never generated art.
    own = {
        "source": BRIEF / "inputs/a/p1-source.png",
        "native": BRIEF / "inputs/a/p1-native.png",
        "nearest8x": BRIEF / "inputs/a/p1-nearest8x.png",
    }
    for label, src in own.items():
        assert src.exists(), src
        dst = ROOT / "inputs" / f"huyen-tam-bead-p1-{label}.png"
        shutil.copyfile(src, dst)
        assert sha(dst) == sha(src)
        checks.append(f"own:{label}:{sha(dst)}")

    for job in jobs:
        group = job["group"]
        sid = job["id"].replace("-planned", "-r1")
        source_prompt = (BRIEF.parent / job["prompt"]) if job["prompt"].startswith("bead/") else (BRIEF / job["prompt"])
        assert source_prompt.exists(), source_prompt
        assert sha(source_prompt) == job["promptSha256"], sid
        prompt_path = ROOT / "prompts" / f"{sid}.txt"
        shutil.copyfile(source_prompt, prompt_path)
        assert sha(prompt_path) == job["promptSha256"]
        checks.append(f"prompt:{sid}:{sha(prompt_path)}")

        input_refs = []
        input_snapshots_ready = False
        if group == "core":
            snap_dir = ROOT / "inputs/core" / sid
            snap_dir.mkdir(parents=True, exist_ok=True)
            for item in job["inputs"]:
                assert item["file"], item
                src = (BRIEF.parent / item["file"]) if item["file"].startswith("bead/") else (BRIEF / item["file"])
                assert src.exists(), src
                assert sha(src) == item["sha256"], (sid, item["file"])
                dst = snap_dir / f"{item['index']}.png"
                shutil.copyfile(src, dst)
                assert sha(dst) == item["sha256"], (sid, item["index"])
                input_refs.append({
                    "file": rel(dst),
                    "sha256": item["sha256"],
                    "original": item.get("original"),
                    "role": item.get("role"),
                    "index": item["index"],
                })
                checks.append(f"input:{sid}:{item['index']}:{item['sha256']}")
            assert len(input_refs) == 3
            input_snapshots_ready = True
        else:
            # Preserve the unresolved dispatch contract byte-for-byte in the
            # ledger.  These snapshots are intentionally made only after the
            # same-view core neutral has been reviewed by the parent.
            for item in job["inputs"]:
                input_refs.append({
                    "file": None,
                    "sha256": None,
                    "original": item.get("file"),
                    "role": item.get("role"),
                    "dependency": item.get("dependency"),
                    "snapshotMade": False,
                })

        records.append({
            "id": sid,
            "identityId": IDENTITY,
            "familyId": "bead",
            "direction": job["direction"],
            "group": group,
            "actions": job["actions"] if isinstance(job["actions"], list) else job["actions"].split(),
            "calibrationCells": 6,
            "prompt": rel(prompt_path),
            "promptSha256": sha(prompt_path),
            "raw": f"{PREFIX}sources/{sid}.png",
            "inputs": input_refs,
            "inputSnapshotsReady": input_snapshots_ready,
            "inputSnapshotPolicy": "Core triplet is immutable now; damage/practice snapshots are deferred until the reviewed same-view Bead core neutral exists. No foreign outfit, Sword/Banner fallback, or mirrored view.",
            "dependency": None if group == "core" else f"bead-a-{job['direction']}-core-r1 reviewed own neutral",
            "tool": "built-in-imagegen",
            "transparentRequested": True,
            "requestedGrid": [6, 5] if group == "core" else [3, 6],
            "requestedSourcePoses": 30 if group == "core" else 18,
            "status": "prepared-awaiting-Chariot128-technical-gate" if group == "core" else "prepared-awaiting-own-reviewed-same-view-neutral",
            "selected": False,
            "ownerApproved": False,
            "runtimeIntegrated": False,
            "planJobId": job["id"],
            "planPromptSha256": job["promptSha256"],
        })

    data = {
        "schema": "equipment-body-generation-v2",
        "identityId": IDENTITY,
        "identityName": "Huyễn Tâm",
        "familyId": "bead",
        "date": "2026-10-14",
        "generationAllowed": False,
        "requiredGate": "Explicit parent release after Chariot128 scoped CPU/lineage/browser/Three and checkpoint. Preparation is not generation dispatch.",
        "records": records,
        "forecast": {"sourceSheets": 24, "clips": 64, "motionKeysAtSixEach": 384, "neutralCalibrationAtSixEach": 144, "sourcePosesRequested": 528},
        "actualCoverage": {"generatedSources": 0, "clips": 0, "motionKeys": 0},
        "ownerApproved": False,
        "runtimeIntegrated": False,
        "choreographyPolicy": "Empty dominant palm-up hover anchor; Bead is separate prop/FX. No embedded orb, no grip, no fake eight-view apparition rotation. AOE veil/temple/mountain belongs to fixed-camera FX.",
    }
    (ROOT / "generation.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    recipe = {
        "schema": "equipment-A-bead-pack-recipe-v1",
        "status": "prepared-no-generated-body",
        "bodyNominalPx": 80,
        "normalCanvas": [112, 112],
        "normalPivot": [56, 104],
        "deathCanvas": [192, 128],
        "deathPivot": [96, 112],
        "scalePolicy": "One isotropic factor per actual source from six own neutral crown-to-dark-boot measurements; no per-pose fit, mirror, head transplant or orb pixels.",
        "rootPolicy": "Actual supported dark boot soles for upright/run; source-measured seated/prone support with uncertainty and one baked lift; no cloth hem/hair/root proxy.",
        "socketPolicy": "Manual dominant palm/cuff/forearm evidence per source. Palm-up is hover anchor, never a held grip; occluded/fragment states remain explicit with uncertainty.",
        "sourceMaskPolicy": "Raw RGBA is immutable; retain complete hair/hands/cuffs/boots and transparent gutters; no body/FX/temple/orb painted into body.",
        "timingMs": {"idle": [150] * 6, "run": [100] * 6, "hit": [60, 60, 80, 100, 100, 160], "death": [140, 140, 180, 180, 200, 500], "meditate": [260] * 6, "gather": [180, 200, 200, 260, 200, 260], "cast-single-target": [180, 200, 220, 110, 110, 560], "cast-aoe": [280, 310, 310, 450, 700, 590]},
        "releaseMs": {"cast-single-target": 600, "cast-aoe": 900},
        "phaseMapping": "Key four starts fixture release; Core facts own support/control timing. Prop is rendered separately above the actual palm and is never granted by body pixels.",
        "atlas": {"gutter": 2, "rgbaExactCanonicalParity": True, "sampling": "nearest"},
        "pathsRelativeTo": "wang-lin-equipment-production-v2",
        "clipIdTemplate": "bead-a-{direction}-{action}",
        "approvalPolicy": "Technical preparation does not approve Bead ART/motion/runtime; do not modify Sword, Banner, Chariot, V1, runtime, map, DB or receipt.",
    }
    (ROOT / "pack-recipe.json").write_text(json.dumps(recipe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    prep = {"status": "passed", "identityId": IDENTITY, "familyId": "bead", "jobs": 24, "coreJobs": 8, "deferredJobs": 16, "coreInputTriplets": 8, "generatedSources": 0, "generationAllowed": False, "checks": len(checks), "checkItems": checks, "planSha256": sha(BRIEF / "plan.json"), "ownerApproved": False, "runtimeIntegrated": False}
    (ROOT / "review/preparation-verification.json").write_text(json.dumps(prep, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "README.md").write_text("""# Thiên Nghịch Châu · Huyễn Tâm · P5 preparation\n\nThis directory is a non-dispatch preparation ledger for the 24 Huyễn Tâm source jobs (8 directions × core/damage/practice). Core jobs carry exact immutable input snapshots from the approved P1 bead identity, Wang same-view style support, and the own P1 full source. Damage/practice snapshots intentionally remain deferred until the corresponding same-view core neutral is reviewed.\n\nGeneration is locked (`generationAllowed: false`) until the parent task explicitly opens Bead after Chariot technical QA. The body must keep an empty palm-up hover anchor; orb, inner-world veil, temple/mountain apparition and all FX remain separate. This package does not modify runtime, map, DB, receipt or prior families.\n""", encoding="utf-8")
    print(json.dumps({"identity": IDENTITY, "jobs": len(records), "coreInputs": sum(r["inputSnapshotsReady"] for r in records), "deferred": sum(not r["inputSnapshotsReady"] for r in records), "checks": len(checks), "generationAllowed": False}))


if __name__ == "__main__":
    main()



