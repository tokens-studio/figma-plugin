import React from 'react';
import { SingleToken } from '@/types/tokens';
import { MoreButton } from '../MoreButton';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { useGetActiveState } from '@/hooks';
import { usePropertiesForTokenType } from '../../hooks/usePropertiesForType';
import { TokenTypes } from '@/constants/TokenTypes';

import { DragOverItem } from './DragOverItem';
import { DraggableWrapper } from './DraggableWrapper';
import { ShowFormOptions } from '@/types';

// @TODO fix typings

type Props = {
  type: TokenTypes;
  displayType: 'GRID' | 'LIST'; // @TODO enum
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
  displayType,
  draggedToken,
  dragOverToken,
  setDraggedToken,
  setDragOverToken,
}) => {
  const { name } = token;

  const properties = usePropertiesForTokenType(type);
  // @TODO check type property typing
  const activeStateProperties = React.useMemo(() => (
    [...properties, ...DocumentationProperties]
  ), [properties]);
  const active = useGetActiveState(activeStateProperties, type, name);

  return (
    <DraggableWrapper
      active={active}
      type={type}
      token={token}
      dragOverToken={dragOverToken}
      displayType={displayType}
      draggedToken={draggedToken}
      setDragOverToken={setDragOverToken}
      setDraggedToken={setDraggedToken}
    >
      <MoreButton
        properties={properties}
        displayType={displayType}
        token={token}
        type={type}
        showForm={showForm}
      />
      <DragOverItem
        displayType={displayType}
        token={token}
        draggedToken={draggedToken}
        dragOverToken={dragOverToken}
      />
    </DraggableWrapper>
  );
};
