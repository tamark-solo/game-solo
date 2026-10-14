from pathlib import Path
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent
V2 = ROOT.parents[2]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


generation_path = ROOT / "generation.json"
generation = json.loads(generation_path.read_text(encoding="utf-8"))
registration = json.loads((ROOT / "registration.json").read_text(encoding="utf-8"))
source_for_direction = {}
for clip in registration["clips"]:
    if clip["id"].endswith("-idle"):
        source_for_direction[clip["direction"]] = clip["sourceId"]

changed = []
for record in generation["records"]:
    if record["group"] == "core" or record.get("inputSnapshotsReady"):
        continue
    core_id = source_for_direction[record["direction"]]
    core_input_id = core_id if (ROOT / "inputs" / "core" / core_id).exists() else core_id.replace("-r2", "-r1")
    core_input_dir = ROOT / "inputs" / "core" / core_input_id
    assert core_input_dir.exists(), core_input_dir
    foundation_dir = ROOT / "inputs" / "foundation" / record["id"]
    foundation_dir.mkdir(parents=True, exist_ok=True)
    roles = [
        "own-same-identity-B-chariot-reviewed-neutral-PRIMARY",
        "Wang-same-view-camera-anatomy-style-only",
        "own-B-chariot-same-view-core-full-source-support",
        "own-same-identity-B-same-view-hair-face-camera-support-only-NOT-Banner-outfit",
    ]
    originals = [
        core_input_dir / "1.png",
        core_input_dir / "2.png",
        ROOT / "sources" / f"{core_id}.png",
        core_input_dir / "4.png",
    ]
    inputs = []
    for index, (original, role) in enumerate(zip(originals, roles), 1):
        assert original.exists(), original
        destination = foundation_dir / f"{index}.png"
        if destination.exists():
            assert sha(destination) == sha(original), destination
        else:
            shutil.copy2(original, destination)
        inputs.append({
            "file": str(destination.relative_to(V2)).replace("\\", "/"),
            "sha256": sha(destination),
            "original": str(original.resolve()),
            "role": role,
            "index": index,
        })
    record["inputs"] = inputs
    record["inputSnapshotsReady"] = True
    record["neutralReviewed"] = True
    record["neutralReviewEvidence"] = f"actors/b/chariot/review/{core_id}-marked-2x.png"
    record["neutralReviewEvidenceSha256"] = sha(ROOT / "review" / f"{core_id}-marked-2x.png")
    record["status"] = "reserved-ready-built-in-call"
    record["reservedBy"] = "root"
    changed.append(record["id"])

generation["inputSnapshotPolicy"] = "Foundation sources use exact same-view Tịch Bạch Cart neutral inputs; no Banner, Sword, foreign identity, mirror, or pose-fit fallback."
generation_path.write_text(json.dumps(generation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"prepared": len(changed), "ids": changed, "generationSha256": sha(generation_path)}))
