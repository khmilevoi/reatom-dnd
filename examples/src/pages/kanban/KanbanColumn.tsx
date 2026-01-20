import { reatomComponent } from '@reatom/react';
import { useDraggable, useDroppable } from 'reatom-dnd/react';
import { GripHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  cardsDnd,
  columnsDnd,
  type ColumnNode,
  type ColumnContext,
} from './model';
import { KanbanCard } from './KanbanCard';

type KanbanColumnProps = {
  column: ColumnNode;
};

export const KanbanColumn = reatomComponent<KanbanColumnProps>(({ column }) => {
  // Atomized cards - direct access from column
  const cardsInColumn = column.cards();

  const columnContext: ColumnContext = {
    id: column.id,
    title: column.title,
  };

  // Draggable for reordering columns
  const {
    setNodeRef: setColumnNodeRef,
    setActivatorNodeRef,
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

  const cardDropTarget = isDropTarget();

  return (
    <div
      ref={setColumnNodeRef}
      style={{ viewTransitionName: `column-${column.id}` }}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col rounded-xl border bg-muted/50',
        'transition-opacity duration-200',
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
        {cardsInColumn.map((card) => (
          <KanbanCard key={card.id} card={card} columnId={column.id} />
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

// Compact column overlay - shows only title and card count
export const KanbanColumnContent = ({ column }: KanbanColumnProps) => (
  <div className="flex select-none items-center gap-2 rounded-lg border bg-muted/80 px-4 py-2 shadow-xl ring-2 ring-primary">
    <GripHorizontal size={16} className="shrink-0 text-muted-foreground" />
    <span className="font-semibold">{column.title}</span>
    <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
      {column.cards().length}
    </span>
  </div>
);
