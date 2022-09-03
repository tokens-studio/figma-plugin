import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import extend from 'just-extend';
import { styled } from '@/stitches.config';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTriggerItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu';
import { activeTokenSetSelector, editProhibitedSelector } from '@/selectors';
import { PropertyObject } from '@/types/properties';
import { MoreButtonProperty } from './MoreButtonProperty';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenTooltip } from '../TokenTooltip';
import BrokenReferenceIndicator from '../BrokenReferenceIndicator';
import { useSetNodeData } from '@/hooks/useSetNodeData';
import { Dispatch } from '@/app/store';
import { TokensContext } from '@/context';
import { SelectionValue, ShowFormOptions } from '@/types';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { track } from '@/utils/analytics';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import useManageTokens from '@/app/store/useManageTokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';

const RightSlot = styled('div', {
  marginLeft: 'auto',
  paddingLeft: 16,
  color: '$contextMenuForeground',
  ':focus > &': { color: 'white' },
  '[data-disabled] &': { color: '$disabled' },
});

// @TODO typing

type Props = {
  properties: PropertyObject[];
  token: SingleToken;
  displayType: 'LIST' | 'GRID';
  type: TokenTypes,
  showForm: (options: ShowFormOptions) => void;
};

export const MoreButton: React.FC<Props> = ({
  properties,
  token,
  displayType,
  type,
  showForm,
}) => {
  const tokensContext = React.useContext(TokensContext);
  const setNodeData = useSetNodeData();
  const dispatch = useDispatch<Dispatch>();
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const { deleteSingleToken } = useManageTokens();

  const visibleProperties = React.useMemo(() => (
    properties.filter((p) => p.label)
  ), [properties]);

  const showValue = React.useMemo(() => {
    let show = true;
    if (type === TokenTypes.COLOR) {
      show = false;
      if (displayType === 'LIST') {
        show = true;
      }
    }
    return show;
  }, [type, displayType]);

  // Only show the last part of a token in a group
  const visibleName = React.useMemo(() => {
    const visibleDepth = 1;
    return (token.name ?? '').split('.').slice(-visibleDepth).join('.');
  }, [token.name]);

  const handleEditClick = React.useCallback(() => {
    showForm({ name: token.name, token, status: EditTokenFormStatus.EDIT });
  }, [token, showForm]);

  const handleDeleteClick = React.useCallback(() => {
    deleteSingleToken({ parent: activeTokenSet, path: token.name });
  }, [activeTokenSet, deleteSingleToken, token.name]);

  const handleDuplicateClick = React.useCallback(() => {
    showForm({ name: `${token.name}-copy`, token, status: EditTokenFormStatus.DUPLICATE });
  }, [showForm, token]);

  const setPluginValue = React.useCallback(async (value: SelectionValue) => {
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_APPLYNODEVALUE });
    await setNodeData(value, tokensContext.resolvedTokens);
    dispatch.uiState.completeJob(BackgroundJobs.UI_APPLYNODEVALUE);
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
  }, [type, setPluginValue, tokensContext.resolvedTokens]);

  const handleTokenClick = React.useCallback(() => {
    handleClick(properties[0]);
  }, [properties, handleClick]);

  return (
    <ContextMenu>
      <ContextMenuTrigger id={`${token.name}-button}`}>
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
      </ContextMenuTrigger>
      <ContextMenuContent sideOffset={5} collisionTolerance={30}>
        {visibleProperties.map((property) => (
          <MoreButtonProperty
            key={property.name}
            value={token.name}
            property={property}
            onClick={handleClick}
          />
        ))}
        <ContextMenu>
          <ContextMenuTriggerItem>
            Documentation Tokens
            <RightSlot>
              <ChevronRightIcon />
            </RightSlot>
          </ContextMenuTriggerItem>
          <ContextMenuContent sideOffset={2} alignOffset={-5} collisionTolerance={30}>
            {DocumentationProperties.map((property) => (
              <MoreButtonProperty
                key={property.name}
                value={token.name}
                property={property}
                onClick={handleClick}
              />
            ))}
          </ContextMenuContent>
        </ContextMenu>
        <ContextMenuSeparator />

        <ContextMenuItem onSelect={handleEditClick} disabled={editProhibited}>
          Edit Token
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleDuplicateClick} disabled={editProhibited}>
          Duplicate Token
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleDeleteClick} disabled={editProhibited}>
          Delete Token
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
