import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { activeTokenSetSelector, tokensSelector } from '@/selectors';
import { SingleToken } from '@/types/tokens';
import { Dispatch, RootState } from '@/app/store';

type Props = {
  token: SingleToken;
  draggedToken: SingleToken | null;
  dragOverToken: SingleToken | null;
  setDraggedToken: (token: SingleToken | null) => void;
  setDragOverToken: (token: SingleToken | null) => void;
};

export const DraggableWrapper: React.FC<Props> = ({
  token, draggedToken, setDraggedToken, setDragOverToken, children,
}) => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<Dispatch>();
  const activeTokenSet = useSelector(activeTokenSetSelector);

  const isDraggable = useMemo(() => (
    token.name && isNaN(Number(token.name.split('.')[token.name.split('.').length - 1]))
  ), [token]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => e.stopPropagation(), []);
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => e.stopPropagation(), []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => e.stopPropagation(), []);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDraggedToken(token);
  }, [token, setDraggedToken]);

  const handleDragEnd = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDragOverToken(null);
  }, [setDragOverToken]);

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setDragOverToken(token);
  }, [token, setDragOverToken]);

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const tokens = tokensSelector(store.getState());

    let draggedTokenIndex: number | null = null;
    let dropTokenIndex: number | null = null;

    if (draggedToken && token && draggedToken.type === token.type) {
      tokens[activeTokenSet].forEach((element, index) => {
        if (element.name === draggedToken.name) draggedTokenIndex = index;
        if (element.name === token.name) dropTokenIndex = index;
      });
      if (draggedTokenIndex !== null && dropTokenIndex !== null) {
        const insertTokensIndex = draggedTokenIndex > dropTokenIndex ? dropTokenIndex : dropTokenIndex - 1;
        const set = [...tokens[activeTokenSet]];
        set.splice(insertTokensIndex, 0, set.splice(draggedTokenIndex, 1)[0]);
        const newTokens = {
          ...tokens,
          [activeTokenSet]: set,
        };
        dispatch.tokenState.setTokens(newTokens);
      }
    }
  }, [store, token, draggedToken, dispatch, activeTokenSet]);

  const draggerProps = React.useMemo(() => ({
    draggable: !!isDraggable,
    onDrag: handleDrag,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
  }), [
    isDraggable,
    handleDrag,
    handleDrop,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDragStart,
    handleDragOver,
  ]);

  return (
    <div
      {...draggerProps}
    >
      {children}
    </div>
  );
};
