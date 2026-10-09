import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alignWithGuides } from '../shared/editor-guides';

test('alignment picks the nearest edge or center independently on each axis', () => {
  const result = alignWithGuides({ left: 93, top: 198, w: 40, h: 40 }, [{ left: 100, top: 200, w: 40, h: 40 }], 8);
  assert.equal(result.dx, 7); assert.equal(result.dy, 2);
  assert.deepEqual(result.guides, [{ axis: 'x', value: 100 }, { axis: 'y', value: 200 }]);
});
test('screen tolerance limits magnetic movement and retains valid zero-offset guides', () => {
  assert.deepEqual(alignWithGuides({ left: 100, top: 100, w: 32, h: 32 }, [{ left: 200, top: 200, w: 32, h: 32 }], 6), { dx: 0, dy: 0, guides: [] });
  const aligned = alignWithGuides({ left: 100, top: 100, w: 32, h: 32 }, [{ left: 100, top: 200, w: 32, h: 32 }], 6);
  assert.deepEqual(aligned.guides, [{ axis: 'x', value: 100 }]);
});
