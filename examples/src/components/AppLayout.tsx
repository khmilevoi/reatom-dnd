import { type ReactNode } from 'react';
import { reatomComponent } from '@reatom/react';

import { cn } from '@/lib/utils';
import { gridRoute, kanbanRoute } from '../pages';

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = reatomComponent<AppLayoutProps>(({ children }) => {
  const isGridActive = gridRoute.match();
  const isKanbanActive = kanbanRoute.match();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Demos</h2>
        <nav className="space-y-1">
          <button
            onClick={() => gridRoute.go()}
            className={cn(
              'block w-full text-left px-3 py-2 rounded-md',
              isGridActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent',
            )}
          >
            Grid Demo
          </button>
          <button
            onClick={() => kanbanRoute.go()}
            className={cn(
              'block w-full text-left px-3 py-2 rounded-md',
              isKanbanActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent',
            )}
          >
            Kanban Demo
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}, 'AppLayout');
