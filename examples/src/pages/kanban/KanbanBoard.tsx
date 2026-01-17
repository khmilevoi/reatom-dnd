import { reatomComponent } from '@reatom/react';

import { orderedColumnsAtom } from './model';
import { KanbanColumn } from './KanbanColumn';
import { CardOverlay, ColumnOverlay } from './KanbanOverlays';

export const KanbanBoard = reatomComponent(() => {
  const columns = orderedColumnsAtom();

  return (
    <div className="flex h-full flex-col bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">
          Drag cards between columns or reorder columns by dragging their headers
        </p>
      </div>

      {/* Board */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>

      {/* Overlays */}
      <CardOverlay />
      <ColumnOverlay />
    </div>
  );
}, 'KanbanBoard');
