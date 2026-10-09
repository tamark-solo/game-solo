import type { Box } from './level-design';

export interface AlignmentGuide { axis: 'x' | 'y'; value: number }
/** Snap screen-space tolerance to other edges / centers, independently per axis. */
export function alignWithGuides(moving: Box, targets: Box[], tolerance: number): { dx: number; dy: number; guides: AlignmentGuide[] } {
  const guides: AlignmentGuide[] = [];
  const axis = (direction: 'x' | 'y'): number => {
    const horizontal = direction === 'x';
    const anchors = (box: Box) => { const start = horizontal ? box.left : box.top, size = horizontal ? box.w : box.h; return [start, start + size / 2, start + size]; };
    let best = tolerance + Number.EPSILON, shift = 0, value: number | undefined;
    for (const target of targets) for (const destination of anchors(target)) for (const source of anchors(moving)) {
      const distance = Math.abs(destination - source);
      if (distance <= tolerance && distance < best) { best = distance; shift = destination - source; value = destination; }
    }
    if (value !== undefined) guides.push({ axis: direction, value });
    return shift;
  };
  const dx = axis('x'), dy = axis('y');
  return { dx, dy, guides };
}
