/**
 * Event listener types and utilities for drag-and-drop operations.
 * @module utils/listeners
 */

import mitt from 'mitt';

import { CallbackWithCleanup } from '../types.ts';

/**
 * Callback invoked when a drag operation starts.
 *
 * @template DragContext - Type of the draggable element context
 * @param context - The context data of the element being dragged
 *
 * @category Callbacks
 */
export type OnDragStartCallback<DragContext> = (context: DragContext) => void;

/**
 * Callback invoked when a drag operation ends successfully.
 *
 * @template DragContext - Type of the draggable element context
 * @param context - The context data of the dragged element
 *
 * @category Callbacks
 */
export type OnDragEndCallback<DragContext> = (context: DragContext) => void;

/**
 * Callback invoked when a drag operation is cancelled.
 *
 * @template DragContext - Type of the draggable element context
 * @param context - The context data of the cancelled drag element
 *
 * @category Callbacks
 */
export type OnDragCancelCallback<DragContext> = (context: DragContext) => void;

/**
 * Collection of drag-related callback functions.
 *
 * @template DragContext - Type of the draggable element context
 *
 * @category Types
 */
export type DragCallbacks<DragContext> = {
  /** Callback for drag start event */
  onDragStart: OnDragStartCallback<DragContext>;
  /** Callback for drag end event */
  onDragEnd: OnDragEndCallback<DragContext>;
  /** Callback for drag cancel event */
  onDragCancel: OnDragCancelCallback<DragContext>;
};

/**
 * Subscribable drag start event with cleanup function.
 * @internal
 */
export type OnDragStart<DragContext> = CallbackWithCleanup<
  [callback: OnDragStartCallback<DragContext>]
>;

/**
 * Subscribable drag end event with cleanup function.
 * @internal
 */
export type OnDragEnd<DragContext> = CallbackWithCleanup<
  [callback: OnDragEndCallback<DragContext>]
>;

/**
 * Subscribable drag cancel event with cleanup function.
 * @internal
 */
export type OnDragCancel<DragContext> = CallbackWithCleanup<
  [callback: OnDragCancelCallback<DragContext>]
>;

/**
 * Event subscription methods for drag operations.
 *
 * @template DragContext - Type of the draggable element context
 *
 * @category Types
 */
export type DragEvents<DragContext> = {
  /** Subscribe to drag start events */
  onDragStart: OnDragStart<DragContext>;
  /** Subscribe to drag end events */
  onDragEnd: OnDragEnd<DragContext>;
  /** Subscribe to drag cancel events */
  onDragCancel: OnDragCancel<DragContext>;
};

/**
 * Internal type for drag event emitters and subscribers.
 * @internal
 */
export type DragListeners<DragContext> = {
  emitDragStart: (context: DragContext) => void;
  emitDragEnd: (context: DragContext) => void;
  emitDragCancel: (context: DragContext) => void;
  clear: () => void;
} & DragEvents<DragContext>;

/**
 * Callback invoked when an element is dropped onto a drop zone.
 *
 * @template DragContext - Type of the draggable element context
 * @template DropContext - Type of the drop zone context
 * @param dragContext - Context data of the dropped element
 * @param dropContext - Context data of the target drop zone
 *
 * @category Callbacks
 */
export type OnDropCallback<DragContext, DropContext> = (
  dragContext: DragContext,
  dropContext: DropContext,
) => void;

/**
 * Callback invoked when a draggable enters a drop zone.
 *
 * @template DropContext - Type of the drop zone context
 * @param context - Context data of the entered drop zone
 *
 * @category Callbacks
 */
export type OnDropEnterCallback<DropContext> = (context: DropContext) => void;

/**
 * Callback invoked when a draggable leaves a drop zone.
 *
 * @template DropContext - Type of the drop zone context
 * @param context - Context data of the left drop zone
 *
 * @category Callbacks
 */
export type OnDropLeaveCallback<DropContext> = (context: DropContext) => void;

/**
 * Collection of drop-related callback functions.
 *
 * @template DragContext - Type of the draggable element context
 * @template DropContext - Type of the drop zone context
 *
 * @category Types
 */
export type DropCallbacks<DragContext, DropContext> = {
  /** Callback for drop event */
  onDrop: OnDropCallback<DragContext, DropContext>;
  /** Callback for drop enter event */
  onDropEnter: OnDropEnterCallback<DropContext>;
  /** Callback for drop leave event */
  onDropLeave: OnDropLeaveCallback<DropContext>;
};

/**
 * Subscribable drop event with cleanup function.
 * @internal
 */
export type OnDrop<DragContext, DropContext> = CallbackWithCleanup<
  [callback: OnDropCallback<DragContext, DropContext>]
>;

/**
 * Subscribable drop enter event with cleanup function.
 * @internal
 */
export type OnDropEnter<DropContext> = CallbackWithCleanup<
  [callback: OnDropEnterCallback<DropContext>]
>;

/**
 * Subscribable drop leave event with cleanup function.
 * @internal
 */
export type OnDropLeave<DropContext> = CallbackWithCleanup<
  [callback: OnDropLeaveCallback<DropContext>]
>;

/**
 * Event subscription methods for drop operations.
 *
 * @template DragContext - Type of the draggable element context
 * @template DropContext - Type of the drop zone context
 *
 * @category Types
 */
export type DropEvents<DragContext, DropContext> = {
  /** Subscribe to drop events */
  onDrop: OnDrop<DragContext, DropContext>;
  /** Subscribe to drop enter events */
  onDropEnter: OnDropEnter<DropContext>;
  /** Subscribe to drop leave events */
  onDropLeave: OnDropLeave<DropContext>;
};

export type DropListeners<DragContext, DropContext> = {
  emitDrop: (dragContext: DragContext, dropContext: DropContext) => void;
  emitDropEnter: (context: DropContext) => void;
  emitDropLeave: (context: DropContext) => void;
  clear: () => void;
} & DropEvents<DragContext, DropContext>;

type MittDragEvents<DragContext> = {
  dragStart: DragContext;
  dragEnd: DragContext;
  dragCancel: DragContext;
};

export const makeDragListeners = <
  DragContext,
>(): DragListeners<DragContext> => {
  const emitter = mitt<MittDragEvents<DragContext>>();

  return {
    onDragStart: (callback) => {
      emitter.on('dragStart', callback);
      return () => emitter.off('dragStart', callback);
    },
    onDragEnd: (callback) => {
      emitter.on('dragEnd', callback);
      return () => emitter.off('dragEnd', callback);
    },
    onDragCancel: (callback) => {
      emitter.on('dragCancel', callback);
      return () => emitter.off('dragCancel', callback);
    },
    emitDragStart: (context) => emitter.emit('dragStart', context),
    emitDragEnd: (context) => emitter.emit('dragEnd', context),
    emitDragCancel: (context) => emitter.emit('dragCancel', context),
    clear: () => emitter.all.clear(),
  };
};

type MittDropEvents<DragContext, DropContext> = {
  drop: { dragContext: DragContext; dropContext: DropContext };
  dropEnter: DropContext;
  dropLeave: DropContext;
};

export const makeDropListeners = <DragContext, DropContext>(): DropListeners<
  DragContext,
  DropContext
> => {
  const emitter = mitt<MittDropEvents<DragContext, DropContext>>();

  return {
    onDrop: (callback) => {
      const handler = (data: {
        dragContext: DragContext;
        dropContext: DropContext;
      }) => {
        callback(data.dragContext, data.dropContext);
      };
      emitter.on('drop', handler);
      return () => emitter.off('drop', handler);
    },
    onDropEnter: (callback) => {
      emitter.on('dropEnter', callback);
      return () => emitter.off('dropEnter', callback);
    },
    onDropLeave: (callback) => {
      emitter.on('dropLeave', callback);
      return () => emitter.off('dropLeave', callback);
    },
    emitDrop: (dragContext, dropContext) =>
      emitter.emit('drop', { dragContext, dropContext }),
    emitDropEnter: (context) => emitter.emit('dropEnter', context),
    emitDropLeave: (context) => emitter.emit('dropLeave', context),
    clear: () => emitter.all.clear(),
  };
};
