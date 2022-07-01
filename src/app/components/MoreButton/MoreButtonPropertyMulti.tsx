import React from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import {
  ContextMenuCheckboxItemMulti,
  ContextMenuItemIndicatorMulti,
} from '../ContextMenu';
import { PropertyObject } from '@/types/properties';
import { mainNodeSelectionValuesSelector } from '@/selectors';

type Props = {
  value: string;
  property: PropertyObject;
  onClick: (
    properties: PropertyObject | PropertyObject[],
    isActive: boolean
  ) => void;
};

export const MoreButtonPropertyMulti: React.FC<Props> = ({
  value,
  property,
  onClick,
}) => {
  const mainNodeSelectionValues = useSelector(mainNodeSelectionValuesSelector);
  const isActive = React.useMemo(
    () => mainNodeSelectionValues[property.name] === value,
    [value, property, mainNodeSelectionValues],
  );
  const handleClick = React.useCallback(() => {
    onClick(property, isActive);
  }, [property, isActive, onClick]);

  return (
    <ContextMenuCheckboxItemMulti key={property.label} onClick={handleClick}>
      <ContextMenuItemIndicatorMulti>
        {isActive && <CheckIcon />}
      </ContextMenuItemIndicatorMulti>
      {property.label}
    </ContextMenuCheckboxItemMulti>
  );
};
