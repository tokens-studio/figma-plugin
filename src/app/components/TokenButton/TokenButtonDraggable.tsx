import React, { useCallback, useContext, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { activeTokenSetSelector, tokensSelector, uiDisabledSelector } from '@/selectors';
import { SingleToken } from '@/types/tokens';
import { Dispatch } from '@/app/store';
import { TokenTypes } from '@/constants/TokenTypes';
import { lightOrDark } from '@/utils/color';
import { TokensContext } from '@/context';
import { getAliasValue } from '@/utils/alias';
import { theme } from '@/stitches.config';

type Props = {
  active: boolean;
  displayType: 'GRID' | 'LIST'; // @TODO enum
  type: TokenTypes;
  token: SingleToken;
  draggedToken: SingleToken | null;
  dragOverToken: SingleToken | null;
  setDraggedToken: (token: SingleToken | null) => void;
  setDragOverToken: (token: SingleToken | null) => void;
};

export const TokenButtonDraggable: React.FC<Props> = ({
  active, displayType, type, token, draggedToken, setDraggedToken, setDragOverToken, children,
}) => {
  const tokensContext = useContext(TokensContext);
  const store = useStore();
  const dispatch = useDispatch<Dispatch>();
  const uiDisabled = useSelector(uiDisabledSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);

  const isDraggable = useMemo(() => (
    token.name && isNaN(Number(token.name.split('.')[token.name.split('.').length - 1]))
  ), [token]);

  const displayValue = useMemo(() => (
    getAliasValue(token, tokensContext.resolvedTokens)
  ), [token, tokensContext.resolvedTokens]);

  const [style, buttonClass] = React.useMemo(() => {
    const style: React.CSSProperties = {};
    const buttonClass: string[] = [];

    if (type === TokenTypes.BORDER_RADIUS) {
      style.borderRadius = `${displayValue}px`;
    } else if (type === TokenTypes.COLOR) {
      style['--backgroundColor'] = displayValue;
      style['--borderColor'] = lightOrDark(String(displayValue)) === 'light' ? theme.colors.border : theme.colors.borderMuted;

      buttonClass.push('button-property-color');
      if (displayType === 'LIST') {
        buttonClass.push('button-property-color-listing');
      }
    }

    if (active) {
      buttonClass.push('button-active');
    }

    return [style, buttonClass] as [typeof style, typeof buttonClass];
  }, [type, active, displayValue, displayType]);

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
      className={`relative mb-1 mr-1 button button-property ${buttonClass.join(' ')} ${
        uiDisabled && 'button-disabled'
      } `}
      style={style}
    >
      {children}
    </div>
  );
};
