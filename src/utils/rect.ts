import { action, Atom, atom, isShallowEqual, peek } from '@reatom/core';

export type Rect = Omit<DOMRect, 'toJSON'>;
export type RectWithId = Rect & { id: string };
export type RectState = ReturnType<typeof makeRect>;

export type Position = {
  x: number;
  y: number;
};

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
