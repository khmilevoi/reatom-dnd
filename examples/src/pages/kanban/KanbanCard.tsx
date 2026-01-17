import { reatomComponent } from '@reatom/react';
import { useDraggable } from 'reatom-dnd/react';
import { GripVertical } from 'lucide-react';

import { cn } from '@/lib/utils';
import { cardsDnd, type Card, type CardContext } from './model';

type KanbanCardProps = {
  card: Card;
};

export const KanbanCard = reatomComponent<KanbanCardProps>(({ card }) => {
  const context: CardContext = {
    id: card.id,
    title: card.title,
  };

  const { setNodeRef, isActive } = useDraggable(cardsDnd, {
    id: card.id,
    context,
  });

  const active = isActive();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group flex cursor-grab select-none items-center gap-2 rounded-lg border bg-card p-3 shadow-sm',
        'transition-all duration-200 hover:shadow-md',
        active && 'opacity-50 ring-2 ring-primary',
      )}
    >
      <GripVertical
        size={16}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
      <span className="text-sm font-medium">{card.title}</span>
    </div>
  );
}, 'KanbanCard');

// Card content for overlay (without drag functionality)
export const KanbanCardContent = ({ card }: KanbanCardProps) => (
  <div className="flex cursor-grabbing select-none items-center gap-2 rounded-lg border bg-card p-3 shadow-xl ring-2 ring-primary">
    <GripVertical size={16} className="shrink-0 text-muted-foreground" />
    <span className="text-sm font-medium">{card.title}</span>
  </div>
);
