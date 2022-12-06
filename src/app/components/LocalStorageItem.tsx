import React from 'react';
import Button from './Button';
import Box from './Box';
import { IconFile, IconDotaVertical } from '@/icons';
import { StyledStorageItem } from './StyledStorageItem';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from './DropdownMenu';

type Props = {
  onClick: () => void;
  isActive: boolean;
};

const LocalStorageItem = ({ onClick, isActive }: Props) => (
  <StyledStorageItem active={isActive}>
    <Box css={{
      alignItems: 'center', flexDirection: 'row', flexGrow: '1', display: 'flex', overflow: 'hidden', gap: '$3',
    }}
    >
      <Box>
        <IconFile />
      </Box>
      <Box css={{ fontSize: '$small', fontWeight: '$bold' }}>Local document</Box>
    </Box>
    <Box css={{ marginRight: '$3' }}>
      <Button id="button-storage-item-apply" variant={isActive ? 'primary' : 'secondary'} onClick={onClick}>
        {isActive ? 'Active' : 'Apply'}
      </Button>
    </Box>
    <DropdownMenu>
      <DropdownMenuTrigger css={{ padding: '$1', background: 'none' }}>
        <IconDotaVertical />
      </DropdownMenuTrigger>
    </DropdownMenu>
  </StyledStorageItem>
);

export default LocalStorageItem;
