import React from 'react';
import { DropdownMenu } from '@tokens-studio/ui';

type Props = {
  item: string,
  index:number,
  itemSelected: (item: string) => void
};

export const DropdownMenuRadioElement: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({ item, index, itemSelected }) => {
  const onSelect = React.useCallback(() => itemSelected(item), [item, itemSelected]);

  return (
    <DropdownMenu.RadioItem data-testid={`item-dropdown-menu-element-${item}`} key={`item_${index}`} value={item} onSelect={onSelect}>
      {` ${item}`}
    </DropdownMenu.RadioItem>
  );
};
