import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { SingleTokenObject } from '@/types/tokens';
import getAliasValue from '@/utils/aliases';
import MoreButton from './MoreButton';
import { lightOrDark } from './utils';
import useManageTokens from '../store/useManageTokens';
import { Dispatch, RootState } from '../store';
import useTokens from '../store/useTokens';
import BrokenReferenceIndicator from './BrokenReferenceIndicator';
import { waitForMessage } from '@/utils/waitForMessage';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import TokenTooltipWrapper from './TokenTooltipWrapper';

export function useGetActiveState(properties, type, name) {
  const uiState = useSelector((state: RootState) => state.uiState);

  return (
    uiState.mainNodeSelectionValues[type] === name
    || properties.some((prop) => uiState.mainNodeSelectionValues[prop.name] === name)
  );
}

function TokenButton({
  type,
  token,
  showForm,
  displayType,
  resolvedTokens,
  draggedToken,
  dragOverToken,
  setDraggedToken,
  setDragOverToken,
}: {
  type: string | object;
  token: SingleTokenObject;
  showForm: Function;
  resolvedTokens: SingleTokenObject[];
  draggedToken: SingleTokenObject | null;
  dragOverToken: SingleTokenObject | null;
  setDraggedToken: Function;
  setDragOverToken: Function;
}) {
  const uiState = useSelector((state: RootState) => state.uiState);
  const { activeTokenSet } = useSelector((state: RootState) => state.tokenState);
  const tokenState = useSelector((state: RootState) => state.tokenState);
  const { setNodeData } = useTokens();
  const { deleteSingleToken, duplicateSingleToken } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();

  const displayValue = getAliasValue(token, resolvedTokens);

  let style;
  let showValue = true;
  let properties = [type];
  const { name } = token;
  // Only show the last part of a token in a group
  const visibleDepth = 1;
  const visibleName = name.split('.').slice(-visibleDepth).join('.');
  // @warning anti pattern - pushing into this array
  const buttonClass: string[] = [];

  const handleEditClick = () => {
    showForm({ name, token });
  };

  const handleDeleteClick = () => {
    deleteSingleToken({ parent: activeTokenSet, path: name });
  };
  const handleDuplicateClick = () => {
    duplicateSingleToken({ parent: activeTokenSet, name });
  };

  function setPluginValue(value) {
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_APPLYNODEVALUE });
    setNodeData(value, resolvedTokens);
    waitForMessage(MessageFromPluginTypes.REMOTE_COMPONENTS).then(() => {
      dispatch.uiState.completeJob(BackgroundJobs.UI_APPLYNODEVALUE);
    });
  }

  switch (type) {
    case 'borderRadius':
      style = { ...style, borderRadius: `${displayValue}px` };
      properties = [
        {
          label: 'All',
          name: 'borderRadius',
          clear: ['borderRadiusTopLeft', 'borderRadiusTopRight', 'borderRadiusBottomRight', 'borderRadiusBottomLeft'],
        },
        { label: 'Top Left', name: 'borderRadiusTopLeft' },
        { label: 'Top Right', name: 'borderRadiusTopRight' },
        { label: 'Bottom Right', name: 'borderRadiusBottomRight' },
        { label: 'Bottom Left', name: 'borderRadiusBottomLeft' },
      ];
      break;
    case 'spacing':
      properties = [
        { label: 'Gap', name: 'itemSpacing', icon: 'Gap' },
        {
          label: 'All',
          icon: 'Spacing',
          name: 'spacing',
          clear: [
            'horizontalPadding',
            'verticalPadding',
            'itemSpacing',
            'paddingLeft',
            'paddingRight',
            'paddingTop',
            'paddingBottom',
          ],
        },
        { label: 'Top', name: 'paddingTop' },
        { label: 'Right', name: 'paddingRight' },
        { label: 'Bottom', name: 'paddingBottom' },
        { label: 'Left', name: 'paddingLeft' },
      ];
      break;
    case 'sizing':
      properties = [
        {
          label: 'All',
          name: 'sizing',
          clear: ['width', 'height'],
        },
        { label: 'Width', name: 'width' },
        { label: 'Height', name: 'height' },
      ];
      break;
    case 'color':
      showValue = false;
      properties = [
        {
          label: 'Fill',
          name: 'fill',
        },
        {
          label: 'Border',
          name: 'border',
        },
      ];

      style = {
        '--backgroundColor': displayValue,
        '--borderColor': lightOrDark(displayValue) === 'light' ? '#e7e7e7' : 'white',
      };
      buttonClass.push('button-property-color');
      if (uiState.displayType === 'LIST') {
        buttonClass.push('button-property-color-listing');
        showValue = true;
      }
      break;
    default:
      break;
  }

  const documentationProperties = [
    {
      label: 'Name',
      name: 'tokenName',
      clear: ['tokenValue', 'value', 'description'],
    },
    {
      label: 'Raw value',
      name: 'tokenValue',
      clear: ['tokenName', 'value', 'description'],
    },
    {
      label: 'Value',
      name: 'value',
      clear: ['tokenName', 'tokenValue', 'description'],
    },
    {
      label: 'Description',
      name: 'description',
      clear: ['tokenName', 'tokenValue', 'value'],
    },
  ];

  const active = useGetActiveState([...properties, ...documentationProperties], type, name);

  if (active) {
    buttonClass.push('button-active');
  }

  const onClick = (givenProperties, isActive = active) => {
    const propsToSet = Array.isArray(givenProperties) ? givenProperties : new Array(givenProperties);

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
  };

  const onDragStart = (e) => {
    e.stopPropagation();
    setDraggedToken(token);
  };
  const onDragEnd = (e) => {
    e.stopPropagation();
    setDragOverToken(null);
  };
  const onDrag = (e) => e.stopPropagation();
  const onDragEnter = (e) => e.stopPropagation();
  const onDragLeave = (e) => e.stopPropagation();

  const onDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDragOverToken(token);
  };

  const onDrop = (e) => {
    e.stopPropagation();
    let draggedTokenIndex = null;
    let dropTokenIndex = null;

    if (draggedToken && token && draggedToken.type === token.type) {
      tokenState.tokens[tokenState.activeTokenSet].forEach((element, index) => {
        if (element.name === draggedToken.name) draggedTokenIndex = index;
        if (element.name === token.name) dropTokenIndex = index;
      });
      if (draggedTokenIndex !== null && dropTokenIndex !== null) {
        const insertTokensIndex = draggedTokenIndex > dropTokenIndex ? dropTokenIndex : dropTokenIndex - 1;
        const set = tokenState.tokens[tokenState.activeTokenSet];
        set.splice(insertTokensIndex, 0, set.splice(draggedTokenIndex, 1)[0]);
        const newTokens = {
          ...tokenState.tokens,
          [tokenState.activeTokenSet]: set,
        };

        dispatch.tokenState.setTokens(newTokens);
      }
    }
  };

  const checkDragOverToken = () => {
    // this method is to understand dragItem and dropItem are at the same level in the hierarchy and are of same type
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
  };

  const checkIfDraggable = () => isNaN(token?.name.split('.')[token?.name.split('.').length - 1]);

  const checkDisplayType = () => token.type === 'color' && displayType === 'LIST';

  const draggerProps = {
    draggable: !!checkIfDraggable(),
    onDrag,
    onDrop,
    onDragEnd,
    onDragEnter,
    onDragLeave,
    onDragStart,
    onDragOver,
  };

  return (
    <div
      {...draggerProps}
      className={`relative mb-1 mr-1 button button-property ${buttonClass.join(' ')} ${
        uiState.disabled && 'button-disabled'
      }`}
      style={style}
    >
      <MoreButton
        properties={properties}
        documentationProperties={documentationProperties}
        onClick={onClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
        onEdit={handleEditClick}
        value={name}
        path={name}
      >
        <TokenTooltipWrapper token={token} resolvedTokens={resolvedTokens}>
          <button
            style={style}
            className="w-full h-full relativeƒ"
            type="button"
            onClick={() => onClick(properties[0])}
          >
            <BrokenReferenceIndicator token={token} resolvedTokens={resolvedTokens} />

            <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
          </button>
        </TokenTooltipWrapper>
      </MoreButton>
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
}

export default TokenButton;
