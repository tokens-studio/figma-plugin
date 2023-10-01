import React from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import {
  ContextMenuCheckboxItem,
  ContextMenuItemIndicator,
} from '../ContextMenu';
import { PropertyObject } from '@/types/properties';
import { mainNodeSelectionValuesSelector } from '@/selectors';

type Props = {
  value: string;
  property: PropertyObject;
  onClick: (properties: PropertyObject, isActive: boolean) => void;
  disabled?: boolean;
};

export const MoreButtonProperty: React.FC<Props> = ({
  value, property, onClick, disabled = false,
}) => {
  const mainNodeSelectionValues = useSelector(mainNodeSelectionValuesSelector);
  const isActive = React.useMemo(() => (
    mainNodeSelectionValues[property.name] === value
  ), [value, property, mainNodeSelectionValues]);
  const handleClick = React.useCallback((e) => {
    e.preventDefault();
    onClick(property, isActive);
  }, [property, isActive, onClick]);

  return (
    <ContextMenuCheckboxItem
      key={property.label}
      checked={isActive}
      onSelect={handleClick}
      disabled={disabled}
    >
      <ContextMenuItemIndicator>
        <CheckIcon />
      </ContextMenuItemIndicator>
      {property.label}
    </ContextMenuCheckboxItem>
  );
};
