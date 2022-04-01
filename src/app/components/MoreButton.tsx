import React from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { styled } from '@/stitches.config';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuItemIndicator,
  ContextMenuTriggerItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ContextMenu';
import { editProhibitedSelector, mainNodeSelectionValuesSelector } from '@/selectors';

const RightSlot = styled('div', {
  marginLeft: 'auto',
  paddingLeft: 16,
  color: '$contextMenuForeground',
  ':focus > &': { color: 'white' },
  '[data-disabled] &': { color: '$disabled' },
});

// @TODO typing
function MoreButton({
  properties,
  documentationProperties,
  children,
  path,
  value,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}) {
  const mainNodeSelectionValues = useSelector(mainNodeSelectionValuesSelector);
  const editProhibited = useSelector(editProhibitedSelector);

  const visibleProperties = React.useMemo(() => (
    properties.filter((p) => p.label)
  ), [properties]);

  return (
    <ContextMenu>
      <ContextMenuTrigger id={`${path}-${value}`}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent sideOffset={5} collisionTolerance={30}>
        {visibleProperties.map((property) => {
          const isActive = mainNodeSelectionValues[property.name] === value;

          return (
            <ContextMenuCheckboxItem
              key={property.label}
              checked={isActive}
              onCheckedChange={() => onClick(property, isActive)}
            >
              <ContextMenuItemIndicator>
                <CheckIcon />
              </ContextMenuItemIndicator>
              {property.label}
            </ContextMenuCheckboxItem>
          );
        })}
        <ContextMenu>
          <ContextMenuTriggerItem>
            Documentation Tokens
            <RightSlot>
              <ChevronRightIcon />
            </RightSlot>
          </ContextMenuTriggerItem>
          <ContextMenuContent sideOffset={2} alignOffset={-5} collisionTolerance={30}>
            {documentationProperties.map((property) => {
              const isActive = mainNodeSelectionValues[property.name] === value;

              return (
                <ContextMenuCheckboxItem
                  key={property.label}
                  checked={isActive}
                  onCheckedChange={() => onClick(property, isActive)}
                >
                  <ContextMenuItemIndicator>
                    <CheckIcon />
                  </ContextMenuItemIndicator>
                  {property.label}
                </ContextMenuCheckboxItem>
              );
            })}
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
}

export default MoreButton;
