export type ScrollPosition = {
  top: number;
  left: number;
};

export type ScrollDelta = {
  deltaX: number;
  deltaY: number;
};

export type ScrollTracker = ReturnType<typeof makeScrollTracker>;

export const makeScrollTracker = () => {
  let positions = new WeakMap<EventTarget, ScrollPosition>();

  return {
    init(target: EventTarget, top: number, left: number): void {
      positions.set(target, { top, left });
    },

    getDelta(target: EventTarget, currentTop: number, currentLeft: number): ScrollDelta {
      const prev = positions.get(target);
      positions.set(target, { top: currentTop, left: currentLeft });

      if (!prev) {
        return { deltaX: 0, deltaY: 0 };
      }

      return {
        deltaX: currentLeft - prev.left,
        deltaY: currentTop - prev.top,
      };
    },

    has(target: EventTarget): boolean {
      return positions.has(target);
    },

    clear(): void {
      positions = new WeakMap();
    },
  };
};

export const getScrollableParents = (element: HTMLElement): HTMLElement[] => {
  const scrollables: HTMLElement[] = [];
  let current: HTMLElement | null = element.parentElement;

  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    if (
      overflowY === 'auto' || overflowY === 'scroll' ||
      overflowX === 'auto' || overflowX === 'scroll'
    ) {
      scrollables.push(current);
    }
    current = current.parentElement;
  }

  return scrollables;
};

export const initScrollTracker = (
  tracker: ScrollTracker,
  element: HTMLElement,
): void => {
  tracker.init(document, window.scrollY, window.scrollX);

  const scrollables = getScrollableParents(element);
  for (const scrollable of scrollables) {
    tracker.init(scrollable, scrollable.scrollTop, scrollable.scrollLeft);
  }
};

export type ScrollParentCache = ReturnType<typeof makeScrollParentCache>;
export type ScrollBatcher = ReturnType<typeof makeScrollBatcher>;

export const makeScrollParentCache = () => {
  const containerToIds = new Map<HTMLElement | Document, Set<string>>();
  const elementToParents = new WeakMap<HTMLElement, (HTMLElement | Document)[]>();

  return {
    register(element: HTMLElement, id: string): void {
      const parents: (HTMLElement | Document)[] = [document, ...getScrollableParents(element)];

      elementToParents.set(element, parents);

      for (const parent of parents) {
        let ids = containerToIds.get(parent);
        if (!ids) {
          ids = new Set();
          containerToIds.set(parent, ids);
        }
        ids.add(id);
      }
    },

    unregister(element: HTMLElement, id: string): void {
      const parents = elementToParents.get(element);

      if (!parents) return;

      for (const parent of parents) {
        const ids = containerToIds.get(parent);
        if (ids) {
          ids.delete(id);
          if (ids.size === 0) {
            containerToIds.delete(parent);
          }
        }
      }

      elementToParents.delete(element);
    },

    getIdsInContainer(container: HTMLElement | Document): Set<string> | undefined {
      return containerToIds.get(container);
    },

    hasIdInContainer(container: HTMLElement | Document, id: string): boolean {
      const ids = containerToIds.get(container);
      return ids?.has(id) ?? false;
    },

    clear(): void {
      containerToIds.clear();
    },
  };
};

type PendingDelta = {
  deltaX: number;
  deltaY: number;
  container: HTMLElement | Document;
  isDocument: boolean;
};

export const makeScrollBatcher = (onApply: (deltas: PendingDelta[]) => void) => {
  const pendingDeltas = new Map<HTMLElement | Document, PendingDelta>();
  let rafId: number | null = null;

  const flush = () => {
    rafId = null;
    if (pendingDeltas.size === 0) return;

    const deltas = Array.from(pendingDeltas.values());
    pendingDeltas.clear();

    onApply(deltas);
  };

  return {
    addDelta(container: HTMLElement | Document, deltaX: number, deltaY: number, isDocument: boolean): void {
      const existing = pendingDeltas.get(container);
      if (existing) {
        existing.deltaX += deltaX;
        existing.deltaY += deltaY;
      } else {
        pendingDeltas.set(container, { deltaX, deltaY, container, isDocument });
      }

      if (rafId === null) {
        rafId = requestAnimationFrame(flush);
      }
    },

    flush(): void {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      flush();
    },

    clear(): void {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      pendingDeltas.clear();
    },
  };
};
