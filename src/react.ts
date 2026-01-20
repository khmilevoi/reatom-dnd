/**
 * React hooks for integrating reatom-dnd with React components.
 * @showCategories
 * @module react
 */

import {
  DependencyList,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Atom, AtomLike, log } from '@reatom/core';

import { PRIVATE_META, ReatomDnd } from './types.ts';
import { DragCallbacks, DropCallbacks } from './utils';

export { PRIVATE_META };

/**
 * Utility hook for creating a ref with a callback setter function.
 *
 * Returns a tuple of [ref, setRef] where setRef can be passed to
 * a component's ref prop.
 *
 * @template T - The HTML element type
 * @returns A tuple of [RefObject, setter function]
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [nodeRef, setNodeRef] = useNodeRef<HTMLDivElement>();
 *
 *   useEffect(() => {
 *     console.log('Node:', nodeRef.current);
 *   }, []);
 *
 *   return <div ref={setNodeRef}>Content</div>;
 * }
 * ```
 *
 * @category React
 */
export const useNodeRef = <T extends HTMLElement>(): [
  RefObject<T | null>,
  (element: T | null) => void,
] => {
  const nodeRef = useRef<T | null>(null);
  const setNodeRef = useCallback((element: T | null) => {
    nodeRef.current = element;
  }, []);

  return [nodeRef, setNodeRef];
};

/**
 * React hook for creating a draggable element.
 *
 * This hook manages the lifecycle of a draggable model and provides
 * ref setters for connecting DOM elements to the DnD system.
 *
 * @template DragContext - Type of custom data for the draggable
 * @template DropContext - Type of drop zone data
 *
 * @param model - The DnD system created with `reatomDnd`
 * @param options - Configuration options for the draggable
 * @param options.id - Unique identifier for this draggable element
 * @param options.context - Custom data attached to this draggable
 * @param options.isDisabled - When true, prevents dragging this element
 * @param options.node - Optional external atom for the node reference
 * @param options.activatorNode - Optional atom for a separate drag handle element
 * @param options.onDragStart - Callback when drag starts
 * @param options.onDragEnd - Callback when drag ends successfully
 * @param options.onDragCancel - Callback when drag is cancelled
 *
 * @returns Object containing the drag model properties and ref setters
 *
 * @example Basic usage
 * ```tsx
 * import { useDraggable } from 'reatom-dnd/react';
 *
 * function DraggableItem({ id, title }: { id: string; title: string }) {
 *   const { setNodeRef, isActive } = useDraggable(dnd, {
 *     id,
 *     context: { id, title },
 *   });
 *
 *   return (
 *     <div
 *       ref={setNodeRef}
 *       style={{ opacity: isActive() ? 0.5 : 1 }}
 *     >
 *       {title}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With drag handle
 * ```tsx
 * function DraggableCard({ id, content }: Props) {
 *   const { setNodeRef, setActivatorNodeRef, isActive } = useDraggable(dnd, {
 *     id,
 *     context: { id },
 *   });
 *
 *   return (
 *     <div ref={setNodeRef}>
 *       <button ref={setActivatorNodeRef}>Drag Handle</button>
 *       <p>{content}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With callbacks
 * ```tsx
 * const { setNodeRef } = useDraggable(dnd, {
 *   id: 'task-1',
 *   context: task,
 *   onDragStart: (ctx) => console.log('Started dragging:', ctx.title),
 *   onDragEnd: (ctx) => console.log('Finished dragging:', ctx.title),
 *   onDragCancel: (ctx) => console.log('Cancelled:', ctx.title),
 * });
 * ```
 *
 * @remarks See `DragModel` in the main module for the model structure.
 * @see {@link useDroppable} for creating drop zones
 *
 * @category React
 */
export const useDraggable = <DragContext, DropContext>(
  model: ReatomDnd<DragContext, DropContext>,
  {
    id,
    context,
    isDisabled,
    node,
    activatorNode,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    onDragCancel: _onDragCancel,
  }: {
    id: string;
    context: DragContext;
    isDisabled?: boolean;
    node?: Atom<HTMLElement | null>;
    activatorNode?: Atom<HTMLElement | null>;
  } & Partial<DragCallbacks<DragContext>>,
) => {
  const [nodeRef, setNodeRef] = useNodeRef();
  const [activatorNodeRef, setActivatorNodeRef] = useNodeRef();

  const onDragStart = useRef(_onDragStart);
  const onDragEnd = useRef(_onDragEnd);
  const onDragCancel = useRef(_onDragCancel);

  useEffect(() => {
    onDragStart.current = _onDragStart;
    onDragEnd.current = _onDragEnd;
    onDragCancel.current = _onDragCancel;
  });

  const [initialContext] = useState(context);

  const dragModel = useMemo(
    () => model.draggable({ id, initialContext }),
    [id, initialContext, model],
  );

  useEffect(() => {
    dragModel().context.set(context);
  }, [context, dragModel()]);

  useEffect(() => {
    dragModel().disabled.set(!!isDisabled);
  }, [dragModel(), isDisabled]);

  useEffect(() => {
    const unsubs = [
      onDragStart.current && dragModel().onDragStart(onDragStart.current),
      onDragEnd.current && dragModel().onDragEnd(onDragEnd.current),
      onDragCancel.current && dragModel().onDragCancel(onDragCancel.current),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, [dragModel]);

  useLayoutEffect(() => {
    if (node) {
      return node.subscribe((state) => dragModel().elementNode.set(state));
    } else {
      dragModel().elementNode.set(nodeRef.current);
    }
  }, [dragModel(), node, nodeRef]);

  useLayoutEffect(() => {
    if (activatorNode) {
      return activatorNode.subscribe((state) =>
        dragModel().activatorNode.set(state),
      );
    } else {
      dragModel().activatorNode.set(activatorNodeRef.current);
    }
  }, [dragModel(), activatorNode, activatorNodeRef]);

  return {
    ...dragModel(),
    setNodeRef,
    setActivatorNodeRef,
  };
};

/**
 * React hook for creating a drop zone.
 *
 * This hook manages the lifecycle of a droppable model and provides
 * a ref setter for connecting a DOM element to the DnD system.
 *
 * @template DragContext - Type of draggable element data
 * @template DropContext - Type of custom data for this drop zone
 *
 * @param model - The DnD system created with `reatomDnd`
 * @param options - Configuration options for the droppable
 * @param options.id - Unique identifier for this drop zone
 * @param options.context - Custom data attached to this drop zone
 * @param options.isDisabled - When true, prevents dropping on this zone
 * @param options.node - Optional external atom for the node reference
 * @param options.onDrop - Callback when an element is dropped here
 * @param options.onDropEnter - Callback when a draggable enters this zone
 * @param options.onDropLeave - Callback when a draggable leaves this zone
 *
 * @returns Object containing the drop model properties and ref setter
 *
 * @example Basic usage
 * ```tsx
 * import { useDroppable } from 'reatom-dnd/react';
 *
 * function DropZone({ columnId, children }: Props) {
 *   const { setNodeRef, isActive } = useDroppable(dnd, {
 *     id: columnId,
 *     context: { columnId },
 *   });
 *
 *   return (
 *     <div
 *       ref={setNodeRef}
 *       style={{ background: isActive() ? '#e0e0e0' : 'white' }}
 *     >
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With callbacks
 * ```tsx
 * const { setNodeRef, isActive } = useDroppable(dnd, {
 *   id: 'todo-column',
 *   context: { columnId: 'todo' },
 *   onDrop: (dragCtx, dropCtx) => {
 *     moveTask(dragCtx.taskId, dropCtx.columnId);
 *   },
 *   onDropEnter: (dropCtx) => {
 *     console.log('Hovering over:', dropCtx.columnId);
 *   },
 *   onDropLeave: (dropCtx) => {
 *     console.log('Left:', dropCtx.columnId);
 *   },
 * });
 * ```
 *
 * @remarks See `DropModel` in the main module for the model structure.
 * @see {@link useDraggable} for creating draggable elements
 *
 * @category React
 */
export const useDroppable = <DragContext, DropContext>(
  model: ReatomDnd<DragContext, DropContext>,
  {
    id,
    context,
    isDisabled,
    node,
    onDrop: _onDrop,
    onDropEnter: _onDropEnter,
    onDropLeave: _onDropLeave,
  }: {
    id: string;
    context: DropContext;
    isDisabled?: boolean;
    node?: AtomLike<HTMLElement | null>;
  } & Partial<DropCallbacks<DragContext, DropContext>>,
) => {
  const [nodeRef, setNodeRef] = useNodeRef();

  const onDrop = useRef(_onDrop);
  const onDropEnter = useRef(_onDropEnter);
  const onDropLeave = useRef(_onDropLeave);

  useEffect(() => {
    onDrop.current = _onDrop;
    onDropEnter.current = _onDropEnter;
    onDropLeave.current = _onDropLeave;
  });

  const [initialContext] = useState(context);

  const dropModel = useMemo(
    () => model.droppable({ id, initialContext }),
    [id, initialContext, model],
  );

  useEffect(() => {
    dropModel().context.set(context);
  }, [context, dropModel()]);

  useEffect(() => {
    dropModel().disabled.set(!!isDisabled);
  }, [dropModel(), isDisabled]);

  useEffect(() => {
    const unsubs = [
      onDrop.current && dropModel().onDrop(onDrop.current),
      onDropEnter.current && dropModel().onDropEnter(onDropEnter.current),
      onDropLeave.current && dropModel().onDropLeave(onDropLeave.current),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, [dropModel]);

  useLayoutEffect(() => {
    if (node) {
      return node.subscribe((state) => dropModel().node.set(state));
    } else {
      dropModel().node.set(nodeRef.current);
    }
  }, [dropModel(), node, nodeRef]);

  return {
    ...dropModel(),
    setNodeRef,
  };
};

/**
 * React hook for managing the drag overlay element.
 *
 * The overlay is the visual representation of the element being dragged.
 * It follows the pointer (modified by any position modifiers) and is
 * typically rendered in a portal to avoid z-index issues.
 *
 * @template DragContext - Type of draggable element data
 * @template DropContext - Type of drop zone data
 *
 * @param model - The DnD system created with `reatomDnd`
 *
 * @returns Object containing overlay state and ref setter
 * @returns returns.node - Atom with the overlay DOM element reference
 * @returns returns.position - Reactive position state (x, y coordinates)
 * @returns returns.rect - Reactive bounding rectangle state
 * @returns returns.setNodeRef - Ref setter function for the overlay element
 *
 * @example Basic usage
 * ```tsx
 * import { useOverlay } from 'reatom-dnd/react';
 * import { createPortal } from 'react-dom';
 *
 * function DragOverlay() {
 *   const { setNodeRef, position } = useOverlay(dnd);
 *   const dragging = dnd.dragging();
 *
 *   if (!dragging) return null;
 *
 *   return createPortal(
 *     <div
 *       ref={setNodeRef}
 *       style={{
 *         position: 'fixed',
 *         left: 0,
 *         top: 0,
 *         transform: `translate(${position().x}px, ${position().y}px)`,
 *         pointerEvents: 'none',
 *       }}
 *     >
 *       {dragging.context().title}
 *     </div>,
 *     document.body
 *   );
 * }
 * ```
 *
 * @example With animation
 * ```tsx
 * function AnimatedOverlay() {
 *   const { setNodeRef, position } = useOverlay(dnd);
 *   const pos = position();
 *
 *   return (
 *     <motion.div
 *       ref={setNodeRef}
 *       animate={{ x: pos.x, y: pos.y }}
 *       transition={{ type: 'spring', stiffness: 500 }}
 *     >
 *       Dragging...
 *     </motion.div>
 *   );
 * }
 * ```
 *
 * @remarks See `OverlayModel` in the main module for the overlay model structure.
 * Use `offsetModifier` to adjust the overlay position.
 *
 * @category React
 */
export const useOverlay = <DragContext, DropContext>(
  model: ReatomDnd<DragContext, DropContext>,
) => {
  const [nodeRef, setNodeRef] = useNodeRef();

  useLayoutEffect(() => {
    model.overlay.node.set(nodeRef.current);
  }, [model.overlay.node, nodeRef]);

  return {
    ...model.overlay,
    setNodeRef,
  };
};
