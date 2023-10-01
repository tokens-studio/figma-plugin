import React from 'react';
import { SingleToken } from '@/types/tokens';
import { MoreButton } from '../MoreButton';
import { TokenTypes } from '@/constants/TokenTypes';

import { DragOverItem } from './DragOverItem';
import { DraggableWrapper } from './DraggableWrapper';
import { ShowFormOptions } from '@/types/ShowFormOptions';

// @TODO fix typings

type Props = {
  type: TokenTypes;
  token: SingleToken;
  showForm: (options: ShowFormOptions) => void;
  draggedToken: SingleToken | null;
  dragOverToken: SingleToken | null;
  setDraggedToken: (token: SingleToken | null) => void;
  setDragOverToken: (token: SingleToken | null) => void;
};

export const TokenButton: React.FC<Props> = ({
  type,
  token,
  showForm,
  draggedToken,
  dragOverToken,
  setDraggedToken,
  setDragOverToken,
}) => (
  <DraggableWrapper
    token={token}
    dragOverToken={dragOverToken}
    draggedToken={draggedToken}
    setDragOverToken={setDragOverToken}
    setDraggedToken={setDraggedToken}
  >
    {/* TODO: We should restructure and rename MoreButton as it's only ever used in TokenButton */}
    <MoreButton
      token={token}
      type={type}
      showForm={showForm}
    />
    <DragOverItem
      token={token}
      draggedToken={draggedToken}
      dragOverToken={dragOverToken}
    />
  </DraggableWrapper>
);
