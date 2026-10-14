from pathlib import Path
import hashlib
import importlib.util
import json
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
V2 = ROOT.parents[2]
BRIEF = V2 / "support/p5-next-family-briefs/bead"
IDENTITY = ROOT.parent.name


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    checks = []
    plan = json.loads((BRIEF / "plan.json").read_text(encoding="utf-8"))
    ledger_path = ROOT / "generation.json"
    ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
    checks.append({"id": "family-identity", "passed": ledger["identityId"] == IDENTITY and ledger["familyId"] == "bead"})
    checks.append({"id": "locked-generation", "passed": ledger["generationAllowed"] is False})
    checks.append({"id": "actual-zero", "passed": ledger["actualCoverage"] == {"generatedSources": 0, "clips": 0, "motionKeys": 0}})
    checks.append({"id": "not-approved-or-runtime", "passed": ledger["ownerApproved"] is False and ledger["runtimeIntegrated"] is False})
    jobs = {job["id"]: job for job in plan["jobs"] if job["identityId"] == IDENTITY}
    checks.append({"id": "24-jobs", "passed": len(jobs) == len(ledger["records"]) == 24})
    directions = {job["direction"] for job in jobs.values()}
    checks.append({"id": "eight-directions", "passed": len(directions) == 8})
    for record in ledger["records"]:
        job = jobs[record["planJobId"]]
        checks.append({"id": "prompt-plan:" + record["id"], "passed": sha(V2 / record["prompt"]) == record["promptSha256"] == job["promptSha256"]})
        checks.append({"id": "call-spec:" + record["id"], "passed": record["tool"] == "built-in-imagegen" and record["transparentRequested"] is True and record["selected"] is False})
        if record["group"] == "core":
            checks.append({"id": "core-triplet:" + record["id"], "passed": record["inputSnapshotsReady"] and len(record["inputs"]) == 3})
            for item in record["inputs"]:
                checks.append({"id": f"input:{record['id']}:{item['index']}", "passed": sha(V2 / item["file"]) == item["sha256"]})
        else:
            checks.append({"id": "deferred-snapshots:" + record["id"], "passed": not record["inputSnapshotsReady"] and all(item["file"] is None and item["sha256"] is None and item["snapshotMade"] is False for item in record["inputs"])})

    # The future recorder must fail before looking at an image or changing the
    # ledger while the parent has not released this family. This proves the
    # preparation is still an inert set of prompt/input artifacts.
    before = sha(ledger_path)
    module_spec = importlib.util.spec_from_file_location(f"bead_record_{IDENTITY}", ROOT / "record.py")
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    try:
        module.run(f"bead-{IDENTITY}-north-core-r1", "nonexistent.png")
        locked = False
    except RuntimeError as error:
        locked = "generation is locked" in str(error)
    checks.append({"id": "record-locked-before-source-read", "passed": locked and sha(ledger_path) == before and not any((ROOT / "sources").glob("*.png"))})
    report = {"schema": "bead-preparation-verification-v2", "status": "passed" if all(item["passed"] for item in checks) else "failed", "identityId": IDENTITY, "familyId": "bead", "checkCount": len(checks), "jobs": 24, "coreReadyTriplets": 8, "deferredJobs": 16, "generatedSources": 0, "generationAllowed": False, "ledgerSha256": before, "planSha256": sha(BRIEF / "plan.json"), "checks": checks, "ownerApproved": False, "runtimeIntegrated": False}
    (ROOT / "review/preparation-verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"identity": IDENTITY, "status": report["status"], "checks": len(checks), "jobs": 24, "generationAllowed": False}))
    if report["status"] != "passed":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
