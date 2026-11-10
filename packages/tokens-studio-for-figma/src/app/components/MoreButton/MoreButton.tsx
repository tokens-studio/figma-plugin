/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-console */

import React, { useMemo } from 'react';
import { useDispatch, useStore } from 'react-redux';

import { ContextMenu } from '@tokens-studio/ui';
import {
  activeTokenSetReadOnlySelector, editProhibitedSelector, mainNodeSelectionValuesSelector, showEditFormSelector,
} from '@/selectors';
import { PropertyObject } from '@/types/properties';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import useSetNodeData from '@/hooks/useSetNodeData';
import { Dispatch, RootState } from '@/app/store';
import { TokensContext } from '@/context';
import { SelectionValue, ShowFormOptions } from '@/types';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { track } from '@/utils/analytics';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import TokenButtonContent from '../TokenButton/TokenButtonContent';
import { useGetActiveState } from '@/hooks';
import { usePropertiesForTokenType } from '../../hooks/usePropertiesForType';
import { getAliasValue } from '@/utils/alias';
import { MoreButtonMenuItems } from './MoreButtonMenuItems';

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
  const store = useStore<RootState>();

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
      // Read the store at click time: subscribing to it here would make every token re-check (or
      // re-render) on each store update, which stalls large token lists
      const state = store.getState();
      const canEdit = !editProhibitedSelector(state) && !activeTokenSetReadOnlySelector(state);
      if (canEdit && ((isMacBrowser && event.metaKey) || (!isMacBrowser && event.ctrlKey))) {
        handleEditClick();
      } else {
        const mainNodeSelectionValues = mainNodeSelectionValuesSelector(state);
        // Find the property that currently has this token
        const activeProperty = activeStateProperties.find(
          (prop) => mainNodeSelectionValues[prop.name] === token.name,
        );

        if (activeProperty) {
          // If token is active on a specific property, toggle that property
          handleClick(activeProperty, true);
        } else {
          // If token is not active, apply it to the first property
          handleClick(properties[0]);
        }
      }
    },
    [handleEditClick, handleClick, properties, activeStateProperties, store, token.name],
  );

  // Closing the menu returns focus to the token. When Edit or Duplicate just opened the edit form,
  // that focus lands outside the (non-modal) form, which closes it again straight away.
  const handleCloseAutoFocus = React.useCallback((event: Event) => {
    if (showEditFormSelector(store.getState())) {
      event.preventDefault();
    }
  }, [store]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger id={`${token.name}-button}`}>
        <TokenButtonContent type={type} active={active} onClick={handleTokenClick} token={token} />
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content alignOffset={5} collisionPadding={30} onCloseAutoFocus={handleCloseAutoFocus}>
          <MoreButtonMenuItems
            token={token}
            visibleProperties={visibleProperties}
            showForm={showForm}
            onPropertyClick={handleClick}
          />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  );
};
