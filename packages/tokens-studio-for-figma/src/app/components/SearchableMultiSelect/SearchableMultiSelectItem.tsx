import React from 'react';
import { Box, Checkbox, Label } from '@tokens-studio/ui';

type Props = {
  id: string;
  item: string;
  isSelected: boolean;
  testIdPrefix: string;
  onItemSelected: (item: string) => void;
};

export const SearchableMultiSelectItem: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
  id,
  item,
  isSelected,
  testIdPrefix,
  onItemSelected,
}) => {
  const handleCheckedChange = React.useCallback(() => {
    onItemSelected(item);
  }, [item, onItemSelected]);

  return (
    <Box
      data-testid={`${testIdPrefix}-item-${item}`}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '$3',
        padding: '$2 $3',
        borderRadius: '$small',
        '&:hover': {
          backgroundColor: '$bgSubtle',
        },
      }}
    >
      <Checkbox
        id={id}
        checked={isSelected}
        onCheckedChange={handleCheckedChange}
        data-testid={`${testIdPrefix}-checkbox-${item}`}
      />
      <Label
        htmlFor={id}
        css={{
          flexGrow: 1,
          cursor: 'pointer',
          fontWeight: '$sansRegular',
          fontSize: '$xsmall',
          wordBreak: 'break-all',
        }}
      >
        {item}
      </Label>
    </Box>
  );
};
