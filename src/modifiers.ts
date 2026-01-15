import { PositionModifier } from './types.ts';

export type OffsetValue = number | 'start' | 'center' | 'end';

export type OffsetModifierOptions = {
  x?: OffsetValue;
  y?: OffsetValue;
};

const resolveOffset = (value: OffsetValue, size: number): number => {
  if (typeof value === 'number') {
    return value;
  }
  switch (value) {
    case 'start':
      return 0;
    case 'center':
      return -size / 2;
    case 'end':
      return -size;
  }
};

export const offsetModifier = (
  options: OffsetModifierOptions,
): PositionModifier => {
  const { x = 0, y = 0 } = options;

  return ({ position, overlayRect }) => {
    const width = overlayRect?.width ?? 0;
    const height = overlayRect?.height ?? 0;

    return {
      x: position.x + resolveOffset(x, width),
      y: position.y + resolveOffset(y, height),
    };
  };
};
