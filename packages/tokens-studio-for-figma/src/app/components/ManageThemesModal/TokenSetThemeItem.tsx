import React, { useCallback, useMemo } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { Button, DropdownMenu, Select } from '@tokens-studio/ui';
import { TreeItem } from '@/utils/tokenset';
import { StyledThemeLabel } from './StyledThemeLabel';
import Box from '../Box';
import Stack from '../Stack';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import IconChevronDown from '@/icons/chevrondown.svg';
import TokenSetStatusIcon from './TokenSetStatusIcon';

DropdownMenu;

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

export const TokenSetThemeItem: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
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

  const handleCycleValue = useCallback(() => {
    const currentIndex = tokenSetStatusValues.indexOf(tokenSetStatus);
    const nextIndex = (currentIndex + 1) % tokenSetStatusValues.length;
    handleValueChange(tokenSetStatusValues[nextIndex]);
  }, [tokenSetStatus, handleValueChange]);

  const mapStatus = useMemo(() => {
    if (tokenSetStatus === TokenSetStatus.ENABLED) {
      return 'enabled';
    }
    if (tokenSetStatus === TokenSetStatus.SOURCE) {
      return 'source';
    }
    return 'disabled';
  }, [tokenSetStatus]);

  return (
    (
      <Stack direction="row" align="center" css={{ width: '100%' }}>
        {item.level > 0 && (
        // repeat the box n times according to item.level
          (Array.from({ length: item.level }).map((_, index) => (
            <Box
            // eslint-disable-next-line react/no-array-index-key
              key={`${item.path}-indicator-${index}`}
              css={{
                marginLeft: '$3',
                height: '$7',
                width: '$4',
                borderLeft: '1px solid $borderMuted',
              }}
            />
          )))
        )}
        {children}
        {item.isLeaf && (
        <Stack
          direction="row"
          justify="between"
          align="center"
          css={{ width: '100%' }}
        >
          <Button size="small" variant="invisible" onClick={handleCycleValue}>
            <StyledThemeLabel variant="leaf" ignored={tokenSetStatus === TokenSetStatus.DISABLED}>
              <TokenSetStatusIcon status={mapStatus} />
              {item.label}
            </StyledThemeLabel>
          </Button>
          <Select value={tokenSetStatus} onValueChange={handleValueChange}>
            <Select.Trigger value={tokenSetSatusLabels[tokenSetStatus]} data-testid={`tokensettheme-item--select-trigger--${item.key}`} />
            <Select.Content>
              {tokenSetStatusValues.map((status) => (
                <Select.Item key={status} value={status} data-testid={`tokensettheme-item--select-content--${status}`}>
                  {tokenSetSatusLabels[status]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Stack>
        )}
      </Stack>
    )
  );
};
