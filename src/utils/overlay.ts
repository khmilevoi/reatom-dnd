import { atom, withChangeHook } from '@reatom/core';

import { OverlayModel } from '../types.ts';
import { makePosition, makeRect } from './rect.ts';

export const makeOverlay = (name: string): OverlayModel => {
  const rect = makeRect(name, 'overlay', new DOMRect());

  return {
    node: atom<HTMLElement | null>(null, `${name}.overlay.node`).extend(
      withChangeHook((state) => {
        if (state) {
          rect.update(state.getBoundingClientRect());
        }
      }),
    ),
    position: makePosition(`${name}.overlay.position`),
    rect,
  };
};
