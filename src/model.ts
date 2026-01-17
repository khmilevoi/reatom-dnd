import {
  action,
  Atom,
  atom,
  computed,
  effect,
  onEvent,
  peek,
  rAF,
  reatomBoolean,
  withChangeHook,
  wrap,
} from '@reatom/core';

import {
  CreateDraggable,
  CreateDroppable,
  DragModel,
  DropModel,
  PRIVATE_META,
  ReatomDndOptions,
} from './types.ts';
import {
  DragListeners,
  DropListeners,
  initScrollTracker,
  makeDragListeners,
  makeDropListeners,
  makeModifiers,
  makeNodeRegistry,
  makeOverlay,
  makePosition,
  makeRect,
  makeResizeObserver,
  makeScrollBatcher,
  makeScrollParentCache,
  makeScrollTracker,
  makeSensors,
  RectState,
  RectWithId,
} from './utils';

let refCounter = 0;

export const reatomDnd = <DragContext, DropContext>({
  name,
  sensors,
  intersectionStrategy: _intersectionStrategy,
  modifiers,
  onDrop,
  onDropEnter,
  onDropLeave,
  onDragStart,
  onDragEnd,
  onDragCancel,
}: ReatomDndOptions<DragContext, DropContext>) => {
  const dragCache = new Map<string, DragModel<DragContext>>();
  const dropCache = new Map<string, DropModel<DragContext, DropContext>>();

  const dragListeners = new WeakMap<
    DragModel<DragContext>,
    DragListeners<DragContext>
  >();
  const dropListeners = new WeakMap<
    DropModel<DragContext, DropContext>,
    DropListeners<DragContext, DropContext>
  >();

  const registry = makeNodeRegistry();
  const scrollParentCache = makeScrollParentCache();

  const dragging = atom<DragModel<DragContext> | null>(
    null,
    `${name}.dragging`,
  );
  const isDragging = computed(() => dragging() !== null);

  const dropping = atom<DropModel<DragContext, DropContext> | null>(
    null,
    `${name}.dropping`,
  );
  const isDroppable = computed(() => dropping() !== null);

  const pointer = makePosition(`${name}.pointer`);

  const overlay = makeOverlay(name);

  const sensor = makeSensors(sensors);
  const modifier = makeModifiers(modifiers);
  const intersectionStrategy = action(
    _intersectionStrategy,
    `_${name}.intersectionStrategy`,
  );

  const resizeObserver = makeResizeObserver();

  const makeResizeEffect = (
    nodeAtom: Atom<HTMLElement | null>,
    rectAtom: RectState,
  ) => {
    return effect(() => {
      const node = nodeAtom();
      if (!node) return;
      return resizeObserver.observe(node, (entry) => {
        if (entry.target === node) {
          rectAtom.update(entry.contentRect);
        }
      });
    });
  };

  const updatePosition = (
    dragRect: RectWithId | null,
    dropRect: RectWithId | null,
  ) => {
    const modifiedPosition = modifier({
      position: peek(pointer),
      overlayRect: peek(overlay.rect),
      draggingRect: dragRect ?? null,
      droppingRect: dropRect ?? null,
    });

    overlay.position.set(modifiedPosition);
  };

  const findTargetModel = (target: HTMLElement) => {
    const id = registry.findAncestorDragId(target);

    if (id) {
      const model = dragCache.get(id);
      if (model && !peek(model.disabled)) {
        return model;
      }
    }

    return null;
  };

  const scrollTracker = makeScrollTracker();

  const applyScrollDeltas = (deltas: Array<{ deltaX: number; deltaY: number; container: HTMLElement | Document; isDocument: boolean }>) => {
    for (const { deltaX, deltaY, container, isDocument } of deltas) {
      const affectedIds = scrollParentCache.getIdsInContainer(container);

      const dragModel = peek(dragging);
      if (dragModel) {
        if (isDocument || affectedIds?.has(dragModel.id)) {
          dragModel.rect.updateWithOffset(deltaX, deltaY);
        }
      }

      for (const dropModel of dropCache.values()) {
        const dropNode = peek(dropModel.node);
        if (
          dropNode &&
          registry.isValidDropNode(dropNode, dropModel.id) &&
          !peek(dropModel.disabled) &&
          (isDocument || affectedIds?.has(dropModel.id))
        ) {
          dropModel.rect.updateWithOffset(deltaX, deltaY);
        }
      }
    }
  };

  const scrollBatcher = makeScrollBatcher(applyScrollDeltas);

  effect(() => {
    const unsubScroll = onEvent(
      document,
      'scroll',
      (event) => {
        if (!isDragging()) {
          return;
        }

        const target = event.target;
        if (!target) return;

        const isDocument = target === document || target === document.documentElement;
        const currentTop = isDocument ? window.scrollY : (target as HTMLElement).scrollTop;
        const currentLeft = isDocument ? window.scrollX : (target as HTMLElement).scrollLeft;

        const { deltaX, deltaY } = scrollTracker.getDelta(target, currentTop, currentLeft);

        if (deltaX !== 0 || deltaY !== 0) {
          const scrollContainer = isDocument ? document : target as HTMLElement;
          scrollBatcher.addDelta(scrollContainer, deltaX, deltaY, isDocument);
        }
      },
      { passive: true, capture: true },
    );

    const unsubDragStop = sensor.onDragEnd(
      wrap(() => {
        scrollBatcher.flush();

        const dragModel = dragging();
        const dropModel = dropping();

        if (dragModel) {
          dragListeners.get(dragModel)?.emitDragEnd(dragModel.context());
          onDragEnd?.(dragModel.context());
          dragging.set(null);
        }

        if (dragModel && dropModel) {
          dropListeners
            .get(dropModel)
            ?.emitDrop(dragModel.context(), dropModel.context());
          onDrop?.(dragModel.context(), dropModel.context());
          dropping.set(null);
        }
      }),
    );

    const unsubDrag = sensor.onMovePointer(
      wrap((position) => {
        if (!isDragging()) {
          return;
        }

        pointer.set(position);
      }),
    );

    const unsubCancel = sensor.onCancel(
      wrap(() => {
        scrollBatcher.clear();

        const dragModel = dragging();

        if (dragModel) {
          dragListeners.get(dragModel)?.emitDragCancel(dragModel.context());
          onDragCancel?.(dragModel.context());
          dragging.set(null);
        }

        dropping.set(null);
      }),
    );

    const unsubDragStart = sensor.onDragStart(
      wrap((event) => {
        const model = findTargetModel(event.target);

        if (!model) {
          return;
        }

        pointer.set(event.position);
        initScrollTracker(scrollTracker, event.target);

        const dropModels = dropCache.values();

        for (const dropModel of dropModels) {
          const dropNode = dropModel.node();

          if (
            dropNode &&
            registry.isValidDropNode(dropNode, dropModel.id) &&
            !dropModel.disabled()
          ) {
            dropModel.rect.update(dropNode.getBoundingClientRect());
          }
        }

        updatePosition(model.rect(), null);
        dragging.set(model);
        dragListeners.get(model)?.emitDragStart(peek(model.context));
        onDragStart?.(peek(model.context));
      }),
    );

    return () => {
      unsubScroll();
      unsubDragStart();
      unsubDragStop();
      unsubDrag();
      unsubCancel();
    };
  }, `${name}.sensorEffect`);

  effect(() => {
    const dragModel = dragging();

    if (!dragModel) {
      return;
    }

    rAF();

    const pointerPos = peek(pointer);
    const overlayRectValue = peek(overlay.rect);

    const dropModels = dropCache.values();
    const activeDropRects: RectWithId[] = [];

    for (const dropModel of dropModels) {
      const dropNode = peek(dropModel.node);

      if (
        dropNode &&
        registry.isValidDropNode(dropNode, dropModel.id) &&
        !peek(dropModel.disabled)
      ) {
        activeDropRects.push(peek(dropModel.rect));
      }
    }

    const collisions = intersectionStrategy({
      pointer: pointerPos,
      draggingRect: peek(dragModel.rect),
      droppingRects: activeDropRects,
      overlayRect: overlayRectValue,
    });

    const mainCollision = collisions.at(0);
    const nextDropModel =
      mainCollision && dropCache.get(mainCollision.droppingRect.id);

    updatePosition(peek(dragModel.rect), mainCollision?.droppingRect ?? null);

    const overlayNode = peek(overlay.node);

    if (overlayNode) {
      overlay.rect.updatePosition(peek(overlay.position));
    }

    const dropModel = peek(dropping);

    if (dropModel && dropModel !== nextDropModel) {
      dropListeners.get(dropModel)?.emitDropLeave(peek(dropModel.context));
      onDropLeave?.(peek(dragModel.context), peek(dropModel.context));
    }

    if (nextDropModel && nextDropModel !== dropModel) {
      dropping.set(nextDropModel);

      dropListeners
        .get(nextDropModel)
        ?.emitDropEnter(peek(nextDropModel.context));
      onDropEnter?.(peek(dragModel.context), peek(nextDropModel.context));
    } else if (!nextDropModel) {
      dropping.set(null);
    }
  }, `${name}.mainEffect`);

  return {
    dragging,
    dropping,
    isDragging,
    isDroppable,
    overlay,
    draggable({
      id,
      initialContext,
    }: CreateDraggable<DragContext>): DragModel<DragContext> {
      const internalId = `${refCounter++}:${id}`;

      const listeners = makeDragListeners<DragContext>();

      const cache = dragCache.get(id);

      const model: DragModel<DragContext> = {
        id,
        context: atom(initialContext, `${name}.draggable.${id}.context`),
        node: atom(
          cache?.node() ?? null,
          `${name}.draggable.${id}.node`,
        ).extend(
          withChangeHook((state, prev) => {
            if (prev) {
              registry.unregisterDrag(prev, id);
              scrollParentCache.unregister(prev, id);
            }
            if (state) {
              registry.registerDrag(state, id);
              scrollParentCache.register(state, id);
            }
          }),
        ),
        activatorNode: atom(null, `${name}.draggable.${id}.activatorNode`).extend(
          withChangeHook((state, prev) => {
            if (prev) registry.unregisterDrag(prev, id);
            if (state) registry.registerDrag(state, id);
          }),
        ),
        rect: makeRect(name, id, new DOMRect()),
        disabled: reatomBoolean(false, `${name}.draggable.${id}.disabled`),
        onDragStart: listeners.onDragStart,
        onDragEnd: listeners.onDragEnd,
        onDragCancel: listeners.onDragCancel,
        isActive: computed(
          () => dragging() === model,
          `${name}.draggable.${id}.isActive`,
        ),
        dispose: () => {
          dragListeners.get(model)?.clear();
          dragListeners.delete(model);

          if (dragCache.get(id)?.[PRIVATE_META].internalId === internalId) {
            dragCache.delete(id);
          }

          unsub();
        },
        [PRIVATE_META]: { type: 'drag', internalId },
      };

      const unsub = makeResizeEffect(model.node, model.rect);

      if (cache) {
        cache.dispose();
      }

      dragCache.set(id, model);
      dragListeners.set(model, listeners);

      return model;
    },
    droppable({ id, initialContext }: CreateDroppable<DropContext>) {
      const internalId = `${refCounter++}:${id}`;

      const listeners = makeDropListeners<DragContext, DropContext>();

      const cache = dropCache.get(id);

      const model: DropModel<DragContext, DropContext> = {
        id,
        context: atom(initialContext, `${name}.droppable.${id}.context`),
        node: atom(
          cache?.node() ?? null,
          `${name}.droppable.${id}.node`,
        ).extend(
          withChangeHook((state, prev) => {
            if (prev) {
              registry.unregisterDrop(prev, id);
              scrollParentCache.unregister(prev, id);
            }
            if (state) {
              registry.registerDrop(state, id);
              scrollParentCache.register(state, id);
            }
          }),
        ),
        rect: makeRect(name, id, new DOMRect()),
        disabled: reatomBoolean(false, `${name}.droppable.${id}.disabled`),
        onDropEnter: listeners.onDropEnter,
        onDrop: listeners.onDrop,
        onDropLeave: listeners.onDropLeave,
        isActive: computed(
          () => dropping() === model,
          `${name}.droppable.${id}.isActive`,
        ),
        dispose: () => {
          dropListeners.get(model)?.clear();
          dropListeners.delete(model);

          if (dropCache.get(id)?.[PRIVATE_META].internalId === internalId) {
            dropCache.delete(id);
          }

          unsub();
        },
        [PRIVATE_META]: { type: 'drop', internalId },
      };

      const unsub = makeResizeEffect(model.node, model.rect);

      if (cache) {
        cache.dispose();
      }

      dropCache.set(id, model);
      dropListeners.set(model, listeners);

      return model;
    },
  };
};

export type ReatomDnd<DragContext, DropContext> = ReturnType<
  typeof reatomDnd<DragContext, DropContext>
>;
