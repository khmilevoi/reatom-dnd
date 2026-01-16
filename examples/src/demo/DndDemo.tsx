import { reatomComponent } from '@reatom/react';

import { currentZoneAtom } from './model';
import { DropZone } from './DropZone';
import { DragOverlay } from './DragOverlay';

export const DndDemo = reatomComponent(() => {
  const zone = currentZoneAtom();

  const zones = Array.from({ length: 100 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex flex-wrap gap-2 h-100p">
        {zones.map((zoneId) => (
          <DropZone key={zoneId} zoneId={zoneId} hasItem={zone === zoneId} />
        ))}
      </div>
      <DragOverlay />
    </div>
  );
}, 'DndDemo');
