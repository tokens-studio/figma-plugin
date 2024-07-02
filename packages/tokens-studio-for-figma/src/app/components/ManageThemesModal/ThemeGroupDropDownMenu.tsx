import React, { useCallback } from 'react';
import { Check } from 'iconoir-react';
import { Button, DropdownMenu } from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import Box from '../Box';
import { IconPlus } from '@/icons';

type Props = {
  availableGroups: string[]
  selectedGroup?: string
  onChange: (value: string) => void
  addGroup: () => void
};

export const ThemeGroupDropDownMenu: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  availableGroups, selectedGroup, onChange, addGroup,
}) => {
  const { t } = useTranslation(['tokens']);
  const handleSelectGroup = useCallback((groupName: string) => {
    onChange(groupName);
  }, [onChange]);

  const themeGroupList = React.useMemo(() => availableGroups.map((groupName) => {
    const handleSelect = () => handleSelectGroup(groupName);
    return (
      <DropdownMenu.RadioItem
        key={groupName}
        value={groupName}
          // eslint-disable-next-line react/jsx-no-bind
        onSelect={handleSelect}
      >
        <DropdownMenu.ItemIndicator>
          <Check />
        </DropdownMenu.ItemIndicator>
        <Box>
          {groupName}
        </Box>
      </DropdownMenu.RadioItem>
    );
  }), [availableGroups, handleSelectGroup]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        {
          selectedGroup ? (
            <Button variant="secondary" asDropdown size="small">
              <span>{selectedGroup}</span>
            </Button>
          ) : (
            <Box css={{ display: 'flex', alignItems: 'center', gap: '$2' }}>
              <Button
                data-testid="button-manage-themes-modal-group-dropdown"
                variant="secondary"
                icon={<IconPlus />}
                size="small"
                asDropdown
              >
                {t('addGroup')}
              </Button>
            </Box>
          )
        }
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          css={{
            maxWidth: '70vw',
          }}
        >
          <DropdownMenu.RadioGroup value={selectedGroup ?? ''}>
            {themeGroupList}
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            css={{
              paddingLeft: '$7',
            }}
            onSelect={addGroup}
          >
            {t('createNewGroup')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};
