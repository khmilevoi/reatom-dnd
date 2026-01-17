import { atom, action, computed } from '@reatom/core';
import {
  reatomDnd,
  rectangleIntersection,
  closestCenter,
  mouseSensor,
  offsetModifier,
} from 'reatom-dnd';

// Types
export type ColumnId = string;

export type Card = {
  id: string;
  title: string;
  columnId: ColumnId;
};

export type Column = {
  id: ColumnId;
  title: string;
};

export type CardContext = {
  id: string;
  title: string;
};

export type ColumnContext = {
  id: ColumnId;
  title: string;
};

// Initial data
const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const initialCards: Card[] = [
  { id: 'card-1', title: 'Design system components', columnId: 'todo' },
  { id: 'card-2', title: 'API integration', columnId: 'todo' },
  { id: 'card-3', title: 'User authentication', columnId: 'in-progress' },
  { id: 'card-4', title: 'Database schema', columnId: 'in-progress' },
  { id: 'card-5', title: 'Project setup', columnId: 'done' },
];

// State atoms
export const columnsAtom = atom<Column[]>(initialColumns, 'kanban.columns');
export const cardsAtom = atom<Card[]>(initialCards, 'kanban.cards');
export const columnOrderAtom = atom<ColumnId[]>(
  initialColumns.map((c) => c.id),
  'kanban.columnOrder',
);

// Actions
export const moveCard = action((cardId: string, targetColumnId: ColumnId) => {
  const cards = cardsAtom();
  const updatedCards = cards.map((card) =>
    card.id === cardId ? { ...card, columnId: targetColumnId } : card,
  );
  cardsAtom.set(updatedCards);
}, 'kanban.moveCard');

export const reorderColumns = action(
  (draggedColumnId: ColumnId, targetColumnId: ColumnId) => {
    if (draggedColumnId === targetColumnId) return;

    const order = columnOrderAtom();
    const draggedIndex = order.indexOf(draggedColumnId);
    const targetIndex = order.indexOf(targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...order];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumnId);

    columnOrderAtom.set(newOrder);
  },
  'kanban.reorderColumns',
);

// Derived atoms
export const getCardsByColumn = (columnId: ColumnId) =>
  computed(
    () => cardsAtom().filter((card) => card.columnId === columnId),
    `kanban.cardsByColumn.${columnId}`,
  );

export const orderedColumnsAtom = computed(() => {
  const columns = columnsAtom();
  const order = columnOrderAtom();
  return order
    .map((id) => columns.find((col) => col.id === id))
    .filter((col): col is Column => col !== undefined);
}, 'kanban.orderedColumns');

// DnD Models

// Model for cards - drag cards between columns
export const cardsDnd = reatomDnd<CardContext, ColumnId>({
  name: 'cardsDnd',
  sensors: [mouseSensor()],
  modifiers: [offsetModifier({ x: 'center', y: 'center' })],
  intersectionStrategy: rectangleIntersection,
  onDrop: (card, targetColumnId) => {
    moveCard(card.id, targetColumnId);
  },
});

// Model for columns - reorder columns
export const columnsDnd = reatomDnd<ColumnContext, ColumnId>({
  name: 'columnsDnd',
  sensors: [mouseSensor()],
  modifiers: [offsetModifier({ x: 'center', y: 'center' })],
  intersectionStrategy: closestCenter,
  onDrop: (draggedColumn, targetColumnId) => {
    reorderColumns(draggedColumn.id, targetColumnId);
  },
});
