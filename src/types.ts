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

export type CallbackWithCleanup<Args extends unknown[]> = (
  ...args: Args
) => () => void;

export const PRIVATE_META = Symbol('PRIVATE_META');

type BaseMeta<T extends string> = {
  type: T;
  internalId: string;
};

export type DragMeta = BaseMeta<'drag'>;
export type DropMeta = BaseMeta<'drop'>;

export type ReatomDndOptions<DragContext, DropContext> = {
  name: string;
  sensors?: Sensor[];
  intersectionStrategy?: IntersectionStrategy;
  modifiers?: PositionModifier[];
  onDrop?: OnDropCallback<DragContext, DropContext>;
  onDropEnter?: (dragContext: DragContext, dropContext: DropContext) => void;
  onDropLeave?: (dragContext: DragContext, dropContext: DropContext) => void;
  onDragStart?: OnDragStartCallback<DragContext>;
  onDragEnd?: OnDragEndCallback<DragContext>;
  onDragCancel?: OnDragCancelCallback<DragContext>;
};

export type CreateModel<Context> = {
  id: string;
  initialContext: Context;
};

export type CreateDraggable<DragContext> = CreateModel<DragContext>;
export type CreateDroppable<DropContext> = CreateModel<DropContext>;

export type OverlayModel = {
  node: Atom<HTMLElement | null>;
  position: PositionState;
  rect: RectState;
};

type BaseModel<Context, Meta> = {
  id: string;
  context: Atom<Context>;
  node: Atom<HTMLElement | null>;
  rect: RectState;
  disabled: BooleanAtom;
  isActive: Computed<boolean>;
  dispose: () => void;
  [PRIVATE_META]: Meta;
};

export type DragModel<DragContext> = BaseModel<DragContext, DragMeta> &
  DragEvents<DragContext> & {
    activatorNode: Atom<HTMLElement | null>;
  };

export type DropModel<DragContext, DropContext> = BaseModel<
  DropContext,
  DropMeta
> &
  DropEvents<DragContext, DropContext>;

export type DragStartEvent = {
  target: HTMLElement;
  position: Position;
};

export type Sensor = {
  onDragStart: CallbackWithCleanup<[callback: (event: DragStartEvent) => void]>;
  onDragEnd: CallbackWithCleanup<[callback: () => void]>;
  onMovePointer: CallbackWithCleanup<[callback: (position: Position) => void]>;
  onCancel: CallbackWithCleanup<[callback: () => void]>;
  onDrop: CallbackWithCleanup<[callback: () => void]>;
  onDropEnter: CallbackWithCleanup<[node: HTMLElement, callback: () => void]>;
  onDropLeave: CallbackWithCleanup<[node: HTMLElement, callback: () => void]>;
};

export type IntersectionStrategy = (args: {
  draggingRect: RectWithId;
  droppingRects: RectWithId[];
  overlayRect: RectWithId;
  pointer: Position;
}) => IntersectionCollision[];

export type IntersectionCollision = {
  value: number;
  droppingRect: RectWithId;
};

export type CornerAggregation = 'sum' | 'min' | 'average';

export type PositionModifier = (args: {
  position: Position;
  draggingRect: Rect | null;
  droppingRect: Rect | null;
  overlayRect: Rect | null;
}) => Position;

export const isDraggable = <DragContext, DropContext>(
  model: DragModel<DragContext> | DropModel<DragContext, DropContext>,
): model is DragModel<DragContext> => {
  return model[PRIVATE_META].type === 'drag';
};

export const isDroppable = <DragContext, DropContext>(
  model: DragModel<DragContext> | DropModel<DragContext, DropContext>,
): model is DropModel<DragContext, DropContext> => {
  return model[PRIVATE_META].type === 'drop';
};
