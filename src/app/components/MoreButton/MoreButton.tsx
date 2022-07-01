import React from 'react';
import { useSelector } from 'react-redux';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { styled } from '@/stitches.config';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTriggerItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu';
import { editProhibitedSelector } from '@/selectors';
import { PropertyObject } from '@/types/properties';
import { MoreButtonProperty } from './MoreButtonProperty';
import { MoreButtonPropertyMulti } from './MoreButtonPropertyMulti';
import { DocumentationProperties } from '@/constants/DocumentationProperties';

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
  path: string;
  value: string;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClick: (
    properties: PropertyObject | PropertyObject[],
    isActive: boolean
  ) => void;
};

export const MoreButton: React.FC<Props> = ({
  properties,
  path,
  value,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  children,
}) => {
  const editProhibited = useSelector(editProhibitedSelector);

  const visibleProperties = React.useMemo(
    () => properties.filter((p) => p.label),
    [properties],
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger id={`${path}-${value}`}>
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent sideOffset={5} collisionTolerance={30}>
        {visibleProperties.map((property) => (
          <MoreButtonPropertyMulti
            key={`${property.name}-${property?.label}`}
            value={value}
            property={property}
            onClick={onClick}
          />
        ))}

        {/* <ContextMenuSeparator /> */}
        {/* {visibleProperties.map((property) => (
          <MoreButtonProperty
            key={`${property.name}-${property?.label}`}
            value={value}
            property={property}
            onClick={onClick}
          />
        ))} */}
        <ContextMenu>
          <ContextMenuTriggerItem>
            Documentation Tokens
            <RightSlot>
              <ChevronRightIcon />
            </RightSlot>
          </ContextMenuTriggerItem>
          <ContextMenuContent
            sideOffset={2}
            alignOffset={-5}
            collisionTolerance={30}
          >
            {DocumentationProperties.map((property) => (
              <MoreButtonProperty
                key={property.name}
                value={value}
                property={property}
                onClick={onClick}
              />
            ))}
          </ContextMenuContent>
        </ContextMenu>
        <ContextMenuSeparator />

        <ContextMenuItem onSelect={onEdit} disabled={editProhibited}>
          Edit Token
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDuplicate} disabled={editProhibited}>
          Duplicate Token
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDelete} disabled={editProhibited}>
          Delete Token
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
