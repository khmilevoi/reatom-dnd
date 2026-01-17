/**
 * Built-in position modifiers for transforming overlay position during drag.
 * @module modifiers
 */

import { PositionModifier } from './types.ts';

/**
 * Value for offset configuration.
 *
 * Can be:
 * - A `number` - absolute offset in pixels
 * - `'start'` - no offset (0px)
 * - `'center'` - center the overlay (-size/2)
 * - `'end'` - align to end (-size)
 *
 * @example
 * ```ts
 * // Offset by 10 pixels
 * const offset: OffsetValue = 10;
 *
 * // Center the overlay
 * const centered: OffsetValue = 'center';
 * ```
 *
 * @category Modifiers
 */
export type OffsetValue = number | 'start' | 'center' | 'end';

/**
 * Configuration options for the offset modifier.
 *
 * @category Modifiers
 */
export type OffsetModifierOptions = {
  /**
   * Horizontal offset value.
   * @defaultValue `0`
   */
  x?: OffsetValue;
  /**
   * Vertical offset value.
   * @defaultValue `0`
   */
  y?: OffsetValue;
};

/**
 * Resolves an offset value to pixels based on element size.
 * @internal
 */
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

/**
 * Creates a position modifier that offsets the overlay position.
 *
 * This modifier adjusts where the overlay appears relative to the pointer.
 * Useful for centering the overlay under the cursor or adding fixed offsets.
 *
 * @param options - Offset configuration for X and Y axes
 * @returns A position modifier function
 *
 * @example Center overlay under cursor
 * ```ts
 * import { reatomDnd, offsetModifier } from 'reatom-dnd';
 *
 * const dnd = reatomDnd({
 *   name: 'centered-drag',
 *   modifiers: [offsetModifier({ x: 'center', y: 'center' })],
 * });
 * ```
 *
 * @example Fixed pixel offset
 * ```ts
 * // Offset overlay 20px right and 10px down from cursor
 * const dnd = reatomDnd({
 *   name: 'offset-drag',
 *   modifiers: [offsetModifier({ x: 20, y: 10 })],
 * });
 * ```
 *
 * @example Align to bottom-right of cursor
 * ```ts
 * const dnd = reatomDnd({
 *   name: 'tooltip-drag',
 *   modifiers: [offsetModifier({ x: 'start', y: 'start' })],
 * });
 * ```
 *
 * @category Modifiers
 */
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
