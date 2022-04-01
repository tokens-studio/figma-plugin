import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'lodash.isequal';
import { track } from '@/utils/analytics';
import { SingleToken } from '@/types/tokens';
import MoreButton from './MoreButton';
import useManageTokens from '../store/useManageTokens';
import { Dispatch } from '../store';
import useTokens from '../store/useTokens';
import BrokenReferenceIndicator from './BrokenReferenceIndicator';
import { waitForMessage } from '@/utils/waitForMessage';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import TokenTooltipWrapper from './TokenTooltipWrapper';
import { lightOrDark } from '@/utils/color';
import { TokensContext } from '@/context';
import { SelectionValue } from '@/types';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { useGetActiveState } from '@/hooks';
import { usePropertiesForTokenType } from '../hooks/usePropertiesForType';
import { TokenTypes } from '@/constants/TokenTypes';
import { PropertyObject } from '@/types/properties';
import { getAliasValue } from '@/utils/alias';
import type { ShowFormOptions } from './TokenTree';
import { uiStateSelector, activeTokenSetSelector, tokensSelector } from '@/selectors';

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

const TokenButton: React.FC<Props> = ({
  type,
  token,
  showForm,
  displayType,
  draggedToken,
  dragOverToken,
  setDraggedToken,
  setDragOverToken,
}) => {
  const tokensContext = React.useContext(TokensContext);
  const uiState = useSelector(uiStateSelector, isEqual);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const tokens = useSelector(tokensSelector);
  const { setNodeData } = useTokens();
  const { deleteSingleToken, duplicateSingleToken } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();

  const displayValue = React.useMemo(() => (
    getAliasValue(token, tokensContext.resolvedTokens)
  ), [token, tokensContext.resolvedTokens]);

  const { name } = token;
  // Only show the last part of a token in a group
  const visibleName = React.useMemo(() => {
    const visibleDepth = 1;
    return name.split('.').slice(-visibleDepth).join('.');
  }, [name]);

  const properties = usePropertiesForTokenType(type);
  // @TODO check type property typing
  const activeStateProperties = React.useMemo(() => (
    [...properties, ...DocumentationProperties]
  ), [properties]);
  const active = useGetActiveState(activeStateProperties, type, name);
  const [style, showValue, buttonClass] = React.useMemo(() => {
    const style: React.CSSProperties = {};
    let showValue = true;
    const buttonClass: string[] = [];

    if (type === TokenTypes.BORDER_RADIUS) {
      style.borderRadius = `${displayValue}px`;
    } else if (type === TokenTypes.COLOR) {
      showValue = false;
      style['--backgroundColor'] = displayValue;
      style['--borderColor'] = lightOrDark(String(displayValue)) === 'light' ? '#e7e7e7' : 'white';

      buttonClass.push('button-property-color');
      if (uiState.displayType === 'LIST') {
        buttonClass.push('button-property-color-listing');
        showValue = true;
      }
    }

    if (active) {
      buttonClass.push('button-active');
    }

    return [style, showValue, buttonClass] as [typeof style, typeof showValue, typeof buttonClass];
  }, [type, active, uiState, displayValue]);

  const handleEditClick = React.useCallback(() => {
    showForm({ name, token });
  }, [name, token, showForm]);

  const handleDeleteClick = React.useCallback(() => {
    deleteSingleToken({ parent: activeTokenSet, path: name });
  }, [activeTokenSet, name, deleteSingleToken]);

  const handleDuplicateClick = React.useCallback(() => {
    duplicateSingleToken({ parent: activeTokenSet, name });
  }, [activeTokenSet, name, duplicateSingleToken]);

  const handleDrag = React.useCallback((e: React.DragEvent<HTMLDivElement>) => e.stopPropagation(), []);
  const handleDragEnter = React.useCallback((e: React.DragEvent<HTMLDivElement>) => e.stopPropagation(), []);
  const handleDragLeave = React.useCallback((e: React.DragEvent<HTMLDivElement>) => e.stopPropagation(), []);

  const handleDragStart = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
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
    let draggedTokenIndex: number | null = null;
    let dropTokenIndex: number | null = null;

    if (draggedToken && token && draggedToken.type === token.type) {
      tokens[activeTokenSet].forEach((element, index) => {
        if (element.name === draggedToken.name) draggedTokenIndex = index;
        if (element.name === token.name) dropTokenIndex = index;
      });
      if (draggedTokenIndex !== null && dropTokenIndex !== null) {
        const insertTokensIndex = draggedTokenIndex > dropTokenIndex ? dropTokenIndex : dropTokenIndex - 1;
        const set = tokens[activeTokenSet];
        set.splice(insertTokensIndex, 0, set.splice(draggedTokenIndex, 1)[0]);
        const newTokens = {
          ...tokens,
          [activeTokenSet]: set,
        };

        dispatch.tokenState.setTokens(newTokens);
      }
    }
  }, [token, draggedToken, dispatch, tokens, activeTokenSet]);

  const checkIfDraggable = React.useCallback(() => (
    isNaN(Number(token.name.split('.')[token.name.split('.').length - 1]))
  ), [token]);

  const checkDisplayType = React.useCallback(() => (
    token.type === TokenTypes.COLOR && displayType === 'LIST'
  ), [token, displayType]);

  // @TODO this should be useMemo for perf reasons
  const checkDragOverToken = React.useCallback(() => {
    if (
      draggedToken
      && draggedToken !== token
      && dragOverToken === token
      && checkIfDraggable()
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
  }, [token, draggedToken, dragOverToken, checkIfDraggable]);

  const setPluginValue = React.useCallback((value: SelectionValue) => {
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_APPLYNODEVALUE });
    setNodeData(value, tokensContext.resolvedTokens);
    waitForMessage(MessageFromPluginTypes.REMOTE_COMPONENTS).then(() => {
      dispatch.uiState.completeJob(BackgroundJobs.UI_APPLYNODEVALUE);
    });
  }, [dispatch, tokensContext.resolvedTokens, setNodeData]);

  const handleClick = React.useCallback((givenProperties: PropertyObject | PropertyObject[], isActive = active) => {
    const propsToSet = Array.isArray(givenProperties) ? givenProperties : [givenProperties];

    const tokenValue = name;
    track('Apply Token', { givenProperties });
    let value = isActive ? 'delete' : tokenValue;
    if (propsToSet[0].clear && !isActive) {
      value = 'delete';
      propsToSet[0].forcedValue = tokenValue;
    }
    const newProps = {
      [propsToSet[0].name || propsToSet[0]]: propsToSet[0].forcedValue || value,
    };
    if (propsToSet[0].clear) propsToSet[0].clear.map((item) => Object.assign(newProps, { [item]: 'delete' }));
    setPluginValue(newProps);
  }, [name, active, setPluginValue]);

  const draggerProps = React.useMemo(() => ({
    draggable: !!checkIfDraggable(),
    onDrag: handleDrag,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
  }), [
    checkIfDraggable,
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
        uiState.disabled && 'button-disabled'
      } `}
      style={style}
    >
      <MoreButton
        properties={properties}
        documentationProperties={DocumentationProperties}
        onClick={handleClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
        onEdit={handleEditClick}
        value={name}
        path={name}
      >
        <TokenTooltipWrapper token={token} resolvedTokens={tokensContext.resolvedTokens}>
          <button
            style={style}
            className="w-full h-full relativeƒ"
            type="button"
            onClick={() => handleClick(properties[0])}
          >
            <BrokenReferenceIndicator token={token} resolvedTokens={tokensContext.resolvedTokens} />

            <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
          </button>
        </TokenTooltipWrapper>
      </MoreButton>
      {/* @TODO fix this */}
      <div
        className={
          checkDragOverToken()
            ? checkDisplayType()
              ? 'drag-over-item-list-absolute'
              : 'drag-over-item-grid-absolute'
            : ''
        }
      />
    </div>
  );
};

export default TokenButton;
