/**
 * Core types and interfaces for the reatom-dnd library.
 * @module types
 */

import { Atom, BooleanAtom, Computed } from '@reatom/core';

import {
  DragEvents,
  DropEvents,
  OnDragCancelCallback,
  OnDragEndCallback,
  OnDragStartCallback,
  OnDropCallback,
  Position,
  PositionState,
  Rect,
  RectState,
  RectWithId,
} from './utils';

/**
 * A callback function that returns a cleanup function.
 * Used for event subscriptions that need to be unsubscribed later.
 *
 * @template Args - Tuple of argument types for the callback
 * @category Types
 */
export type CallbackWithCleanup<Args extends unknown[]> = (
  ...args: Args
) => () => void;

/**
 * Symbol used to store private metadata on drag/drop models.
 * @internal
 */
export const PRIVATE_META = Symbol('PRIVATE_META');

/**
 * Base metadata structure for models.
 * @internal
 */
type BaseMeta<T extends string> = {
  type: T;
  internalId: string;
};

/**
 * Metadata type for draggable elements.
 * @category Types
 */
export type DragMeta = BaseMeta<'drag'>;

/**
 * Metadata type for droppable zones.
 * @category Types
 */
export type DropMeta = BaseMeta<'drop'>;

/**
 * Configuration options for creating a drag-and-drop system.
 *
 * @template DragContext - Type of custom data attached to draggable elements
 * @template DropContext - Type of custom data attached to drop zones
 *
 * @example
 * ```ts
 * const dnd = reatomDnd<TaskData, ColumnData>({
 *   name: 'kanban',
 *   sensors: [mouseSensor()],
 *   intersectionStrategy: rectangleIntersection,
 *   onDrop: (dragCtx, dropCtx) => {
 *     moveTask(dragCtx.taskId, dropCtx.columnId);
 *   },
 * });
 * ```
 *
 * @category Core
 */
export type ReatomDndOptions<DragContext, DropContext> = {
  /** Unique name for the DnD instance. Used for debugging in devtools. */
  name: string;
  /**
   * Array of input sensors to handle drag interactions.
   * @defaultValue `[mouseSensor()]`
   */
  sensors?: Sensor[];
  /**
   * Strategy for determining which drop zone is active during drag.
   * @defaultValue {@link rectangleIntersection}
   * @see {@link IntersectionStrategy}
   */
  intersectionStrategy?: IntersectionStrategy;
  /**
   * Array of position modifiers to transform the overlay position.
   * @defaultValue `[]`
   * @see {@link PositionModifier}
   */
  modifiers?: PositionModifier[];
  /**
   * Callback fired when a draggable is dropped onto a droppable zone.
   * @param dragContext - Context of the dropped draggable element
   * @param dropContext - Context of the target drop zone
   */
  onDrop?: OnDropCallback<DragContext, DropContext>;
  /**
   * Callback fired when a draggable enters a droppable zone.
   * @param dragContext - Context of the draggable element
   * @param dropContext - Context of the entered drop zone
   */
  onDropEnter?: (dragContext: DragContext, dropContext: DropContext) => void;
  /**
   * Callback fired when a draggable leaves a droppable zone.
   * @param dragContext - Context of the draggable element
   * @param dropContext - Context of the left drop zone
   */
  onDropLeave?: (dragContext: DragContext, dropContext: DropContext) => void;
  /**
   * Callback fired when drag operation starts.
   * @param context - Context of the dragged element
   */
  onDragStart?: OnDragStartCallback<DragContext>;
  /**
   * Callback fired when drag operation ends successfully.
   * @param context - Context of the dragged element
   */
  onDragEnd?: OnDragEndCallback<DragContext>;
  /**
   * Callback fired when drag operation is cancelled (e.g., by pressing Escape).
   * @param context - Context of the cancelled drag element
   */
  onDragCancel?: OnDragCancelCallback<DragContext>;
};

/**
 * Base parameters for creating a draggable or droppable model.
 *
 * @template Context - Type of custom data for the model
 * @category Types
 */
export type CreateModel<Context> = {
  /** Unique identifier for the element within the DnD system */
  id: string;
  /** Initial context data attached to the element */
  initialContext: Context;
};

/**
 * Parameters for creating a draggable element.
 *
 * @template DragContext - Type of custom data for the draggable
 * @category Types
 */
export type CreateDraggable<DragContext> = CreateModel<DragContext>;

/**
 * Parameters for creating a droppable zone.
 *
 * @template DropContext - Type of custom data for the droppable
 * @category Types
 */
export type CreateDroppable<DropContext> = CreateModel<DropContext>;

/**
 * Model representing the drag overlay element.
 * The overlay is the visual representation of the element being dragged.
 *
 * @category Models
 */
export type OverlayModel = {
  /** Atom holding reference to the overlay DOM element */
  node: Atom<HTMLElement | null>;
  /** Reactive position state for the overlay */
  position: PositionState;
  /** Reactive bounding rectangle state for the overlay */
  rect: RectState;
};

/**
 * Base model structure shared by draggable and droppable elements.
 *
 * @template Context - Type of custom data for the model
 * @template Meta - Type of metadata (DragMeta or DropMeta)
 * @internal
 */
type BaseModel<Context, Meta> = {
  /** Unique identifier for the element */
  id: string;
  /** Reactive atom containing custom context data */
  context: Atom<Context>;
  /** Atom holding reference to the DOM element */
  node: Atom<HTMLElement | null>;
  /** Reactive bounding rectangle state */
  rect: RectState;
  /** Boolean atom to disable/enable the element */
  disabled: BooleanAtom;
  /** Computed atom indicating if this element is currently active */
  isActive: Computed<boolean>;
  /** Cleanup function to dispose the model and remove from cache */
  dispose: () => void;
  /** Private metadata for internal use */
  [PRIVATE_META]: Meta;
};

/**
 * Model representing a draggable element.
 * Contains reactive state and event handlers for drag operations.
 *
 * @template DragContext - Type of custom data attached to the draggable
 *
 * @example
 * ```ts
 * const dragModel = dnd.draggable({
 *   id: 'item-1',
 *   initialContext: { title: 'Task 1' },
 * });
 *
 * // Subscribe to drag events
 * dragModel().onDragStart((ctx) => console.log('Started:', ctx.title));
 *
 * // Check if currently being dragged
 * if (dragModel().isActive()) {
 *   console.log('This item is being dragged');
 * }
 * ```
 *
 * @category Models
 */
export type DragModel<DragContext> = Omit<BaseModel<DragContext, DragMeta>, 'node'> &
  DragEvents<DragContext> & {
    node: Computed<HTMLElement | null>;
    /**
     * Atom holding reference to the activator element.
     * If set, only this element will trigger drag start instead of the main node.
     */
    activatorNode: Atom<HTMLElement | null>;
    elementNode: Atom<HTMLElement | null>;
  };

/**
 * Model representing a droppable zone.
 * Contains reactive state and event handlers for drop operations.
 *
 * @template DragContext - Type of data from draggable elements
 * @template DropContext - Type of custom data attached to this drop zone
 *
 * @example
 * ```ts
 * const dropModel = dnd.droppable({
 *   id: 'zone-1',
 *   initialContext: { columnId: 'todo' },
 * });
 *
 * // Subscribe to drop events
 * dropModel().onDrop((dragCtx, dropCtx) => {
 *   moveItem(dragCtx.id, dropCtx.columnId);
 * });
 *
 * // Check if a draggable is over this zone
 * if (dropModel().isActive()) {
 *   console.log('A draggable is over this zone');
 * }
 * ```
 *
 * @category Models
 */
export type DropModel<DragContext, DropContext> = BaseModel<
  DropContext,
  DropMeta
> &
  DropEvents<DragContext, DropContext>;

/**
 * Event data emitted when a drag operation starts.
 *
 * @category Types
 */
export type DragStartEvent = {
  /** The DOM element that triggered the drag */
  target: HTMLElement;
  /** Initial pointer position when drag started */
  position: Position;
};

/**
 * Interface for input sensors that detect drag interactions.
 * Sensors translate user input (mouse, touch, keyboard) into drag events.
 *
 * @remarks
 * Custom sensors can be created to support different input methods
 * or to add constraints like delay before drag starts.
 *
 * @example
 * ```ts
 * const customSensor: Sensor = {
 *   onDragStart: (callback) => {
 *     const handler = (e: PointerEvent) => {
 *       callback({ target: e.target as HTMLElement, position: { x: e.clientX, y: e.clientY } });
 *     };
 *     document.addEventListener('pointerdown', handler);
 *     return () => document.removeEventListener('pointerdown', handler);
 *   },
 *   // ... other methods
 * };
 * ```
 *
 * @category Sensors
 */
export type Sensor = {
  /** Subscribe to drag start events */
  onDragStart: CallbackWithCleanup<[callback: (event: DragStartEvent) => void]>;
  /** Subscribe to drag end events */
  onDragEnd: CallbackWithCleanup<[callback: () => void]>;
  /** Subscribe to pointer movement during drag */
  onMovePointer: CallbackWithCleanup<[callback: (position: Position) => void]>;
  /** Subscribe to drag cancellation events */
  onCancel: CallbackWithCleanup<[callback: () => void]>;
  /** Subscribe to drop events */
  onDrop: CallbackWithCleanup<[callback: () => void]>;
  /** Subscribe to drop zone enter events for a specific node */
  onDropEnter: CallbackWithCleanup<[node: HTMLElement, callback: () => void]>;
  /** Subscribe to drop zone leave events for a specific node */
  onDropLeave: CallbackWithCleanup<[node: HTMLElement, callback: () => void]>;
};

/**
 * Function that determines which drop zones collide with the dragged element.
 * Returns an array of collisions sorted by relevance (most relevant first).
 *
 * @param args - Current drag state information
 * @param args.draggingRect - Bounding rect of the element being dragged
 * @param args.droppingRects - Array of bounding rects for all active drop zones
 * @param args.overlayRect - Bounding rect of the drag overlay
 * @param args.pointer - Current pointer position
 * @returns Array of collisions sorted by the collision value
 *
 * @remarks
 * Built-in strategies include:
 * - {@link rectangleIntersection} - Based on overlap area (default)
 * - {@link closestCenter} - Based on distance to center
 * - {@link closestCorner} - Based on corner distances
 *
 * @example
 * ```ts
 * const customStrategy: IntersectionStrategy = ({ pointer, droppingRects }) => {
 *   return droppingRects
 *     .map(rect => ({
 *       value: Math.abs(pointer.x - rect.left),
 *       droppingRect: rect,
 *     }))
 *     .sort((a, b) => a.value - b.value);
 * };
 * ```
 *
 * @category Strategies
 */
export type IntersectionStrategy = (args: {
  draggingRect: RectWithId;
  droppingRects: RectWithId[];
  overlayRect: RectWithId;
  pointer: Position;
}) => IntersectionCollision[];

/**
 * Represents a collision between the dragged element and a drop zone.
 *
 * @category Strategies
 */
export type IntersectionCollision = {
  /**
   * Collision value used for sorting.
   * The meaning depends on the strategy (distance, overlap ratio, etc.)
   */
  value: number;
  /** The drop zone rectangle that was hit */
  droppingRect: RectWithId;
};

/**
 * Method for aggregating corner distances in closest corner strategies.
 * - `'sum'` - Sum of all corner distances
 * - `'min'` - Minimum corner distance
 * - `'average'` - Average of all corner distances
 *
 * @category Strategies
 */
export type CornerAggregation = 'sum' | 'min' | 'average';

/**
 * Function that modifies the overlay position during drag.
 * Modifiers are applied in sequence to transform the final position.
 *
 * @param args - Current drag state information
 * @param args.position - Current pointer position
 * @param args.draggingRect - Bounding rect of the dragged element (null if not available)
 * @param args.droppingRect - Bounding rect of the active drop zone (null if none)
 * @param args.overlayRect - Bounding rect of the overlay (null if not mounted)
 * @returns Modified position for the overlay
 *
 * @example
 * ```ts
 * // Snap to grid modifier
 * const snapToGrid: PositionModifier = ({ position }) => ({
 *   x: Math.round(position.x / 20) * 20,
 *   y: Math.round(position.y / 20) * 20,
 * });
 *
 * const dnd = reatomDnd({
 *   name: 'grid',
 *   modifiers: [snapToGrid],
 * });
 * ```
 *
 * @category Modifiers
 */
export type PositionModifier = (args: {
  position: Position;
  draggingRect: Rect | null;
  droppingRect: Rect | null;
  overlayRect: Rect | null;
}) => Position;

/**
 * The main DnD system interface returned by {@link reatomDnd}.
 * Provides state atoms and factories for creating draggable/droppable elements.
 *
 * @template DragContext - Type of custom data for draggable elements
 * @template DropContext - Type of custom data for drop zones
 *
 * @example
 * ```ts
 * const dnd = reatomDnd<TaskData, ColumnData>({ name: 'kanban' });
 *
 * // Access current drag state
 * const currentDrag = dnd.dragging();
 * const isAnythingDragging = dnd.isDragging();
 *
 * // Create draggable/droppable elements
 * const taskModel = dnd.draggable({ id: 'task-1', initialContext: taskData });
 * const columnModel = dnd.droppable({ id: 'column-1', initialContext: columnData });
 * ```
 *
 * @category Core
 */
export type ReatomDnd<DragContext, DropContext> = {
  /** Atom containing the currently dragged model, or null if not dragging */
  dragging: Atom<DragModel<DragContext> | null>;
  /** Atom containing the current drop target model, or null if not over a drop zone */
  dropping: Atom<DropModel<DragContext, DropContext> | null>;
  /** Computed boolean indicating if any element is being dragged */
  isDragging: Computed<boolean>;
  /** Computed boolean indicating if the dragged element is over a drop zone */
  isDroppable: Computed<boolean>;
  /** Overlay model for the visual drag representation */
  overlay: OverlayModel;
  /**
   * Factory function to create a draggable element model.
   * @param params - Configuration for the draggable
   * @returns Atom containing the drag model
   */
  draggable: (params: CreateDraggable<DragContext>) => Atom<DragModel<DragContext>>;
  /**
   * Factory function to create a droppable zone model.
   * @param params - Configuration for the droppable
   * @returns Atom containing the drop model
   */
  droppable: (params: CreateDroppable<DropContext>) => Atom<DropModel<DragContext, DropContext>>;
};
