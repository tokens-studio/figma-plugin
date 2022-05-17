import React, { useCallback, useMemo } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { TreeItem } from '@/utils/tokenset';
import { StyledThemeLabel } from './StyledThemeLabel';
import Box from '../Box';
import Stack from '../Stack';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
} from '../DropdownMenu';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import IconChevronDown from '@/icons/chevrondown.svg';

type Props = {
  item: TreeItem
  value: Record<string, TokenSetStatus>
  onChange: (value: Record<string, TokenSetStatus>) => void
};

const tokenSetStatusValues = Object.values(TokenSetStatus);
const tokenSetSatusLabels = {
  [TokenSetStatus.DISABLED]: 'Disabled',
  [TokenSetStatus.SOURCE]: 'Source',
  [TokenSetStatus.ENABLED]: 'Enabled',
};

export const TokenSetThemeItem: React.FC<Props> = ({
  item, value, children, onChange,
}) => {
  const tokenSetStatus = useMemo(() => (
    value?.[item.path] ?? TokenSetStatus.DISABLED
  ), [item.path, value]);

  const handleValueChange = useCallback((status: string) => {
    onChange({
      ...value,
      [item.path]: status as TokenSetStatus,
    });
  }, [item, value, onChange]);

  return (
    <>
      {children}
      <Box css={{ paddingLeft: '$2', width: '100%' }}>
        <Box css={{ padding: '$2', paddingLeft: `${5 * item.level}px` }}>
          <Stack direction="row" justify="between" align="center" css={{ width: '100%' }}>
            <StyledThemeLabel variant={item.isLeaf ? 'leaf' : 'folder'}>
              {item.label}
            </StyledThemeLabel>
            {item.isLeaf && (
              <DropdownMenu>
                <DropdownMenuTrigger data-cy={`tokensettheme-item--dropdown-trigger--${item.key}`}>
                  <span>{tokenSetSatusLabels[tokenSetStatus]}</span>
                  <IconChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom">
                  <DropdownMenuRadioGroup value={tokenSetStatus} onValueChange={handleValueChange}>
                    {tokenSetStatusValues.map((status) => (
                      <DropdownMenuRadioItem key={status} value={status} data-cy={`tokensettheme-item--dropdown-content--${status}`}>
                        <DropdownMenuItemIndicator>
                          <CheckIcon />
                        </DropdownMenuItemIndicator>
                        {tokenSetSatusLabels[status]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Stack>
        </Box>
      </Box>
    </>
  );
};
