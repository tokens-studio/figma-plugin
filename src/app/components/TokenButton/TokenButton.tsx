import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SingleToken } from '@/types/tokens';
import { MoreButton } from '../MoreButton';
import { TokenTypes } from '@/constants/TokenTypes';

import { DragOverItem } from './DragOverItem';
import { DraggableWrapper } from './DraggableWrapper';
import { ShowFormOptions } from '@/types/ShowFormOptions';

import { activeTokenSetSelector } from '@/selectors';

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

export const TokenButton: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  type,
  token,
  showForm,
  draggedToken,
  dragOverToken,
  setDraggedToken,
  setDragOverToken,
}) => {
  const dispatch = useDispatch();
  const activeTokenSet = useSelector(activeTokenSetSelector);

  const handleChangeFromParam: React.ChangeEventHandler = React.useCallback((event) => {
    dispatch.tokenState.editTokenValue({
      name: token.name,
      set: activeTokenSet,
      value: event.target.value,
    });
  }, [dispatch.tokenState, activeTokenSet]);

  const createInputForToken = React.useCallback(() => {
    switch (token.type) {
      case TokenTypes.COLOR:
        return (
          <input type="color" value={token.value} onChange={handleChangeFromParam} />
        );
      default:
        if (typeof token.value === 'string') {
          if (typeof Number(token.value) === 'number') {
            return <input type="number" value={token.value} />;
          }
          return <input value={token.value} />;
        }
        // Add a default case to handle other types
        return null;
    }
  }, [token, handleChangeFromParam]);

  return (
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
      {createInputForToken()}
      <DragOverItem
        token={token}
        draggedToken={draggedToken}
        dragOverToken={dragOverToken}
      />
    </DraggableWrapper>
  );
};
