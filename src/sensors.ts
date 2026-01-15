import { onEvent } from '@reatom/core';

import { Sensor } from './types.ts';

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
