import { reatomComponent } from '@reatom/react';
import { useDroppable } from 'reatom-dnd/react';

import { cn } from '@/lib/utils';
import './kanban.css';
import { columnsLL, columnsDnd, type ColumnNode } from './model';
import { KanbanColumn } from './KanbanColumn';
import { CardOverlay, ColumnOverlay } from './KanbanOverlays';

type DropZoneProps = {
  afterColumn: ColumnNode | null; // null = beginning of list
};

const ColumnDropZone = reatomComponent<DropZoneProps>(({ afterColumn }) => {
  const id = afterColumn ? `drop-after-${afterColumn.id}` : 'drop-start';

  const { setNodeRef } = useDroppable(columnsDnd, {
    id,
    context: { afterColumn },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-full w-4 shrink-0 transition-colors duration-150',
      )}
    />
  );
}, 'ColumnDropZone');

export const KanbanBoard = reatomComponent(() => {
  const columns = columnsLL.array();

  return (
    <div className="flex h-full flex-col bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">
          Drag cards between columns or reorder columns by dragging their
          headers
        </p>
      </div>

      {/* Board */}
      <div className="flex flex-1 gap-0 overflow-x-auto pb-4">
        {/* Drop zone at the beginning */}
        <ColumnDropZone key="drop-start" afterColumn={null} />

        {columns.flatMap((column) => [
          <KanbanColumn key={column.id} column={column} />,
          <ColumnDropZone key={`drop-${column.id}`} afterColumn={column} />,
        ])}
      </div>

      {/* Overlays */}
      <CardOverlay />
      <ColumnOverlay />
    </div>
  );
}, 'KanbanBoard');
