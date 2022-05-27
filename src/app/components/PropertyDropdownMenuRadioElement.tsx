import React from 'react';
import { DropdownMenuRadioItem } from './DropdownMenu';

type Props = {
  property: string,
  index:number,
  propertySelected: (property: string) => void
};

export const PropertyDropdownMenuRadioElement: React.FC<Props> = ({ property, index, propertySelected }) => {
  const onSelect = React.useCallback(() => propertySelected(property), [property, propertySelected]);

  return (
    <DropdownMenuRadioItem key={`property_${index}`} value={property} onSelect={onSelect}>
      {` ${property}`}
    </DropdownMenuRadioItem>
  );
};
