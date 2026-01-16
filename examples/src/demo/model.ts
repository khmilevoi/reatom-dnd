import { atom } from '@reatom/core';
import { reatomDnd, rectangleIntersection, mouseSensor, offsetModifier } from 'reatom-dnd';

export type ZoneId = 'left' | 'right';

export const currentZoneAtom = atom<ZoneId>('left', 'currentZone');

export const dnd = reatomDnd<void, ZoneId>({
  name: 'dnd',
  sensors: [mouseSensor()],
  modifiers: [offsetModifier({ x: 'center', y: 'center' })],
  intersectionStrategy: rectangleIntersection,
  onDrop: (_, targetZone) => {
    currentZoneAtom.set(targetZone);
  },
});
