import React, { SetStateAction, useCallback, useMemo } from 'react';
import {
  Button, Box, Stack, Select, ToggleGroup, Tooltip,
} from '@tokens-studio/ui';
import { Check, Xmark, CodeBrackets } from 'iconoir-react';
import { styled } from '@stitches/react';
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
  [TokenSetStatus.DISABLED]: 'Disabled',
  [TokenSetStatus.SOURCE]: 'Reference Only',
  [TokenSetStatus.ENABLED]: 'Enabled',
};

export const TokenSetThemeItem: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  item, value, children, onChange,
}) => {
  const tokenSetStatus = useMemo(() => (
    value?.[item.path] ?? TokenSetStatus.DISABLED
  ), [item.path, value]);

  const [statusValue, setStatusValue] = React.useState(tokenSetStatus);

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
                height: 'calc($7 + $2)',
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

          <StyledThemeLabel variant="leaf" ignored={statusValue === TokenSetStatus.DISABLED}>
            {item.label}
          </StyledThemeLabel>
          <ToggleGroup
            type="single"
            size="small"
            value={statusValue}
            // eslint-disable-next-line react/jsx-no-bind
            onValueChange={(val) => {
              if (val) setStatusValue(val as SetStateAction<TokenSetStatus>);
              onChange({ [val]: val as TokenSetStatus });
            }}
            defaultValue={tokenSetStatus}
          >
            {tokenSetStatusValues.map((status) => (

              <ToggleGroup.Item key={status} tooltip={tokenSetStatusLabels[status]} tooltipSide="top" value={status} data-testid={`tokensettheme-item--ToggleGroup-content--${item.label}--${status}`}>
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
