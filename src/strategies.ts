/**
 * Built-in intersection strategies for determining drop zone collisions.
 * @module strategies
 */

import {
  CornerAggregation,
  IntersectionCollision,
  IntersectionStrategy,
} from './types.ts';

/**
 * Intersection strategy that finds the closest drop zone by center distance.
 *
 * Calculates the Euclidean distance from the current pointer position to
 * the center of each drop zone. Zones are sorted by distance (closest first).
 *
 * @remarks
 * This strategy is useful for:
 * - List-based layouts where items are dropped between zones
 * - Scenarios where the pointer position matters more than overlay position
 *
 * @example
 * ```ts
 * import { reatomDnd, closestCenter } from 'reatom-dnd';
 *
 * const dnd = reatomDnd({
 *   name: 'sortable-list',
 *   intersectionStrategy: closestCenter,
 * });
 * ```
 *
 * @category Strategies
 */
export const closestCenter: IntersectionStrategy = ({
  droppingRects,
  pointer,
}) => {
  const collisions: IntersectionCollision[] = [];

  for (const droppingRect of droppingRects) {
    const centerX = droppingRect.left + droppingRect.width / 2;
    const centerY = droppingRect.top + droppingRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(centerX - pointer.x, 2) + Math.pow(centerY - pointer.y, 2),
    );

    collisions.push({
      value: distance,
      droppingRect,
    });
  }

  return collisions.sort((a, b) => a.value - b.value);
};

/**
 * Factory function for creating corner-based intersection strategies.
 *
 * Calculates distances between corresponding corners of the overlay and
 * drop zones (top-left to top-left, top-right to top-right, etc.).
 * The final collision value is determined by the aggregation method.
 *
 * @param aggregation - Method for combining the four corner distances:
 *   - `'sum'` - Sum of all corner distances (default)
 *   - `'min'` - Minimum corner distance (most aligned corner)
 *   - `'average'` - Average of all corner distances
 *
 * @returns An intersection strategy function
 *
 * @example
 * ```ts
 * import { reatomDnd, createClosestCorner } from 'reatom-dnd';
 *
 * // Use minimum corner distance for better alignment detection
 * const dnd = reatomDnd({
 *   name: 'grid',
 *   intersectionStrategy: createClosestCorner('min'),
 * });
 * ```
 *
 * @see {@link closestCorner} - Pre-configured with 'sum' aggregation
 * @see {@link closestCornerMin} - Pre-configured with 'min' aggregation
 * @see {@link closestCornerAverage} - Pre-configured with 'average' aggregation
 *
 * @category Strategies
 */
export const createClosestCorner = (
  aggregation: CornerAggregation = 'sum',
): IntersectionStrategy => {
  return ({ droppingRects, overlayRect }) => {
    const collisions: IntersectionCollision[] = [];

    const overlayCorners = [
      { x: overlayRect.left, y: overlayRect.top },
      { x: overlayRect.right, y: overlayRect.top },
      { x: overlayRect.left, y: overlayRect.bottom },
      { x: overlayRect.right, y: overlayRect.bottom },
    ];

    for (const droppingRect of droppingRects) {
      const dropCorners = [
        { x: droppingRect.left, y: droppingRect.top },
        { x: droppingRect.right, y: droppingRect.top },
        { x: droppingRect.left, y: droppingRect.bottom },
        { x: droppingRect.right, y: droppingRect.bottom },
      ];

      const distances = overlayCorners.map((overlayCorner, i) => {
        const dropCorner = dropCorners[i];
        return Math.sqrt(
          Math.pow(overlayCorner.x - dropCorner.x, 2) +
            Math.pow(overlayCorner.y - dropCorner.y, 2),
        );
      });

      let value: number;
      switch (aggregation) {
        case 'min':
          value = Math.min(...distances);
          break;
        case 'average':
          value = distances.reduce((a, b) => a + b, 0) / distances.length;
          break;
        case 'sum':
        default:
          value = distances.reduce((a, b) => a + b, 0);
      }

      collisions.push({ value, droppingRect });
    }

    return collisions.sort((a, b) => a.value - b.value);
  };
};

/**
 * Corner-based strategy using sum of all corner distances.
 *
 * @see {@link createClosestCorner} for more options
 * @category Strategies
 */
export const closestCorner = createClosestCorner('sum');

/**
 * Corner-based strategy using the minimum corner distance.
 * Useful when you want to detect the most aligned corner.
 *
 * @see {@link createClosestCorner} for more options
 * @category Strategies
 */
export const closestCornerMin = createClosestCorner('min');

/**
 * Corner-based strategy using the average of all corner distances.
 *
 * @see {@link createClosestCorner} for more options
 * @category Strategies
 */
export const closestCornerAverage = createClosestCorner('average');

/**
 * Intersection strategy based on rectangle overlap area.
 *
 * Calculates the intersection area between the overlay and each drop zone,
 * returning the ratio of intersection to overlay area. Zones are sorted
 * by overlap ratio (highest overlap first).
 *
 * @remarks
 * This is the **default strategy** used by {@link reatomDnd}.
 *
 * Best suited for:
 * - Grid layouts where visual overlap is important
 * - Drag-and-drop file managers
 * - Any scenario where the overlay size matters
 *
 * Returns an empty array if the overlay has zero area.
 *
 * @example
 * ```ts
 * import { reatomDnd, rectangleIntersection } from 'reatom-dnd';
 *
 * const dnd = reatomDnd({
 *   name: 'file-manager',
 *   intersectionStrategy: rectangleIntersection, // This is the default
 * });
 * ```
 *
 * @category Strategies
 */
export const rectangleIntersection: IntersectionStrategy = ({
  overlayRect,
  droppingRects,
}) => {
  const overlayLeft = overlayRect.left;
  const overlayRight = overlayRect.right;
  const overlayTop = overlayRect.top;
  const overlayBottom = overlayRect.bottom;
  const overlayArea =
    (overlayRight - overlayLeft) * (overlayBottom - overlayTop);

  if (overlayArea === 0) return [];

  const collisions: IntersectionCollision[] = [];

  for (const droppingRect of droppingRects) {
    const dropLeft = droppingRect.left;
    const dropRight = droppingRect.right;
    const dropTop = droppingRect.top;
    const dropBottom = droppingRect.bottom;

    const overlapX = Math.max(
      0,
      Math.min(overlayRight, dropRight) - Math.max(overlayLeft, dropLeft),
    );
    const overlapY = Math.max(
      0,
      Math.min(overlayBottom, dropBottom) - Math.max(overlayTop, dropTop),
    );
    const intersectionArea = overlapX * overlapY;

    if (intersectionArea > 0) {
      collisions.push({
        value: intersectionArea / overlayArea,
        droppingRect,
      });
    }
  }

  return collisions.sort((a, b) => b.value - a.value);
};
