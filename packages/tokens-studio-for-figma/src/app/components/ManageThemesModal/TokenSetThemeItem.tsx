import React, { useCallback, useMemo } from 'react';
import {
  Box, Stack, ToggleGroup,
} from '@tokens-studio/ui';
import { Check, Xmark, CodeBrackets } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { TreeItem } from '@/utils/tokenset';
import { StyledThemeLabel } from './StyledThemeLabel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

type Props = {
  item: TreeItem
  value: Record<string, TokenSetStatus>
  onChange: (value: Record<string, TokenSetStatus>) => void
};

const tokenSetStatusValues = Object.values(TokenSetStatus);
const tokenSetStatusLabels = {
  [TokenSetStatus.DISABLED]: 'disabled',
  [TokenSetStatus.SOURCE]: 'referenceOnly',
  [TokenSetStatus.ENABLED]: 'enabled',
};

export const TokenSetThemeItem: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  item, value, children, onChange,
}) => {
  const tokenSetStatus = useMemo(() => (
    value?.[item.path] ?? TokenSetStatus.DISABLED
  ), [item.path, value]);
  const { t } = useTranslation(['tokens']);

  const handleValueChange = useCallback((status: string) => {
    if (status) {
      onChange({
        ...value,
        [item.path]: status as TokenSetStatus,
      });
    }
  }, [item, value, onChange]);

  const statusIcon = (status) => {
    if (status === TokenSetStatus.ENABLED) {
      return <Check />;
    }
    if (status === TokenSetStatus.SOURCE) {
      return <CodeBrackets />;
    }
    return <Xmark />;
  };

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

          <StyledThemeLabel variant="leaf" ignored={tokenSetStatus === TokenSetStatus.DISABLED}>
            {item.label}
          </StyledThemeLabel>
          <ToggleGroup
            type="single"
            size="small"
            value={tokenSetStatus}
            onValueChange={handleValueChange}
            defaultValue={tokenSetStatus}
          >
            {tokenSetStatusValues.map((status) => (

              <ToggleGroup.Item key={status} tooltip={t(tokenSetStatusLabels[status])} tooltipSide="top" value={status} data-testid={`tokensettheme-item--ToggleGroup-content--${item.label}--${status}`}>
                {statusIcon(status)}
              </ToggleGroup.Item>

            ))}
          </ToggleGroup>
        </Stack>
        )}
      </Stack>
    )
  );
};
