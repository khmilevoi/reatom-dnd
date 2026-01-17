import { DragModel, DropModel, PRIVATE_META } from '../types';

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
