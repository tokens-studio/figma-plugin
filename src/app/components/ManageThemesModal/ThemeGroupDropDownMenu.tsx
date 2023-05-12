import React, { useCallback } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import Box from '../Box';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  ScrollDropdownMenuRadioItem,
  ScrollDropdownMenuItemIndicator,
  DropdownMenuSeparator,
} from '../DropdownMenu';
import { styled } from '@/stitches.config';
import Button from '../Button';
import { IconPlus } from '@/icons';

type Props = {
  availableGroups: string[]
  selectedGroup?: string
  onChange: (value: string) => void
  addGroup: () => void
};

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  padding: 0,
});

export const ThemeGroupDropDownMenu: React.FC<Props> = ({
  availableGroups, selectedGroup, onChange, addGroup,
}) => {
  const handleSelectGroup = useCallback((groupName: string) => {
    onChange(groupName);
  }, [onChange]);

  const themeGroupList = React.useMemo(() => availableGroups.map((groupName) => {
    const handleSelect = () => handleSelectGroup(groupName);
    return (
      <ScrollDropdownMenuRadioItem
        key={groupName}
        value={groupName}
          // eslint-disable-next-line react/jsx-no-bind
        onSelect={handleSelect}
      >
        <Box css={{ width: '$5', marginRight: '$2' }}>
          <ScrollDropdownMenuItemIndicator>
            <CheckIcon />
          </ScrollDropdownMenuItemIndicator>
        </Box>
        <Box>
          {groupName}
        </Box>
      </ScrollDropdownMenuRadioItem>
    );
  }), [availableGroups, handleSelectGroup]);

  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger>
        {
          selectedGroup ? (
            <span>{selectedGroup}</span>
          ) : (
            <Button
              variant="secondary"
              icon={<IconPlus />}
            >
              Add group
            </Button>
          )
        }
      </StyledDropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        css={{ minWidth: '180px' }}
      >
        <DropdownMenuRadioGroup className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }} value={selectedGroup ?? ''}>
          {
            themeGroupList
          }
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          css={{
            paddingLeft: '$6', fontSize: '$small', display: 'flex', justifyContent: 'space-between',
          }}
          onSelect={addGroup}
        >
          <span>Create new group</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
