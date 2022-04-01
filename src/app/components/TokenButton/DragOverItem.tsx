import React, { useMemo } from 'react';
import cx from 'classnames';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

type Props = {
  displayType: 'GRID' | 'LIST'; // @TODO enum
  token: SingleToken;
  draggedToken: SingleToken | null;
  dragOverToken: SingleToken | null;
};

export const DragOverItem: React.FC<Props> = ({
  displayType,
  token,
  draggedToken,
  dragOverToken,
}) => {
  const isDraggable = useMemo(() => (
    isNaN(Number(token.name.split('.')[token.name.split('.').length - 1]))
  ), [token]);

  const isColorAndListDisplayType = useMemo(() => (
    token.type === TokenTypes.COLOR && displayType === 'LIST'
  ), [token, displayType]);

  const hasDragOverToken = useMemo(() => {
    if (
      draggedToken
      && draggedToken !== token
      && dragOverToken === token
      && isDraggable
      && draggedToken.type === dragOverToken.type
    ) {
      const draggedItemName = draggedToken?.name.split('.');
      const dragOverName = dragOverToken?.name.split('.');
      const draggedItemNameArray = draggedItemName.slice(0, draggedItemName.length - 1);
      const dragOverNameArray = dragOverName.slice(0, dragOverName.length - 1);

      if (draggedItemNameArray.toString() === dragOverNameArray.toString()) {
        return true;
      }
    }

    return false;
  }, [token, draggedToken, dragOverToken, isDraggable]);

  return (
    <div
      className={cx(
        (hasDragOverToken && isColorAndListDisplayType) && 'drag-over-item-list-absolute',
        (hasDragOverToken && !isColorAndListDisplayType) && 'drag-over-item-grid-absolute',
      )}
    />
  );
};
