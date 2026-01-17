import { reatomComponent } from '@reatom/react';
import { useDraggable, useDroppable } from 'reatom-dnd/react';
import { GripHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  cardsDnd,
  columnsDnd,
  getCardsByColumn,
  type Card,
  type Column,
  type ColumnContext,
} from './model';
import { KanbanCard } from './KanbanCard';

type KanbanColumnProps = {
  column: Column;
};

export const KanbanColumn = reatomComponent<KanbanColumnProps>(({ column }) => {
  const cardsInColumn = getCardsByColumn(column.id)();

  const columnContext: ColumnContext = {
    id: column.id,
    title: column.title,
  };

  // Draggable for reordering columns
  const {
    node: columnNode,
    setNodeRef: setColumnNodeRef,
    setActivatorNodeRef,
    isActive: isDragging,
  } = useDraggable(columnsDnd, {
    id: column.id,
    context: columnContext,
  });

  // Droppable for receiving cards
  const { setNodeRef: setCardsNodeRef, isActive: isDropTarget } = useDroppable(
    cardsDnd,
    {
      id: column.id,
      context: column.id,
    },
  );

  // Droppable for column reordering - reuses columnNode from draggable
  const { isActive: isColumnDropTarget } = useDroppable(columnsDnd, {
    id: `column-drop-${column.id}`,
    context: column.id,
    node: columnNode,
  });

  const dragging = isDragging();
  const cardDropTarget = isDropTarget();
  const columnDropTarget = isColumnDropTarget();

  return (
    <div
      ref={setColumnNodeRef}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col rounded-xl border bg-muted/50',
        'transition-all duration-200',
        dragging && 'opacity-50 ring-2 ring-primary',
        columnDropTarget && !dragging && 'ring-2 ring-primary/50',
      )}
    >
      {/* Column Header with drag handle */}
      <div
        ref={setActivatorNodeRef}
        className={cn(
          'flex cursor-grab select-none items-center gap-2 border-b bg-muted/80 px-4 py-3',
          'rounded-t-xl transition-colors hover:bg-muted',
        )}
      >
        <GripHorizontal size={16} className="shrink-0 text-muted-foreground" />
        <h3 className="font-semibold">{column.title}</h3>
        <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
          {cardsInColumn.length}
        </span>
      </div>

      {/* Cards container - droppable for cards */}
      <div
        ref={setCardsNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-2 overflow-y-auto p-3',
          'transition-colors duration-200',
          cardDropTarget && 'bg-primary/5',
        )}
      >
        {cardsInColumn.map((card: Card) => (
          <KanbanCard key={card.id} card={card} />
        ))}

        {cardsInColumn.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-8 text-sm text-muted-foreground">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}, 'KanbanColumn');

// Column content for overlay (simplified version)
export const KanbanColumnContent = ({ column }: KanbanColumnProps) => (
  <div className="flex h-32 w-72 select-none flex-col rounded-xl border bg-muted/50 shadow-xl ring-2 ring-primary">
    <div className="flex cursor-grabbing select-none items-center gap-2 border-b bg-muted/80 px-4 py-3 rounded-t-xl">
      <GripHorizontal size={16} className="shrink-0 text-muted-foreground" />
      <h3 className="font-semibold">{column.title}</h3>
    </div>
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      Moving column...
    </div>
  </div>
);
