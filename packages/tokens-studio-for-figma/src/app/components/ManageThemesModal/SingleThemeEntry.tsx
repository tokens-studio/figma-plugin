import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconButton, Label, Stack, Switch, Box,
} from '@tokens-studio/ui';
import { styled } from '@stitches/react';
import { ThemeObject } from '@/types';
import IconDiveInto from '@/icons/dive-into.svg';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { Dispatch } from '@/app/store';
import { activeThemeSelector } from '@/selectors';

type Props = {
  theme: ThemeObject
  isActive: boolean
  groupName: string
  onOpen: (theme: ThemeObject) => void
};

const StyledCountLabel = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '$2',
  fontSize: '$xsmall',
  color: '$fgMuted',
  '&:not(:last-of-type)::after': {
    content: "'·'",
    paddingRight: '$1',
    marginRight: '$1',
    color: '$fgMuted',
  },
  variants: {
    variant: {
      danger: {
        color: '$dangerFg',
      },
    },
  },
});

export const SingleThemeEntry: React.FC<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  theme, isActive, groupName, onOpen,
}) => {
  const activeTheme = useSelector(activeThemeSelector);
  const dispatch = useDispatch<Dispatch>();

  const tokenSetCount = useMemo(() => (
    Object.entries(theme.selectedTokenSets)
      .filter(([, status]) => status !== TokenSetStatus.DISABLED)
      .length
  ), [theme]);

  const stylesCount = useMemo(() => (
    Object.values(theme.$figmaStyleReferences ?? {}).length
  ), [theme]);

  const variablesCount = useMemo(() => (
    Object.values(theme.$figmaVariableReferences ?? {}).length
  ), [theme]);

  const handleOpenClick = useCallback(() => {
    onOpen(theme);
  }, [theme, onOpen]);

  const handleToggle = useCallback(() => {
    const newActiveTheme = activeTheme;
    if (isActive) {
      delete newActiveTheme[groupName];
    } else {
      newActiveTheme[groupName] = theme.id;
    }
    dispatch.tokenState.setActiveTheme({ newActiveTheme, shouldUpdateNodes: true });
  }, [dispatch, theme.id, isActive, activeTheme, groupName]);

  return (
    <Box
      key={theme.id}
      data-testid="singlethemeentry"
      css={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: 'min-content auto repeat(3, max-content) min-content',
        alignItems: 'center',
        gridGap: '$2',
        flex: 1,
      }}
    >

      <Switch checked={isActive} onCheckedChange={handleToggle} />
      <Label>
        {' '}
        {theme.name}
      </Label>

      <Stack>
        {tokenSetCount > 0 ? (
          <StyledCountLabel>
            {tokenSetCount}
            {' '}
            {tokenSetCount === 1 ? 'set' : 'sets'}
          </StyledCountLabel>
        ) : <StyledCountLabel variant="danger">No sets defined</StyledCountLabel>}
        {stylesCount > 0 && (
        <StyledCountLabel>
          {stylesCount}
          {' '}
          {stylesCount === 1 ? 'style' : 'styles'}
        </StyledCountLabel>
        )}
        {variablesCount > 0 && (
        <StyledCountLabel>
          {variablesCount}
          {' '}
          {variablesCount === 1 ? 'variable' : 'variables'}
        </StyledCountLabel>
        )}
      </Stack>

      <IconButton
        data-testid={`singlethemeentry-${theme.id}`}
        icon={<IconDiveInto />}
        onClick={handleOpenClick}
        size="small"
        variant="invisible"
      />

    </Box>
  );
};
