import { reatomRoute } from '@reatom/core';

import { AppLayout } from '../components/AppLayout';
import { DndDemo } from './grid/DndDemo';
import { KanbanBoard } from './kanban/KanbanBoard';

// Root layout route
export const layoutRoute = reatomRoute({
  render({ outlet }) {
    return <AppLayout>{outlet()}</AppLayout>;
  },
});

// Grid Demo route
export const gridRoute = layoutRoute.reatomRoute({
  path: 'grid',
  render() {
    return <DndDemo />;
  },
});

// Kanban Demo route
export const kanbanRoute = layoutRoute.reatomRoute({
  path: 'kanban',
  render() {
    return <KanbanBoard />;
  },
});
