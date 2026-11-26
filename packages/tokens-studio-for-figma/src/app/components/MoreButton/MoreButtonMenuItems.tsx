import React from 'react';
import { useSelector } from 'react-redux';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import copy from 'copy-to-clipboard';

import { ContextMenu } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import {
  activeTokenSetReadOnlySelector, activeTokenSetSelector, editProhibitedSelector,
} from '@/selectors';
import { PropertyObject } from '@/types/properties';
import { MoreButtonProperty } from './MoreButtonProperty';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { SingleToken } from '@/types/tokens';
import { ShowFormOptions } from '@/types';
import useManageTokens from '@/app/store/useManageTokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';

const RightSlot = styled('div', {
  marginLeft: 'auto',
  paddingLeft: 16,
  color: '$contextMenuFg',
  ':focus > &': { color: 'white' },
  '[data-disabled] &': { color: '$disabled' },
});

type Props = {
  token: SingleToken;
  visibleProperties: PropertyObject[];
  showForm: (options: ShowFormOptions) => void;
  onPropertyClick: (property: PropertyObject, isActive: boolean) => void;
};

// Only mounted while the context menu is open, so its store subscriptions (useManageTokens pulls in
// useTokens and useConfirm) are not paid by every token in the list on every store update.
// Renders the items only: ContextMenu.Content has to stay the Portal's direct child, since the Portal
// passes it the ref that tracks the close animation.
export const MoreButtonMenuItems: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  token,
  visibleProperties,
  showForm,
  onPropertyClick,
}) => {
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const { deleteSingleToken } = useManageTokens();

  const canEdit = !editProhibited && !activeTokenSetReadOnly;

  const handleEditClick = React.useCallback(() => {
    showForm({ name: token.name, token, status: EditTokenFormStatus.EDIT });
  }, [token, showForm]);

  const handleDuplicateClick = React.useCallback(() => {
    showForm({ name: `${token.name}-copy`, token, status: EditTokenFormStatus.DUPLICATE });
  }, [showForm, token]);

  const handleCopyTokenName = React.useCallback(() => {
    copy(token.name, {});
  }, [token.name]);

  const handleDeleteClick = React.useCallback(() => {
    deleteSingleToken({
      parent: activeTokenSet,
      path: token.name,
      type: token.type,
      sourceId: token.$extensions?.['studio.tokens']?.urn,
    });
  }, [activeTokenSet, deleteSingleToken, token.$extensions, token.name, token.type]);

  return (
    <>
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
                  onClick={onPropertyClick}
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
          onClick={onPropertyClick}
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
                onClick={onPropertyClick}
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
      <ContextMenu.Item onSelect={handleCopyTokenName}>
        Copy Token Path
      </ContextMenu.Item>
      <ContextMenu.Item onSelect={handleDeleteClick} disabled={!canEdit}>
        Delete Token
      </ContextMenu.Item>
    </>
  );
};
