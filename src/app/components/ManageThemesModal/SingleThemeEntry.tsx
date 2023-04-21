import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '../Box';
import { ThemeObject } from '@/types';
import Stack from '../Stack';
import IconDiveInto from '@/icons/dive-into.svg';
import { StyledThemeMetaLabel } from './StyledThemeMetaLabel';
import IconButton from '../IconButton';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { Switch, SwitchThumb } from '../Switch';
import { Dispatch } from '@/app/store';
import { activeThemeSelector } from '@/selectors';

type Props = {
  theme: ThemeObject
  isActive: boolean
  groupName: string
  onOpen: (theme: ThemeObject) => void
};

export const SingleThemeEntry: React.FC<Props> = ({
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
    <Box key={theme.id} data-cy="singlethemeentry" css={{ width: '100%' }}>
      <Stack direction="row" align="center" justify="between">
        <Stack gap={4} direction="row" align="center">
          <Switch checked={isActive} onCheckedChange={handleToggle}>
            <SwitchThumb />
          </Switch>
          <span>{theme.name}</span>
        </Stack>
        <Stack gap={4} direction="row" align="center">
          <StyledThemeMetaLabel>
            {`${tokenSetCount} Sets, ${stylesCount} Styles`}
          </StyledThemeMetaLabel>
          <IconButton
            dataCy={`singlethemeentry-${theme.id}`}
            icon={<IconDiveInto />}
            onClick={handleOpenClick}
          />
        </Stack>
      </Stack>
    </Box>
  );
};
