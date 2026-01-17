import { reatomComponent } from '@reatom/react';
import { useOverlay } from 'reatom-dnd/react';

import { cardsDnd, columnsDnd, cardsAtom, columnsAtom } from './model';
import { KanbanCardContent } from './KanbanCard';
import { KanbanColumnContent } from './KanbanColumn';

// Overlay for dragging cards
const CardOverlayContent = reatomComponent(() => {
  const { setNodeRef, position } = useOverlay(cardsDnd);

  return (
    <div
      ref={setNodeRef}
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{
        transform: `translate(${position().x}px, ${position().y}px)`,
      }}
    >
      <CardOverlayInner />
    </div>
  );
}, 'CardOverlayContent');

const CardOverlayInner = reatomComponent(() => {
  const draggingModel = cardsDnd.dragging();
  const cards = cardsAtom();

  if (!draggingModel) return null;

  const cardId = draggingModel.context().id;
  const card = cards.find((c) => c.id === cardId);

  if (!card) return null;

  return <KanbanCardContent card={card} />;
}, 'CardOverlayInner');

export const CardOverlay = reatomComponent(() => {
  const dragging = cardsDnd.dragging();

  if (!dragging) return null;

  return <CardOverlayContent key={dragging.id} />;
}, 'CardOverlay');

// Overlay for dragging columns
const ColumnOverlayContent = reatomComponent(() => {
  const { setNodeRef, position } = useOverlay(columnsDnd);

  return (
    <div
      ref={setNodeRef}
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{
        transform: `translate(${position().x}px, ${position().y}px)`,
      }}
    >
      <ColumnOverlayInner />
    </div>
  );
}, 'ColumnOverlayContent');

const ColumnOverlayInner = reatomComponent(() => {
  const draggingModel = columnsDnd.dragging();
  const columns = columnsAtom();

  if (!draggingModel) return null;

  const columnId = draggingModel.context().id;
  const column = columns.find((c) => c.id === columnId);

  if (!column) return null;

  return <KanbanColumnContent column={column} />;
}, 'ColumnOverlayInner');

export const ColumnOverlay = reatomComponent(() => {
  const dragging = columnsDnd.dragging();

  if (!dragging) return null;

  return <ColumnOverlayContent key={dragging.id} />;
}, 'ColumnOverlay');
