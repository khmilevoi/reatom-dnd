/**
 * Utility types and functions for managing positions and rectangles.
 * @module utils/rect
 */

import { action, Atom, atom, isShallowEqual, peek } from '@reatom/core';

/**
 * Rectangle type representing bounding box dimensions.
 * Same as DOMRect but without the toJSON method.
 *
 * @category Types
 */
export type Rect = Omit<DOMRect, 'toJSON'>;

/**
 * Rectangle with an identifier, used for tracking element bounds.
 *
 * @category Types
 */
export type RectWithId = Rect & {
  /** Unique identifier for the element this rect belongs to */
  id: string;
};

/**
 * Reactive state atom for a rectangle with update methods.
 *
 * @category Types
 */
export type RectState = ReturnType<typeof makeRect>;

/**
 * 2D position with x and y coordinates.
 *
 * @category Types
 */
export type Position = {
  /** Horizontal position in pixels */
  x: number;
  /** Vertical position in pixels */
  y: number;
};

/**
 * Reactive state atom containing a Position.
 *
 * @category Types
 */
export type PositionState = Atom<Position>;

export const makePosition = (name: string): PositionState => {
  return atom(
    {
      x: 0,
      y: 0,
    },
    `_${name}.position`,
  );
};

export const makeRect = (name: string, id: string, rect: DOMRect) => {
  const rectData: RectWithId = {
    id,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
  };

  return atom(rectData, `_${name}.rect.${id}`).extend((target) => ({
    update: action((rect: DOMRect) => {
      const current = peek(target);
      const next: RectWithId = {
        id: current.id,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      };

      if (!isShallowEqual(current, next)) {
        target.set(next);
      }
    }, `${target.name}.update`),

    updateWithOffset: action((deltaX: number, deltaY: number) => {
      target.set((current) => ({
        id: current.id,
        x: current.x - deltaX,
        y: current.y - deltaY,
        width: current.width,
        height: current.height,
        left: current.left - deltaX,
        right: current.right - deltaX,
        top: current.top - deltaY,
        bottom: current.bottom - deltaY,
      }));
    }, `${target.name}.updateWithOffset`),

    updatePosition: action((position: Position) => {
      const current = peek(target);
      target.set({
        id: current.id,
        width: current.width,
        height: current.height,
        x: position.x,
        y: position.y,
        left: position.x,
        top: position.y,
        right: position.x + current.width,
        bottom: position.y + current.height,
      });
    }, `${target.name}.updatePosition`),
  }));
};
