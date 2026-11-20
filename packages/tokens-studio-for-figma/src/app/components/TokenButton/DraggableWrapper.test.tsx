import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore, fireEvent, render } from '../../../../tests/config/setupTest';
import { DraggableWrapper } from './DraggableWrapper';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

const small: SingleToken = { name: 'radius.small', value: '2', type: TokenTypes.BORDER_RADIUS };
const medium: SingleToken = { name: 'radius.medium', value: '4', type: TokenTypes.BORDER_RADIUS };
const large: SingleToken = { name: 'radius.large', value: '8', type: TokenTypes.BORDER_RADIUS };
const brand: SingleToken = { name: 'color.brand', value: '#ff0000', type: TokenTypes.COLOR };

function setup(token: SingleToken, draggedToken: SingleToken | null = null) {
  const mockStore = createMockStore({
    tokenState: {
      activeTokenSet: 'global',
      tokens: { global: [small, medium, large, brand] },
    },
  });
  const setTokens = jest.spyOn(mockStore.dispatch.tokenState, 'setTokens').mockImplementation(() => ({} as any));
  const setDraggedToken = jest.fn();
  const setDragOverToken = jest.fn();
  const result = render(
    <Provider store={mockStore}>
      <DraggableWrapper
        token={token}
        draggedToken={draggedToken}
        dragOverToken={null}
        setDraggedToken={setDraggedToken}
        setDragOverToken={setDragOverToken}
      >
        <span>{token.name}</span>
      </DraggableWrapper>
    </Provider>,
  );
  const wrapper = result.getByText(token.name).parentElement as HTMLElement;
  return {
    wrapper, setTokens, setDraggedToken, setDragOverToken,
  };
}

describe('DraggableWrapper', () => {
  it('is draggable for named tokens but not for numeric ones', () => {
    expect(setup(small).wrapper).toHaveAttribute('draggable', 'true');
    expect(setup({ name: 'spacing.4', value: '4', type: TokenTypes.SPACING }).wrapper).toHaveAttribute('draggable', 'false');
  });

  it('tracks the dragged token and the token dragged over', () => {
    const { wrapper, setDraggedToken, setDragOverToken } = setup(medium);

    fireEvent.dragStart(wrapper);
    expect(setDraggedToken).toHaveBeenCalledWith(medium);

    fireEvent.dragEnter(wrapper);
    fireEvent.drag(wrapper);
    fireEvent.dragOver(wrapper);
    expect(setDragOverToken).toHaveBeenCalledWith(medium);

    fireEvent.dragLeave(wrapper);
    fireEvent.dragEnd(wrapper);
    expect(setDragOverToken).toHaveBeenLastCalledWith(null);
  });

  it('moves a dragged token up to the token it is dropped on', () => {
    const { wrapper, setTokens } = setup(small, large);
    fireEvent.drop(wrapper);
    expect(setTokens).toHaveBeenCalledWith({ global: [large, small, medium, brand] });
  });

  it('moves a dragged token down to just before the token it is dropped on', () => {
    const { wrapper, setTokens } = setup(large, small);
    fireEvent.drop(wrapper);
    expect(setTokens).toHaveBeenCalledWith({ global: [medium, small, large, brand] });
  });

  it('ignores drops between tokens of different types or without a dragged token', () => {
    const differentType = setup(brand, small);
    fireEvent.drop(differentType.wrapper);
    expect(differentType.setTokens).not.toHaveBeenCalled();

    const nothingDragged = setup(small, null);
    fireEvent.drop(nothingDragged.wrapper);
    expect(nothingDragged.setTokens).not.toHaveBeenCalled();
  });

  it('ignores drops of a token that is not in the active set', () => {
    const { wrapper, setTokens } = setup(small, { name: 'radius.missing', value: '1', type: TokenTypes.BORDER_RADIUS });
    fireEvent.drop(wrapper);
    expect(setTokens).not.toHaveBeenCalled();
  });
});
