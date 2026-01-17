/**
 * Type guard utilities for distinguishing between drag and drop models.
 * @module guards
 */

import { DragModel, DropModel, PRIVATE_META } from '../types';

/**
 * Type guard that checks if a model is a draggable element.
 *
 * Use this to narrow the type when working with a union of
 * {@link DragModel} and {@link DropModel}.
 *
 * @template DragContext - Type of the draggable element context
 * @template DropContext - Type of the drop zone context
 *
 * @param model - The model to check
 * @returns `true` if the model is a {@link DragModel}, `false` otherwise
 *
 * @example
 * ```ts
 * import { isDraggable } from 'reatom-dnd';
 *
 * function handleModel(model: DragModel<Task> | DropModel<Task, Column>) {
 *   if (isDraggable(model)) {
 *     // TypeScript knows model is DragModel<Task> here
 *     console.log('Activator:', model.activatorNode());
 *   } else {
 *     // TypeScript knows model is DropModel<Task, Column> here
 *     model.onDrop((drag, drop) => console.log('Dropped!'));
 *   }
 * }
 * ```
 *
 * @category Guards
 */
export const isDraggable = <DragContext, DropContext>(
  model: DragModel<DragContext> | DropModel<DragContext, DropContext>,
): model is DragModel<DragContext> => {
  return model[PRIVATE_META].type === 'drag';
};

/**
 * Type guard that checks if a model is a droppable zone.
 *
 * Use this to narrow the type when working with a union of
 * {@link DragModel} and {@link DropModel}.
 *
 * @template DragContext - Type of the draggable element context
 * @template DropContext - Type of the drop zone context
 *
 * @param model - The model to check
 * @returns `true` if the model is a {@link DropModel}, `false` otherwise
 *
 * @example
 * ```ts
 * import { isDroppable } from 'reatom-dnd';
 *
 * function handleModel(model: DragModel<Task> | DropModel<Task, Column>) {
 *   if (isDroppable(model)) {
 *     // TypeScript knows model is DropModel<Task, Column> here
 *     model.onDropEnter((ctx) => console.log('Entered:', ctx));
 *   }
 * }
 * ```
 *
 * @category Guards
 */
export const isDroppable = <DragContext, DropContext>(
  model: DragModel<DragContext> | DropModel<DragContext, DropContext>,
): model is DropModel<DragContext, DropContext> => {
  return model[PRIVATE_META].type === 'drop';
};
