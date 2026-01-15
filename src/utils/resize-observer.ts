export const makeResizeObserver = () => {
  type ResizeCallback = (entry: ResizeObserverEntry) => void;
  const callbackMap = new WeakMap<Element, ResizeCallback>();

  const sharedResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const callback = callbackMap.get(entry.target);
      if (callback) {
        callback(entry);
      }
    }
  });

  return {
    observe: (element: Element, callback: ResizeCallback) => {
      callbackMap.set(element, callback);
      sharedResizeObserver.observe(element);
      return () => {
        callbackMap.delete(element);
        sharedResizeObserver.unobserve(element);
      };
    },
  };
};
