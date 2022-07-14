import React from 'react';
import extend from 'just-extend';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { SingleToken } from '@/types/tokens';
import { MoreButton } from '../MoreButton';
import useManageTokens from '../../store/useManageTokens';
import { Dispatch } from '../../store';
import BrokenReferenceIndicator from '../BrokenReferenceIndicator';
import { waitForMessage } from '@/utils/waitForMessage';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { TokenTooltip } from '../TokenTooltip';
import { TokensContext } from '@/context';
import { SelectionValue } from '@/types';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { useGetActiveState } from '@/hooks';
import { usePropertiesForTokenType } from '../../hooks/usePropertiesForType';
import { TokenTypes } from '@/constants/TokenTypes';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { PropertyObject } from '@/types/properties';
import {
  activeTokenSetSelector,
} from '@/selectors';
import { useSetNodeData } from '@/hooks/useSetNodeData';
import { DragOverItem } from './DragOverItem';
import { TokenButtonDraggable } from './TokenButtonDraggable';
import type { ShowFormOptions } from '../TokenTree';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';

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
  const tokensContext = React.useContext(TokensContext);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const setNodeData = useSetNodeData();
  const { deleteSingleToken, duplicateSingleToken } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();

  const { name } = token;
  // Only show the last part of a token in a group
  const visibleName = React.useMemo(() => {
    const visibleDepth = 1;
    return (name ?? '').split('.').slice(-visibleDepth).join('.');
  }, [name]);

  const properties = usePropertiesForTokenType(type);
  // @TODO check type property typing
  const activeStateProperties = React.useMemo(() => (
    [...properties, ...DocumentationProperties]
  ), [properties]);
  const active = useGetActiveState(activeStateProperties, type, name);
  const showValue = React.useMemo(() => {
    let showValue = true;
    if (type === TokenTypes.COLOR) {
      showValue = false;
      if (displayType === 'LIST') {
        showValue = true;
      }
    }
    return showValue;
  }, [type, displayType]);

  const handleEditClick = React.useCallback(() => {
    showForm({ name, token, status: EditTokenFormStatus.EDIT });
  }, [name, token, showForm]);

  const handleDeleteClick = React.useCallback(() => {
    deleteSingleToken({ parent: activeTokenSet, path: name });
  }, [activeTokenSet, name, deleteSingleToken]);

  const handleDuplicateClick = React.useCallback(() => {
    showForm({ name, token, status: EditTokenFormStatus.DUPLICATE });
  }, [showForm, name, token]);

  const setPluginValue = React.useCallback((value: SelectionValue) => {
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_APPLYNODEVALUE });
    setNodeData(value, tokensContext.resolvedTokens);
    waitForMessage(MessageFromPluginTypes.REMOTE_COMPONENTS).then(() => {
      dispatch.uiState.completeJob(BackgroundJobs.UI_APPLYNODEVALUE);
    });
  }, [dispatch, tokensContext.resolvedTokens, setNodeData]);

  const handleClick = React.useCallback((givenProperties: PropertyObject | PropertyObject[], isActive = active) => {
    const propsToSet = (Array.isArray(givenProperties) ? givenProperties : [givenProperties]).map((prop) => (
      extend(true, {}, prop) as typeof prop
    ));
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

    if (type === 'composition' && value === 'delete') {
      // distructure composition token when it is unselected
      const compositionToken = tokensContext.resolvedTokens.find((token) => token.name === tokenValue);
      const tokensInCompositionToken: NodeTokenRefMap = {};
      if (compositionToken) {
        Object.keys(compositionToken.value).forEach((property: string) => {
          tokensInCompositionToken[property as CompositionTokenProperty] = 'delete';
        });
      }
      tokensInCompositionToken.composition = 'delete';
      setPluginValue(tokensInCompositionToken);
    } else setPluginValue(newProps);
  }, [name, active, setPluginValue]);

  const handleTokenClick = React.useCallback(() => {
    handleClick(properties[0]);
  }, [properties, handleClick]);

  return (
    <TokenButtonDraggable
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
        onClick={handleClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
        onEdit={handleEditClick}
        value={name}
        path={name}
      >
        <TokenTooltip token={token}>
          <button
            className="w-full h-full relative"
            type="button"
            onClick={handleTokenClick}
          >
            <BrokenReferenceIndicator token={token} />
            <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
          </button>
        </TokenTooltip>
      </MoreButton>
      <DragOverItem
        displayType={displayType}
        token={token}
        draggedToken={draggedToken}
        dragOverToken={dragOverToken}
      />
    </TokenButtonDraggable>
  );
};
