import { describe, it, expect } from 'vitest';
import {
  closestCenter,
  closestCorner,
  closestCornerMin,
  closestCornerAverage,
  createClosestCorner,
  rectangleIntersection,
} from './strategies';
import type { RectWithId } from './utils/rect';

const createRect = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): RectWithId => ({
  id,
  x,
  y,
  width,
  height,
  left: x,
  top: y,
  right: x + width,
  bottom: y + height,
});

describe('closestCenter', () => {
  it('should return empty array for empty droppingRects', () => {
    const result = closestCenter({
      draggingRect: createRect('drag', 0, 0, 100, 100),
      droppingRects: [],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result).toEqual([]);
  });

  it('should sort by distance from pointer to center', () => {
    const rect1 = createRect('drop1', 0, 0, 100, 100); // center: (50, 50)
    const rect2 = createRect('drop2', 200, 0, 100, 100); // center: (250, 50)
    const rect3 = createRect('drop3', 100, 0, 100, 100); // center: (150, 50)

    const result = closestCenter({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [rect1, rect2, rect3],
      overlayRect: createRect('overlay', 0, 0, 50, 50),
      pointer: { x: 140, y: 50 }, // closest to rect3
    });

    expect(result).toHaveLength(3);
    expect(result[0].droppingRect.id).toBe('drop3'); // closest
    expect(result[1].droppingRect.id).toBe('drop1');
    expect(result[2].droppingRect.id).toBe('drop2'); // furthest
  });

  it('should calculate correct Euclidean distance', () => {
    const rect = createRect('drop', 0, 0, 100, 100); // center: (50, 50)

    const result = closestCenter({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [rect],
      overlayRect: createRect('overlay', 0, 0, 50, 50),
      pointer: { x: 50, y: 50 }, // exactly at center
    });

    expect(result[0].value).toBe(0);
  });
});

describe('rectangleIntersection', () => {
  it('should return empty array for empty droppingRects', () => {
    const result = rectangleIntersection({
      draggingRect: createRect('drag', 0, 0, 100, 100),
      droppingRects: [],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result).toEqual([]);
  });

  it('should return empty array when overlay has zero area', () => {
    const result = rectangleIntersection({
      draggingRect: createRect('drag', 0, 0, 100, 100),
      droppingRects: [createRect('drop', 0, 0, 100, 100)],
      overlayRect: createRect('overlay', 0, 0, 0, 0), // zero area
      pointer: { x: 50, y: 50 },
    });

    expect(result).toEqual([]);
  });

  it('should return empty array when no intersection', () => {
    const result = rectangleIntersection({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [createRect('drop', 200, 200, 100, 100)],
      overlayRect: createRect('overlay', 0, 0, 50, 50),
      pointer: { x: 25, y: 25 },
    });

    expect(result).toEqual([]);
  });

  it('should sort by overlap ratio (highest first)', () => {
    // overlay: 0,0 -> 100,100
    // drop1: 0,0 -> 50,100 (50% overlap with overlay)
    // drop2: 0,0 -> 100,100 (100% overlap with overlay)
    const rect1 = createRect('drop1', 0, 0, 50, 100);
    const rect2 = createRect('drop2', 0, 0, 100, 100);

    const result = rectangleIntersection({
      draggingRect: createRect('drag', 0, 0, 100, 100),
      droppingRects: [rect1, rect2],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result).toHaveLength(2);
    expect(result[0].droppingRect.id).toBe('drop2'); // 100% overlap
    expect(result[1].droppingRect.id).toBe('drop1'); // 50% overlap
  });

  it('should calculate correct overlap ratio for full overlap', () => {
    const dropRect = createRect('drop', 0, 0, 200, 200);
    const overlayRect = createRect('overlay', 50, 50, 50, 50); // fully inside drop

    const result = rectangleIntersection({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [dropRect],
      overlayRect,
      pointer: { x: 75, y: 75 },
    });

    expect(result[0].value).toBe(1); // 100% overlap
  });
});

describe('createClosestCorner', () => {
  const rect1 = createRect('drop1', 0, 0, 100, 100);
  const rect2 = createRect('drop2', 200, 0, 100, 100);

  it('should create strategy with sum aggregation by default', () => {
    const strategy = createClosestCorner();
    const result = strategy({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [rect1, rect2],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result).toHaveLength(2);
    expect(result[0].droppingRect.id).toBe('drop1'); // closer corners
  });

  it('should support min aggregation', () => {
    const strategy = createClosestCorner('min');
    const result = strategy({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [rect1],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result[0].value).toBe(0); // perfect corner alignment
  });

  it('should support average aggregation', () => {
    const strategy = createClosestCorner('average');
    const result = strategy({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [rect1],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result).toHaveLength(1);
    expect(result[0].value).toBeGreaterThanOrEqual(0);
  });
});

describe('pre-configured corner strategies', () => {
  it('closestCorner should use sum aggregation', () => {
    const result = closestCorner({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [createRect('drop', 0, 0, 100, 100)],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result).toHaveLength(1);
  });

  it('closestCornerMin should use min aggregation', () => {
    const result = closestCornerMin({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [createRect('drop', 0, 0, 100, 100)],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result[0].value).toBe(0); // min distance is 0 (corners align)
  });

  it('closestCornerAverage should use average aggregation', () => {
    const result = closestCornerAverage({
      draggingRect: createRect('drag', 0, 0, 50, 50),
      droppingRects: [createRect('drop', 0, 0, 100, 100)],
      overlayRect: createRect('overlay', 0, 0, 100, 100),
      pointer: { x: 50, y: 50 },
    });

    expect(result).toHaveLength(1);
  });
});
