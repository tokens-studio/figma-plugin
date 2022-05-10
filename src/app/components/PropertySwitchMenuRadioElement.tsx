import React from 'react';
import {
  PropertySwitchMenuRadioItem,
} from './PropertySwitchMenu';

type Props = {
  property: string,
  index:number,
  propertySelected: (property: string) => void
};

export const PropertySwitchMenuRadioElement: React.FC<Props> = ({ property, index, propertySelected }) => {
  const onSelect = React.useCallback(() => propertySelected(property), [property, propertySelected]);

  return (
    <PropertySwitchMenuRadioItem key={`property_${index}`} value={property} onSelect={onSelect}>
      {` ${property}`}
    </PropertySwitchMenuRadioItem>
  );
};
