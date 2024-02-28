import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Label } from '@tokens-studio/ui';
import { SelectPoint3d as VariableIcon, SunLight } from 'iconoir-react';
import { FileDirectoryIcon } from '@primer/octicons-react';
import { styled } from '@stitches/react';
import Box from '../Box';
import { ThemeObject } from '@/types';
import Stack from '../Stack';
import IconDiveInto from '@/icons/dive-into.svg';
import { StyledThemeMetaLabel } from './StyledThemeMetaLabel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { Switch, SwitchThumb } from '../Switch';
import { Dispatch } from '@/app/store';
import { activeThemeSelector } from '@/selectors';
import StyleIcon from '@/icons/style.svg';

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
  minWidth: 'calc(4ch + $space$2 + $sizes$4)',
  gap: '$2',
  fontSize: '$xsmall',
  fontVariantNumeric: 'tabular-nums',
  color: '$fgMuted',
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
      }}
    >

      <Switch checked={isActive} onCheckedChange={handleToggle}>
        <SwitchThumb />
      </Switch>
      <Label>
        {' '}
        {theme.name}
      </Label>

      <StyledCountLabel>
        {tokenSetCount > 0 && (
        <>
          {tokenSetCount}
          {' '}
          sets
        </>
        )}
      </StyledCountLabel>
      <StyledCountLabel>
        {stylesCount > 0 && (
        <>
          {tokenSetCount}
          {' '}
          {stylesCount === 1 ? 'style' : 'styles'}
        </>
        )}
      </StyledCountLabel>
      <StyledCountLabel>
        {variablesCount > 0 && (
        <>
          {tokenSetCount}
          {' '}
          variables
        </>
        )}
      </StyledCountLabel>

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
