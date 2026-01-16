import { reatomComponent } from '@reatom/react';
import { useDraggable, useDroppable } from 'reatom-dnd/react';
import { Move, Maximize2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { dnd, type ZoneId } from './model';

const DraggableItem = reatomComponent(() => {
  const { setNodeRef, isActive } = useDraggable(dnd, {
    id: 'draggable',
    context: undefined,
  });

  const active = isActive();

  return (
    <div
      id="draggable"
      ref={setNodeRef}
      className={cn(
        'flex cursor-grab select-none items-center gap-3 rounded-lg bg-gray-900 px-5 py-4 text-white shadow-lg',
        'transition-opacity duration-200',
        active && 'opacity-50',
      )}
    >
      <div>
        <Move size={20} />
      </div>
      <span className="font-medium">draggable</span>
    </div>
  );
}, 'DraggableItem');

const DropPlaceholder = () => (
  <div className="flex items-center gap-3 text-gray-400">
    <Maximize2 size={24} />
    <span className="text-lg font-medium">droppable</span>
  </div>
);

type DropZoneProps = {
  zoneId: ZoneId;
  hasItem: boolean;
};

export const DropZone = reatomComponent<DropZoneProps>(
  ({ zoneId, hasItem }) => {
    const { setNodeRef, isActive } = useDroppable(dnd, {
      id: zoneId,
      context: zoneId,
    });

    return (
      <div
        id={zoneId}
        ref={setNodeRef}
        className={cn(
          'flex h-72 w-72 items-center justify-center rounded-2xl border-2 border-dashed bg-white',
          'transition-all duration-200',
          isActive() ? 'border-primary bg-primary/5' : 'border-gray-300',
        )}
      >
        {hasItem ? <DraggableItem /> : <DropPlaceholder />}
      </div>
    );
  },
  'DropZone',
);
