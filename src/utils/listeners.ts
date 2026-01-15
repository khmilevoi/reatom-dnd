import mitt from 'mitt';

import { CallbackWithCleanup } from '../types.ts';

export type OnDragStartCallback<DragContext> = (context: DragContext) => void;
export type OnDragEndCallback<DragContext> = (context: DragContext) => void;
export type OnDragCancelCallback<DragContext> = (context: DragContext) => void;

export type DragCallbacks<DragContext> = {
  onDragStart: OnDragStartCallback<DragContext>;
  onDragEnd: OnDragEndCallback<DragContext>;
  onDragCancel: OnDragCancelCallback<DragContext>;
};

export type OnDragStart<DragContext> = CallbackWithCleanup<
  [callback: OnDragStartCallback<DragContext>]
>;
export type OnDragEnd<DragContext> = CallbackWithCleanup<
  [callback: OnDragEndCallback<DragContext>]
>;
export type OnDragCancel<DragContext> = CallbackWithCleanup<
  [callback: OnDragCancelCallback<DragContext>]
>;

export type DragEvents<DragContext> = {
  onDragStart: OnDragStart<DragContext>;
  onDragEnd: OnDragEnd<DragContext>;
  onDragCancel: OnDragCancel<DragContext>;
};

export type DragListeners<DragContext> = {
  emitDragStart: (context: DragContext) => void;
  emitDragEnd: (context: DragContext) => void;
  emitDragCancel: (context: DragContext) => void;
  clear: () => void;
} & DragEvents<DragContext>;

export type OnDropCallback<DragContext, DropContext> = (
  dragContext: DragContext,
  dropContext: DropContext,
) => void;
export type OnDropEnterCallback<DropContext> = (context: DropContext) => void;
export type OnDropLeaveCallback<DropContext> = (context: DropContext) => void;

export type DropCallbacks<DragContext, DropContext> = {
  onDrop: OnDropCallback<DragContext, DropContext>;
  onDropEnter: OnDropEnterCallback<DropContext>;
  onDropLeave: OnDropLeaveCallback<DropContext>;
};

export type OnDrop<DragContext, DropContext> = CallbackWithCleanup<
  [callback: OnDropCallback<DragContext, DropContext>]
>;
export type OnDropEnter<DropContext> = CallbackWithCleanup<
  [callback: OnDropEnterCallback<DropContext>]
>;
export type OnDropLeave<DropContext> = CallbackWithCleanup<
  [callback: OnDropLeaveCallback<DropContext>]
>;

export type DropEvents<DragContext, DropContext> = {
  onDrop: OnDrop<DragContext, DropContext>;
  onDropEnter: OnDropEnter<DropContext>;
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
