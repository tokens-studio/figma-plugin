import React, {
  useCallback, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activeThemeSelector, themeOptionsSelector } from '@/selectors';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '../DropdownMenu';
import { Flex } from '../Flex';
import Text from '../Text';
import { styled } from '@/stitches.config';
import IconToggleableDisclosure from '@/app/components/IconToggleableDisclosure';
import { Dispatch } from '@/app/store';
import ProBadge from '../ProBadge';
import { useFlags } from '../LaunchDarkly';
import { track } from '@/utils/analytics';
import { ReorderGroup } from '@/motion/ReorderGroup';
import { DragItem } from '../StyledDragger/DragItem';
import { ThemeListItemContent } from './ThemeListItemContent';

const ThemeDropdownLabel = styled(Text, {
  marginRight: '$2',
});

type AvailableThemeItem = {
  value: string;
  label: string;
};

export const ThemeSelector: React.FC = () => {
  const { tokenThemes } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const [mappedItems, setMappedItems] = useState(availableThemes);

  const handleClearTheme = useCallback(() => {
    dispatch.tokenState.setActiveTheme({ themeId: null, shouldUpdateNodes: true });
  }, [dispatch]);

  const handleSelectTheme = useCallback((themeId: string) => {
    const nextTheme = (activeTheme === themeId) ? null : themeId;
    if (nextTheme) {
      track('Apply theme', { id: nextTheme });
    } else {
      track('Reset theme');
    }
    dispatch.tokenState.setActiveTheme({ themeId: nextTheme, shouldUpdateNodes: true });
  }, [dispatch, activeTheme]);

  const handleManageThemes = useCallback(() => {
    dispatch.uiState.setManageThemesModalOpen(true);
  }, [dispatch]);

  const activeThemeLabel = useMemo(() => {
    if (activeTheme) {
      const themeOption = mappedItems.find(({ value }) => value === activeTheme);
      return themeOption ? themeOption.label : 'Unknown';
    }
    return 'None';
  }, [activeTheme, mappedItems]);

  const handleReorder = React.useCallback((reorderedItems: AvailableThemeItem[]) => {
    console.log('resoodddd', reorderedItems);
    setMappedItems(reorderedItems);
  }, []);
  return (
    <Flex alignItems="center" css={{ flexShrink: 0 }}>
      <DropdownMenu>
        <DropdownMenuTrigger data-cy="themeselector-dropdown" data-testid="themeselector-dropdown">
          <Flex>
            <ThemeDropdownLabel muted size="small">Theme:</ThemeDropdownLabel>
            <Text size="small">{activeThemeLabel}</Text>
          </Flex>
          <IconToggleableDisclosure />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-testid="themeselector-dropdown-content"
          side="bottom"
          css={{ minWidth: '180px' }}
        >
          <DropdownMenuRadioGroup value={activeTheme ?? ''}>
            {mappedItems.length === 0 && (
              <DropdownMenuRadioItem value="" disabled={!activeTheme} onSelect={handleClearTheme}>
                <Text>No themes</Text>
              </DropdownMenuRadioItem>
            )}
            <ReorderGroup
              layoutScroll
              values={mappedItems}
              onReorder={handleReorder}
            >
              {mappedItems.map((item) => (
                <DragItem<AvailableThemeItem> key={item.value} item={item}>
                  <ThemeListItemContent item={item} isActive={item.value === activeTheme} onClick={handleSelectTheme} />
                </DragItem>
              ))}
            </ReorderGroup>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            data-cy="themeselector-managethemes"
            css={{
              paddingLeft: '$6', fontSize: '$small', display: 'flex', justifyContent: 'space-between',
            }}
            disabled={!tokenThemes}
            onSelect={handleManageThemes}
          >
            <span>Manage themes</span>
            {!tokenThemes && <ProBadge compact />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  );
};
