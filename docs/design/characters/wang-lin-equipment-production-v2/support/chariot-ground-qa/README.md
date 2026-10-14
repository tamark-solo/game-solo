# Xạ Thần Xa · ground-device QA

This support package audits the existing 16 Xạ Thần Xa directional gear views and records the handoff contract for the body workers. It is read-only: it does not edit gear, actors, source PNGs, runtime, map, save, or gameplay.

## Run

From the repository root:

```powershell
python docs/design/characters/wang-lin-equipment-production-v2/support/chariot-ground-qa/measure.py
```

Use `--check-only` for a no-write audit. The script verifies the registration and writes `measurement.json`, `verification.json`, and `lineage-checklist.json` in this folder. The current run passes **16 views / 888 checks** and audits **48 body jobs** (16 core, 16 damage, 16 practice); 16 core jobs have all pinned inputs ready.

## Ground-device contract

`registeredGround` is the physical wheel/apparatus endpoint in native pivot-local coordinates. `sourceGround` is the manually recorded source endpoint and remains provenance; the helper never derives a bone or hand estimate from the character. Each record carries:

- immutable full PNG SHA-256 and front/rear layer SHA-256, plus measured actual hashes;
- source PNG SHA-256, source cell and one source scale;
- `registeredGrip` for the visible command-loop material only;
- `registeredGround`, `groundMinusPivot`, `groundMinusGrip`, and a one-native-pixel review uncertainty;
- `supportPlane.kind = wheel-ground-endpoint`, with `sourceGround → registeredGround` and `handDrag = false`.

Deployment uses the device ground root and a review-only presentation offset `[55, 0]` from the caster. The offset is not range, collision, or balance. Body motion may show empty command palms and seals, but no body frame owns or drags the remote command loop. After deployment the device keeps its own ground root through idle, run, hit, death, meditate, and gather.

The southeast pilot layer can contain an intentionally empty rear partition; the full image and front layer remain required and the union must stay intact. This helper records that exception instead of repainting or manufacturing pixels.

## Body lineage gate

The 48 jobs in `lineage-checklist.json` are still candidate production work. Before a body worker dispatches a source:

1. Snapshot exact `input1` own identity/P1 or reviewed same-view Chariot neutral as PRIMARY.
2. Snapshot exact `input2` Wang same-view nearest-8x for anatomy, proportions, and pixel camera support only.
3. Snapshot exact `input3` own same-family source support; it cannot override identity or view.
4. Record prompt SHA, all input snapshot SHAs, built-in ImageGen provenance, transparent-background request, actual raw SHA, original tool path, source cell, one source scale, boot root/lift, and actual hand/seal sockets.
5. Keep `generationAllowed = false` until the own neutral/core view is reviewed. Do not mirror, rotate, reuse Sword/Banner pixels, or draw the cart/beast/rails/nodes into the body atlas.

The body worker owns the actor folders. This package only supplies measurement, provenance, and QA evidence.

`ownerApproved`, `runtimeIntegrated`, and ART/motion approvals remain false here by design.
