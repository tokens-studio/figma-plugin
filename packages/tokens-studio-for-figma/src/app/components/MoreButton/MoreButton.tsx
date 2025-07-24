/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-console */

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import copy from 'copy-to-clipboard';

import { ContextMenu } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { activeTokenSetReadOnlySelector, activeTokenSetSelector, editProhibitedSelector } from '@/selectors';
import { PropertyObject } from '@/types/properties';
import { MoreButtonProperty } from './MoreButtonProperty';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import useSetNodeData from '@/hooks/useSetNodeData';
import { Dispatch } from '@/app/store';
import { TokensContext } from '@/context';
import { SelectionValue, ShowFormOptions } from '@/types';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { track } from '@/utils/analytics';
import useManageTokens from '@/app/store/useManageTokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import TokenButtonContent from '../TokenButton/TokenButtonContent';
import { useGetActiveState } from '@/hooks';
import { usePropertiesForTokenType } from '../../hooks/usePropertiesForType';
import { getAliasValue } from '@/utils/alias';

const RightSlot = styled('div', {
  marginLeft: 'auto',
  paddingLeft: 16,
  color: '$contextMenuFg',
  ':focus > &': { color: 'white' },
  '[data-disabled] &': { color: '$disabled' },
});

// @TODO typing

type Props = {
  token: SingleToken;
  type: TokenTypes;
  showForm: (options: ShowFormOptions) => void;
};

export const MoreButton: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  token,
  type,
  showForm,
}) => {
  const tokensContext = React.useContext(TokensContext);
  const setNodeData = useSetNodeData();
  const dispatch = useDispatch<Dispatch>();
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const { deleteSingleToken } = useManageTokens();

  const canEdit = !editProhibited && !activeTokenSetReadOnly;

  const resolvedValue = useMemo(
    () => getAliasValue(token, tokensContext.resolvedTokens),
    [token, tokensContext.resolvedTokens],
  );

  const properties = usePropertiesForTokenType(type, resolvedValue?.toString());

  // @TODO check type property typing
  const visibleProperties = React.useMemo(() => properties.filter((p) => p.label), [properties]);

  const handleEditClick = React.useCallback(() => {
    showForm({ name: token.name, token, status: EditTokenFormStatus.EDIT });
  }, [token, showForm]);

  const handleCopyTokenName = (props: unknown, text: string) => {
    copy(text, {});
  };

  const handleDeleteClick = React.useCallback(() => {
    deleteSingleToken({
      parent: activeTokenSet,
      path: token.name,
      type: token.type,
      sourceId: token.$extensions?.['studio.tokens']?.urn,
    });
  }, [activeTokenSet, deleteSingleToken, token.$extensions, token.name, token.type]);

  const handleDuplicateClick = React.useCallback(() => {
    showForm({ name: `${token.name}-copy`, token, status: EditTokenFormStatus.DUPLICATE });
  }, [showForm, token]);

  // TODO: This should probably move to state or a hook
  const setPluginValue = React.useCallback(
    async (value: SelectionValue) => {
      dispatch.uiState.startJob({ name: BackgroundJobs.UI_APPLYNODEVALUE });
      await setNodeData(value, tokensContext.resolvedTokens);
      dispatch.uiState.completeJob(BackgroundJobs.UI_APPLYNODEVALUE);
    },
    [dispatch, tokensContext.resolvedTokens, setNodeData],
  );

  const activeStateProperties = React.useMemo(() => {
    const childProperties: PropertyObject[] = [];
    properties.forEach((property) => {
      if (property.childProperties) {
        childProperties.push(...property.childProperties);
      }
    });
    return [...properties, ...childProperties, ...DocumentationProperties];
  }, [properties]);

  const active = useGetActiveState(activeStateProperties, type, token.name);

  const handleClick = React.useCallback(
    (givenProperties: PropertyObject, isActive = active) => {
      track('Apply Token', { givenProperties });
      const newProps: SelectionValue = {
        [givenProperties.name]: isActive ? 'delete' : token.name,
      };
      if (givenProperties.clear) {
        givenProperties.clear.map((item) => Object.assign(newProps, { [item]: 'delete' }));
      }

      setPluginValue(newProps);
    },
    [active, token.name, setPluginValue],
  );

  const handleTokenClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const isMacBrowser = /Mac/.test(navigator.platform);
      if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
        handleEditClick();
      } else {
        handleClick(properties[0]);
      }
    },
    [canEdit, handleEditClick, handleClick, properties],
  );

  return (
    <ContextMenu>
      <ContextMenu.Trigger id={`${token.name}-button}`}>
        <TokenButtonContent type={type} active={active} onClick={handleTokenClick} token={token} />
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content alignOffset={5} collisionPadding={30}>
          {visibleProperties.map((property) => (property.childProperties ? (
            <ContextMenu.Sub key={property.label}>
              <ContextMenu.SubTrigger>
                {property.label}
                <RightSlot>
                  <ChevronRightIcon />
                </RightSlot>
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent alignOffset={-5} collisionPadding={30}>
                  {property.childProperties.map((childProperty) => (
                    <MoreButtonProperty
                      key={childProperty.name}
                      value={token.name}
                      property={childProperty}
                      onClick={handleClick}
                    />
                  ))}
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          ) : (
            <MoreButtonProperty
              key={property.name}
              value={token.name}
              property={property}
              onClick={handleClick}
              disabled={property.disabled}
            />
          )))}
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>
              Documentation Tokens
              <RightSlot>
                <ChevronRightIcon />
              </RightSlot>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent alignOffset={-5} collisionPadding={30}>
                {DocumentationProperties.map((property) => (
                  <MoreButtonProperty
                    key={property.name}
                    value={token.name}
                    property={property}
                    onClick={handleClick}
                  />
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
          <ContextMenu.Separator />
          <ContextMenu.Item onSelect={handleEditClick} disabled={!canEdit}>
            Edit Token
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={handleDuplicateClick} disabled={!canEdit}>
            Duplicate Token
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={(event) => handleCopyTokenName(event, token.name)}>
            Copy Token Path
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={handleDeleteClick} disabled={!canEdit}>
            Delete Token
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  );
};
