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
import TokenButtonContent from '../TokenButton/TokenButtonContent';
import { useGetActiveState } from '@/hooks';
import { usePropertiesForTokenType } from '../../hooks/usePropertiesForType';

const RightSlot = styled('div', {
  marginLeft: 'auto',
  paddingLeft: 16,
  color: '$contextMenuForeground',
  ':focus > &': { color: 'white' },
  '[data-disabled] &': { color: '$disabled' },
});

// @TODO typing

type Props = {
  token: SingleToken;
  type: TokenTypes,
  showForm: (options: ShowFormOptions) => void;
};

export const MoreButton: React.FC<Props> = ({
  token,
  type,
  showForm,
}) => {
  const tokensContext = React.useContext(TokensContext);
  const setNodeData = useSetNodeData();
  const dispatch = useDispatch<Dispatch>();
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const { deleteSingleToken } = useManageTokens();
  const properties = usePropertiesForTokenType(type);
  // @TODO check type property typing
  const visibleProperties = React.useMemo(() => (
    properties.filter((p) => p.label)
  ), [properties]);

  const handleEditClick = React.useCallback(() => {
    showForm({ name: token.name, token, status: EditTokenFormStatus.EDIT });
  }, [token, showForm]);

  const handleDeleteClick = React.useCallback(() => {
    deleteSingleToken({ parent: activeTokenSet, path: token.name });
  }, [activeTokenSet, deleteSingleToken, token.name]);

  const handleDuplicateClick = React.useCallback(() => {
    showForm({ name: `${token.name}-copy`, token, status: EditTokenFormStatus.DUPLICATE });
  }, [showForm, token]);

  // TODO: This should probably move to state or a hook
  const setPluginValue = React.useCallback(async (value: SelectionValue) => {
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_APPLYNODEVALUE });
    await setNodeData(value, tokensContext.resolvedTokens);
    dispatch.uiState.completeJob(BackgroundJobs.UI_APPLYNODEVALUE);
  }, [dispatch, tokensContext.resolvedTokens, setNodeData]);

  const activeStateProperties = React.useMemo(() => (
    [...properties, ...DocumentationProperties]
  ), [properties]);
  const active = useGetActiveState(activeStateProperties, type, token.name);

  const handleClick = React.useCallback((givenProperties: PropertyObject | PropertyObject[], isActive = active) => {
    const propsToSet = (Array.isArray(givenProperties) ? givenProperties : [givenProperties]).map((prop) => (
      extend(true, {}, prop) as typeof prop
    ));
    track('Apply Token', { givenProperties });
    let value = isActive ? 'delete' : token.name;

    if (propsToSet[0].clear && !isActive) {
      value = 'delete';
      propsToSet[0].forcedValue = String(token.name);
    }
    const newProps = {
      [propsToSet[0].name || propsToSet[0]]: propsToSet[0].forcedValue || value,
    };
    if (propsToSet[0].clear) propsToSet[0].clear.map((item) => Object.assign(newProps, { [item]: 'delete' }));

    if (type === 'composition' && isActive && !propsToSet[0].clear) {
      // distructure composition token when it is unselected
      const compositionToken = tokensContext.resolvedTokens.find((resolvedToken) => resolvedToken.name === String(token.name));
      const tokensInCompositionToken: NodeTokenRefMap = {};
      if (compositionToken) {
        Object.keys(compositionToken.value).forEach((property: string) => {
          tokensInCompositionToken[property as CompositionTokenProperty] = 'delete';
        });
      }
      tokensInCompositionToken.composition = 'delete';
      setPluginValue(tokensInCompositionToken);
    } else setPluginValue(newProps);
  }, [active, token.name, type, setPluginValue, tokensContext.resolvedTokens]);

  const handleTokenClick = React.useCallback(() => {
    handleClick(properties[0]);
  }, [properties, handleClick]);

  return (
    <ContextMenu>
      <ContextMenuTrigger id={`${token.name}-button}`}>
        <TokenButtonContent type={type} active={active} onClick={handleTokenClick} token={token} />
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
