# reatom-dnd

Drag and drop library for [Reatom](https://www.reatom.dev/).

## Installation

```bash
npm install reatom-dnd @reatom/core
# or
pnpm add reatom-dnd @reatom/core
```

For React integration:

```bash
npm install react
```

## Usage

### Create DnD model

```ts
import { reatomDnd, rectangleIntersection, mouseSensor, offsetModifier } from 'reatom-dnd';

type DragContext = { itemId: string };
type DropContext = { zoneId: number };

export const dnd = reatomDnd<DragContext, DropContext>({
  name: 'dnd',
  sensors: [mouseSensor()],
  modifiers: [offsetModifier({ x: 'center', y: 'center' })],
  intersectionStrategy: rectangleIntersection,
  onDrop: (dragContext, dropContext) => {
    console.log(`Dropped item ${dragContext.itemId} into zone ${dropContext.zoneId}`);
  },
});
```

### React integration

```tsx
import { useDraggable, useDroppable, useOverlay } from 'reatom-dnd/react';
import { dnd } from './model';

// Draggable component
const DraggableItem = ({ itemId }: { itemId: string }) => {
  const { setNodeRef, isActive } = useDraggable(dnd, {
    id: itemId,
    context: { itemId },
  });

  return (
    <div ref={setNodeRef} style={{ opacity: isActive() ? 0.5 : 1 }}>
      Drag me
    </div>
  );
};

// Droppable component
const DropZone = ({ zoneId }: { zoneId: number }) => {
  const { setNodeRef, isActive } = useDroppable(dnd, {
    id: String(zoneId),
    context: { zoneId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ border: isActive() ? '2px solid blue' : '2px dashed gray' }}
    >
      Drop here
    </div>
  );
};

// Drag overlay
const DragOverlay = () => {
  const { setNodeRef, position } = useOverlay(dnd);

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'fixed',
        left: position.x(),
        top: position.y(),
        pointerEvents: 'none',
      }}
    >
      Dragging...
    </div>
  );
};
```

## Features

- Sensors: `mouseSensor`, `touchSensor`, `keyboardSensor`
- Intersection strategies: `rectangleIntersection`, `closestCenter`, `closestCorners`
- Position modifiers: `offsetModifier`, `snapToGridModifier`, `restrictToContainerModifier`

## Examples

See the [examples](./examples) directory for a complete demo.

Try it online: [StackBlitz](https://stackblitz.com/~/github.com/khmilevoi/reatom-dnd)

## License

MIT
