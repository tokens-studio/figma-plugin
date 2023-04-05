import React from 'react';
import { DropdownMenuRadioItem } from './DropdownMenu';

type Props = {
  item: string,
  index:number,
  itemSelected: (item: string) => void
};

export const DropdownMenuRadioElement: React.FC<Props> = ({ item, index, itemSelected }) => {
  const onSelect = React.useCallback(() => itemSelected(item), [item, itemSelected]);

  return (
    <DropdownMenuRadioItem data-cy={`item-dropdown-menu-element-${item}`} key={`item_${index}`} value={item} onSelect={onSelect}>
      {` ${item}`}
    </DropdownMenuRadioItem>
  );
};
