import {
  DependencyList,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Atom, log } from '@reatom/core';

import { ReatomDnd } from './model.ts';
import { PRIVATE_META } from './types.ts';
import { DragCallbacks, DropCallbacks } from './utils';

export { PRIVATE_META };

export const useNodeRef = <T extends HTMLElement>(): [
  RefObject<T | null>,
  (element: T | null) => void,
] => {
  const nodeRef = useRef<T | null>(null);
  const setNodeRef = useCallback((element: T | null) => {
    nodeRef.current = element;
  }, []);

  return [nodeRef, setNodeRef];
};

export const useDraggable = <DragContext, DropContext>(
  model: ReatomDnd<DragContext, DropContext>,
  {
    id,
    context,
    isDisabled,
    node,
    activatorNode,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    onDragCancel: _onDragCancel,
  }: {
    id: string;
    context: DragContext;
    isDisabled?: boolean;
    node?: Atom<HTMLElement | null>;
    activatorNode?: Atom<HTMLElement | null>;
  } & Partial<DragCallbacks<DragContext>>,
) => {
  const [nodeRef, setNodeRef] = useNodeRef();
  const [activatorNodeRef, setActivatorNodeRef] = useNodeRef();

  const onDragStart = useRef(_onDragStart);
  const onDragEnd = useRef(_onDragEnd);
  const onDragCancel = useRef(_onDragCancel);

  useEffect(() => {
    onDragStart.current = _onDragStart;
    onDragEnd.current = _onDragEnd;
    onDragCancel.current = _onDragCancel;
  });

  const [initialContext] = useState(context);

  const dragModel = useMemo(
    () => model.draggable({ id, initialContext }),
    [id, initialContext, model],
  );

  useEffect(() => {
    dragModel().context.set(context);
  }, [context, dragModel()]);

  useEffect(() => {
    dragModel().disabled.set(!!isDisabled);
  }, [dragModel(), isDisabled]);

  useEffect(() => {
    const unsubs = [
      onDragStart.current && dragModel().onDragStart(onDragStart.current),
      onDragEnd.current && dragModel().onDragEnd(onDragEnd.current),
      onDragCancel.current && dragModel().onDragCancel(onDragCancel.current),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, [dragModel]);

  useLayoutEffect(() => {
    if (node) {
      return node.subscribe((state) => dragModel().node.set(state));
    } else {
      dragModel().node.set(nodeRef.current);
    }
  }, [dragModel(), node, nodeRef]);

  useLayoutEffect(() => {
    if (activatorNode) {
      return activatorNode.subscribe((state) =>
        dragModel().activatorNode.set(state),
      );
    } else {
      dragModel().activatorNode.set(activatorNodeRef.current);
    }
  }, [dragModel(), activatorNode, activatorNodeRef]);

  return {
    ...dragModel(),
    setNodeRef,
    setActivatorNodeRef,
  };
};

export const useDroppable = <DragContext, DropContext>(
  model: ReatomDnd<DragContext, DropContext>,
  {
    id,
    context,
    isDisabled,
    node,
    onDrop: _onDrop,
    onDropEnter: _onDropEnter,
    onDropLeave: _onDropLeave,
  }: {
    id: string;
    context: DropContext;
    isDisabled?: boolean;
    node?: Atom<HTMLElement | null>;
  } & Partial<DropCallbacks<DragContext, DropContext>>,
) => {
  const [nodeRef, setNodeRef] = useNodeRef();

  const onDrop = useRef(_onDrop);
  const onDropEnter = useRef(_onDropEnter);
  const onDropLeave = useRef(_onDropLeave);

  useEffect(() => {
    onDrop.current = _onDrop;
    onDropEnter.current = _onDropEnter;
    onDropLeave.current = _onDropLeave;
  });

  const [initialContext] = useState(context);

  const dropModel = useMemo(
    () => model.droppable({ id, initialContext }),
    [id, initialContext, model],
  );

  useEffect(() => {
    dropModel().context.set(context);
  }, [context, dropModel()]);

  useEffect(() => {
    dropModel().disabled.set(!!isDisabled);
  }, [dropModel(), isDisabled]);

  useEffect(() => {
    const unsubs = [
      onDrop.current && dropModel().onDrop(onDrop.current),
      onDropEnter.current && dropModel().onDropEnter(onDropEnter.current),
      onDropLeave.current && dropModel().onDropLeave(onDropLeave.current),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub?.());
    };
  }, [dropModel]);

  useLayoutEffect(() => {
    if (node) {
      return node.subscribe((state) => dropModel().node.set(state));
    } else {
      dropModel().node.set(nodeRef.current);
    }
  }, [dropModel(), node, nodeRef]);

  return {
    ...dropModel(),
    setNodeRef,
  };
};

export const useOverlay = <DragContext, DropContext>(
  model: ReatomDnd<DragContext, DropContext>,
) => {
  const [nodeRef, setNodeRef] = useNodeRef();

  useLayoutEffect(() => {
    model.overlay.node.set(nodeRef.current);
  }, [model.overlay.node, nodeRef]);

  return {
    ...model.overlay,
    setNodeRef,
  };
};
