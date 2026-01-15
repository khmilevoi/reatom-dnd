import {
  CornerAggregation,
  IntersectionCollision,
  IntersectionStrategy,
} from './types.ts';

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

export const closestCorner = createClosestCorner('sum');
export const closestCornerMin = createClosestCorner('min');
export const closestCornerAverage = createClosestCorner('average');

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
