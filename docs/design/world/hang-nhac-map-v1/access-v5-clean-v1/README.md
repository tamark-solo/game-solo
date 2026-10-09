# Access-v5 circled defect cleanup

Owner request, 2026-10-08: remove the isolated broken shrub/planter remnant in the red-circled area of the supplied access-v5 image.

- Source: `map-web-access-v5.webp` (archived before cleanup), 3072 × 2048.
- Final web image: [map-web-access-v5-clean-v1.webp](../map-web-access-v5-clean-v1.webp), quality 94, 2,939,564 bytes.
- Lossless composite: [map-master-access-v5-clean-v1.png](../map-master-access-v5-clean-v1.png).
- [Native before/after](before-after-native.png), [prompt](cleanup.prompt.txt), [verification report](repair.json).

The built-in ImageGen tool reconstructed the local stone paving. Ten unchanged landmarks registered with zero translation. Only the local composition mask was merged into the decoded source; the lossless composite preserves every source pixel outside that mask. No global blur or sharpening was applied. The remnant and its shadow were removed, including the damaged overlap at the adjacent garden post. Stairs were not edited.

At creation this was a sibling correction and did not select the active map. The owner later used its exact image bytes to complete navigation and selected that saved project on 2026-10-08. The original access-v5 and superseded trials are now in the external recovery archive listed in the cleanup manifest; current navigation and browser drafts are preserved.

Reproduction helper: `artifacts/clean-hang-nhac-access-v5.py`, using the saved built-in ImageGen output in this folder as its input. Diagnostic enlargements are inspection aids, not map assets.
