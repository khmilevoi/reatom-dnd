import {
  atom,
  action,
  Atom,
  reatomLinkedList,
  type LLNode,
  LL_PREV,
} from '@reatom/core';
import {
  reatomDnd,
  rectangleIntersection,
  closestCenter,
  mouseSensor,
  offsetModifier,
} from 'reatom-dnd';

// Types
export type ColumnId = string;
export type CardId = string;

export type Card = {
  id: CardId;
  title: string;
};

// Column type (without index - order is determined by linked list)
export type Column = {
  id: ColumnId;
  title: string;
  cards: Atom<Card[]>;
};

// Linked list node type
export type ColumnNode = LLNode<Column>;

export type CardContext = {
  id: CardId;
  title: string;
  columnId: ColumnId;
};

export type ColumnContext = {
  id: ColumnId;
  title: string;
};

// Context for column drop zones - reference to column AFTER which to insert
export type ColumnDropZoneContext = {
  afterColumn: ColumnNode | null; // null = insert at the beginning
};

// Initial cards data
const todoCards: Card[] = [
  { id: 'card-1', title: 'Design system components' },
  { id: 'card-2', title: 'API integration' },
];

const inProgressCards: Card[] = [
  { id: 'card-3', title: 'User authentication' },
  { id: 'card-4', title: 'Database schema' },
];

const doneCards: Card[] = [{ id: 'card-5', title: 'Project setup' }];

// Linked list of columns
export const columnsLL = reatomLinkedList(
  {
    create: (id: ColumnId, title: string, cards: Card[]) => ({
      id,
      title,
      cards: atom(cards, `kanban.column.${id}.cards`),
    }),
    initState: [
      {
        id: 'todo',
        title: 'To Do',
        cards: atom(todoCards, 'kanban.column.todo.cards'),
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        cards: atom(inProgressCards, 'kanban.column.in-progress.cards'),
      },
      {
        id: 'done',
        title: 'Done',
        cards: atom(doneCards, 'kanban.column.done.cards'),
      },
    ],
    key: 'id' as const,
  },
  'kanban.columns',
);

// Get column by id - O(1) via map
export const getColumn = (id: ColumnId): ColumnNode | undefined =>
  columnsLL.map().get(id);

// Actions

// Move card between columns
export const moveCard = action(
  (cardId: CardId, fromColumnId: ColumnId, toColumnId: ColumnId) => {
    if (fromColumnId === toColumnId) return;

    const fromColumn = getColumn(fromColumnId);
    const toColumn = getColumn(toColumnId);

    if (!fromColumn || !toColumn) return;

    const fromCards = fromColumn.cards();
    const cardIndex = fromCards.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) return;

    const [card] = fromCards.splice(cardIndex, 1);

    // O(1) - directly update the atoms
    fromColumn.cards.set([...fromCards]);
    toColumn.cards.set([...toColumn.cards(), card]);
  },
  'kanban.moveCard',
);

// Move column with View Transitions animation
export const moveColumn = action(
  (column: ColumnNode, afterColumn: ColumnNode | null) => {
    // Skip if column would be moved to its current position
    // (afterColumn is the previous sibling or column itself)
    const prevSibling = column[LL_PREV];
    if (afterColumn === column || afterColumn === prevSibling) return;

    // Use View Transitions API for animation
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        columnsLL.move(column, afterColumn);
      });
    } else {
      columnsLL.move(column, afterColumn);
    }
  },
  'kanban.moveColumn',
);

// DnD Models

// Model for cards - drag cards between columns
export const cardsDnd = reatomDnd<CardContext, ColumnId>({
  name: 'cardsDnd',
  sensors: [mouseSensor()],
  modifiers: [offsetModifier({ x: -25, y: 'center' })],
  intersectionStrategy: rectangleIntersection,
  onDrop: (card, targetColumnId) => {
    moveCard(card.id, card.columnId, targetColumnId);
  },
});

// Model for columns - reorder columns
export const columnsDnd = reatomDnd<ColumnContext, ColumnDropZoneContext>({
  name: 'columnsDnd',
  sensors: [mouseSensor()],
  modifiers: [offsetModifier({ x: -25, y: 'center' })],
  intersectionStrategy: closestCenter,
  // Move on hover, not on drop
  onDropEnter: (dragColumn, dropContext) => {
    const column = getColumn(dragColumn.id);
    if (column) {
      moveColumn(column, dropContext.afterColumn);
    }
  },
  // onDrop not needed - state is already updated
});
