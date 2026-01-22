import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { activeTokenSetSelector, tokensSelector } from '@/selectors';
import { SingleToken } from '@/types/tokens';
import { Dispatch, RootState } from '@/app/store';
import { getParentPath, wouldCauseNameCollision, getNewTokenName } from '@/utils/token';

type Props = {
  token: SingleToken;
  draggedToken: SingleToken | null;
  dragOverToken: SingleToken | null;
  setDraggedToken: (token: SingleToken | null) => void;
  setDragOverToken: (token: SingleToken | null) => void;
};

export const DraggableWrapper: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
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
    const tokenSet = tokens[activeTokenSet];

    if (!draggedToken || !token || draggedToken.type !== token.type) {
      return;
    }

    // Don't allow dropping on itself
    if (draggedToken.name === token.name) {
      return;
    }

    // Get the target parent path (where we're dropping the token)
    const targetParentPath = getParentPath(token.name);

    // Check if moving to a new parent would cause a name collision
    if (wouldCauseNameCollision(draggedToken, targetParentPath, tokenSet)) {
      // TODO: Show user-friendly error message
      console.warn('Cannot move token: A token with this name already exists in the target location');
      return;
    }

    // Find indices
    const draggedTokenIndex = tokenSet.findIndex((t) => t.name === draggedToken.name);
    const dropTokenIndex = tokenSet.findIndex((t) => t.name === token.name);

    if (draggedTokenIndex === -1 || dropTokenIndex === -1) {
      return;
    }

    // Create a copy of the token set
    const newSet = [...tokenSet];

    // Get the token being moved
    const [movedToken] = newSet.splice(draggedTokenIndex, 1);

    // Update the token's name if moving to a different parent
    const currentParent = getParentPath(draggedToken.name);
    const updatedToken = currentParent !== targetParentPath
      ? { ...movedToken, name: getNewTokenName(movedToken, targetParentPath) }
      : movedToken;

    // Calculate the insertion index
    // If dragging down (higher index), insert at dropTokenIndex
    // If dragging up (lower index), insert before dropTokenIndex
    const adjustedDropIndex = draggedTokenIndex > dropTokenIndex
      ? dropTokenIndex
      : dropTokenIndex - 1;

    // Insert the token at the new position
    newSet.splice(adjustedDropIndex, 0, updatedToken);

    // Update the tokens in the state
    dispatch.tokenState.setTokens({
      ...tokens,
      [activeTokenSet]: newSet,
    });
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
