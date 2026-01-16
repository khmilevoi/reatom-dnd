import { reatomComponent } from '@reatom/react';

import { currentZoneAtom } from './model';
import { DropZone } from './DropZone';
import { DragOverlay } from './DragOverlay';

export const DndDemo = reatomComponent(() => {
  const zone = currentZoneAtom();

  return (
    <div className="flex min-h-screen items-center justify-center gap-8 bg-gray-100 p-8">
      <DropZone zoneId="left" hasItem={zone === 'left'} />
      <DropZone zoneId="right" hasItem={zone === 'right'} />
      <DragOverlay />
    </div>
  );
}, 'DndDemo');
