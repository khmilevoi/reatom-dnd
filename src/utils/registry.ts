export type NodeRegistry = {
  registerDrag: (el: HTMLElement, id: string) => void;
  registerDrop: (el: HTMLElement, id: string) => void;
  unregisterDrag: (el: HTMLElement, id: string) => void;
  unregisterDrop: (el: HTMLElement, id: string) => void;

  getDragId: (el: HTMLElement) => string | undefined;
  getDropId: (el: HTMLElement) => string | undefined;
  getId: (el: HTMLElement) => string | undefined;

  findAncestorDragId: (target: HTMLElement | null) => string | undefined;

  isValidDragNode: (node: HTMLElement | null, id: string) => boolean;
  isValidDropNode: (node: HTMLElement | null, id: string) => boolean;
  isValid: (node: HTMLElement | null, id: string) => boolean;
};

export const makeNodeRegistry = (): NodeRegistry => {
  const dragMap = new WeakMap<HTMLElement, string>();
  const dropMap = new WeakMap<HTMLElement, string>();

  return {
    registerDrag(el, id) {
      dragMap.set(el, id);
      el.setAttribute('data-dnd-drag-id', id);
    },
    registerDrop(el, id) {
      dropMap.set(el, id);
      el.setAttribute('data-dnd-drop-id', id);
    },
    unregisterDrag(el, id) {
      if (dragMap.get(el) === id) {
        dragMap.delete(el);
        el.removeAttribute('data-dnd-drag-id');
      }
    },
    unregisterDrop(el, id) {
      if (dropMap.get(el) === id) {
        dropMap.delete(el);
        el.removeAttribute('data-dnd-drop-id');
      }
    },
    getDragId: (el) => dragMap.get(el),
    getDropId: (el) => dropMap.get(el),
    getId: (el) => dragMap.get(el) ?? dropMap.get(el),

    findAncestorDragId: (target) => {
      let current: HTMLElement | null = target;

      while (current) {
        const id = dragMap.get(current);
        if (id) return id;
        current = current.parentElement;
      }

      return undefined;
    },

    isValidDragNode: (node, id) =>
      !!node && node.isConnected && dragMap.get(node) === id,
    isValidDropNode: (node, id) =>
      !!node && node.isConnected && dropMap.get(node) === id,
    isValid: (node, id) =>
      !!node &&
      node.isConnected &&
      (dragMap.get(node) === id || dropMap.get(node) === id),
  };
};
