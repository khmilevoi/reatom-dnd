/**
 * Built-in input sensors for detecting drag interactions.
 * @module sensors
 */

import { onEvent } from '@reatom/core';

import { Sensor } from './types.ts';

/**
 * Creates a mouse-based drag sensor.
 *
 * This sensor handles standard mouse interactions for drag-and-drop:
 * - **Drag start**: Triggered on `mousedown`
 * - **Drag end**: Triggered on `mouseup`
 * - **Pointer movement**: Tracked via `mousemove`
 * - **Cancellation**: Triggered when `Escape` key is pressed
 *
 * @returns A sensor object implementing the {@link Sensor} interface
 *
 * @remarks
 * This is the **default sensor** used by {@link reatomDnd} when no
 * sensors are specified.
 *
 * All event listeners use passive mode where applicable for better
 * scroll performance.
 *
 * @example Basic usage (default)
 * ```ts
 * import { reatomDnd } from 'reatom-dnd';
 *
 * // mouseSensor is used by default
 * const dnd = reatomDnd({ name: 'my-dnd' });
 * ```
 *
 * @example Explicit usage
 * ```ts
 * import { reatomDnd, mouseSensor } from 'reatom-dnd';
 *
 * const dnd = reatomDnd({
 *   name: 'my-dnd',
 *   sensors: [mouseSensor()],
 * });
 * ```
 *
 * @example Multiple sensors (future use)
 * ```ts
 * import { reatomDnd, mouseSensor } from 'reatom-dnd';
 *
 * const dnd = reatomDnd({
 *   name: 'my-dnd',
 *   sensors: [mouseSensor(), touchSensor()],
 * });
 * ```
 *
 * @see {@link Sensor} for the sensor interface
 * @category Sensors
 */
export const mouseSensor = (): Sensor => {
  return {
    onDragStart: (callback) => {
      return onEvent(document, 'mousedown', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        callback({
          target,
          position: { x: event.clientX, y: event.clientY },
        });
      });
    },
    onDragEnd: (callback) => {
      return onEvent(document, 'mouseup', callback, { passive: true });
    },
    onMovePointer: (callback) => {
      return onEvent(
        document,
        'mousemove',
        (event: MouseEvent) => {
          callback({ x: event.clientX, y: event.clientY });
        },
        { passive: true },
      );
    },
    onCancel: (callback) => {
      return onEvent(
        document,
        'keydown',
        (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            callback();
          }
        },
        { passive: true },
      );
    },
    onDrop: (callback) => {
      return onEvent(document, 'mouseup', callback, { passive: true });
    },
    onDropEnter: (node, callback) => {
      return onEvent(node, 'mouseenter', callback, { passive: true });
    },
    onDropLeave: (node, callback) => {
      return onEvent(node, 'mouseleave', callback, { passive: true });
    },
  };
};
