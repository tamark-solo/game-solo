"""Record one future built-in ImageGen Bead source after the parent opens the gate.

This helper is intentionally fail-closed: it performs no generation, requires
an explicit Chariot checkpoint release, preserves the original tool output and
refuses to replace an existing raw source.
"""
from __future__ import annotations

from pathlib import Path
import hashlib
import json
import shutil
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parent
V2 = ROOT.parents[2]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(source_id: str, original: str) -> None:
    ledger_path = ROOT / "generation.json"
    ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
    if not ledger.get("generationAllowed"):
        raise RuntimeError("Bead generation is locked; parent must explicitly open the Chariot-gated P5 step")
    gate = V2 / "checkpoints/chariot.json"
    released = ledger.get("releasedGate") or {}
    if not gate.exists() or sha(gate) != released.get("sha256"):
        raise RuntimeError("Exact Chariot checkpoint release is required before Bead source recording")
    if (ROOT / "approval.json").exists() or (V2 / "approval.json").exists():
        raise RuntimeError("Approved package is write-locked")
    record = next((item for item in ledger["records"] if item["id"] == source_id), None)
    if record is None:
        raise KeyError(source_id)
    if not record.get("inputSnapshotsReady"):
        raise RuntimeError("Same-view own Bead core neutral/input snapshots are not ready")
    if sha(V2 / record["prompt"]) != record["promptSha256"]:
        raise RuntimeError("Immutable prompt hash changed")
    for item in record["inputs"]:
        if not item.get("file") or sha(V2 / item["file"]) != item.get("sha256"):
            raise RuntimeError(f"Immutable input hash changed: {item}")
    original_path = Path(original).resolve()
    if not original_path.exists():
        raise FileNotFoundError(original_path)
    target = V2 / record["raw"]
    if target.exists():
        raise RuntimeError("Original raw cannot be replaced; add a corrective sibling source")
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(original_path, target)
    with Image.open(target) as image:
        if image.mode != "RGBA":
            raise RuntimeError(f"Bead source must be RGBA, got {image.mode}")
        size = list(image.size)
    record.update({"original": str(original_path), "originalSha256": sha(original_path), "sha256": sha(target), "size": size, "mode": "RGBA", "status": "generated", "selected": True, "sourceViewed": True, "rawImmutable": True, "transparentRequested": True})
    ledger["actualCoverage"]["generatedSources"] = sum(item.get("status") == "generated" for item in ledger["records"])
    tmp = ledger_path.with_suffix(".json.next")
    tmp.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(ledger_path)
    print(json.dumps({"id": source_id, "size": size, "sha256": record["sha256"]}))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: record.py <source-id> <original-image-path>")
    run(sys.argv[1], sys.argv[2])
