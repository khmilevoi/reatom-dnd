import { reatomComponent } from '@reatom/react';
import { useOverlay } from 'reatom-dnd/react';
import { Move } from 'lucide-react';

import { dnd } from './model';

const DragOverlayContent = reatomComponent(() => {
  const { setNodeRef, position } = useOverlay(dnd);

  return (
    <div
      ref={setNodeRef}
      className="pointer-events-none fixed left-0 top-0 z-50 flex cursor-grabbing items-center gap-3 rounded-lg bg-gray-900 px-5 py-4 text-white shadow-2xl ring-2 ring-primary"
      style={{
        transform: `translate(${position().x}px, ${position().y}px)`,
      }}
    >
      <Move size={20} />
      <span className="font-medium">draggable</span>
    </div>
  );
}, 'DragOverlayContent');

export const DragOverlay = reatomComponent(() => {
  const model = dnd.dragging();

  if (!model) return null;

  return <DragOverlayContent key={model.id} />;
}, 'DragOverlay');
