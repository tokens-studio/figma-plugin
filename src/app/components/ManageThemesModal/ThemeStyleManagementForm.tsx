import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Sentry from '@sentry/react';
import { settingsStateSelector, tokensSelector, themeByIdSelector } from '@/selectors';
import { mapTokensToStyleInfo } from '@/utils/tokenset';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { Dispatch, RootState } from '@/app/store';
import { TokenTypes } from '@/constants/TokenTypes';
import Box from '../Box';
import { ThemeStyleManagementCategory } from './ThemeStyleManagementCategory';
import { AsyncMessageTypes, AttachLocalStylesToTheme } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import type { StyleInfo } from './ThemeStyleManagementCategoryStyleEntry';
import { track } from '@/utils/analytics';

type StyleInfoPerCategory = Partial<Record<'typography' | 'colors' | 'effects', Record<string, StyleInfo>>>;

type Props = {
  id: string
};

export const ThemeStyleManagementForm: React.FC<Props> = ({ id }) => {
  const [rawStyleInfo, setRawStyleInfo] = useState<StyleInfoPerCategory>({});
  const [resolvedStyleInfo, setResolvedStyleInfo] = useState<StyleInfoPerCategory>({});
  const dispatch = useDispatch<Dispatch>();
  const theme = useSelector(useCallback((state: RootState) => (
    themeByIdSelector(state, id)
  ), [id]));
  const settings = useSelector(settingsStateSelector);
  const tokenSets = useSelector(tokensSelector);

  const stylesInfo = useMemo(() => {
    if (theme) {
      const stylePathSlice = settings.ignoreFirstPartForStyles ? 1 : 0;
      const stylePathPrefix = settings.prefixStylesWithThemeName
        ? theme.name
        : null;
      return mapTokensToStyleInfo(
        tokenSets,
        theme.$figmaStyleReferences ?? {},
        (name) => convertTokenNameToPath(name, stylePathPrefix, stylePathSlice),
      );
    }

    return null;
  }, [theme, tokenSets, settings]);

  const tokenStyleGroups = useMemo(() => {
    if (stylesInfo) {
      const typography: (typeof stylesInfo)[string][] = [];
      const colors: (typeof stylesInfo)[string][] = [];
      const effects: (typeof stylesInfo)[string][] = [];
      const entries = Object.entries(stylesInfo);
      entries.forEach(([,{ styleId, token }]) => {
        if (token.type === TokenTypes.TYPOGRAPHY) {
          typography.push({ styleId, token });
        } else if (token.type === TokenTypes.COLOR) {
          colors.push({ styleId, token });
        } else if (token.type === TokenTypes.BOX_SHADOW) {
          effects.push({ styleId, token });
        }
      });

      return { typography, colors, effects };
    }

    return null;
  }, [stylesInfo]);

  const attachLocalStyles = useCallback(async (category: AttachLocalStylesToTheme['category']) => {
    if (theme) {
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_ATTACHING_LOCAL_STYLES,
        isInfinite: true,
      });
      const result = await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME,
        tokens: tokenSets,
        category,
        theme,
        settings,
      });
      if (result.$figmaStyleReferences) {
        track('Attach styles to theme', {
          category,
          count: Object.values(result.$figmaStyleReferences).length,
        });
        dispatch.tokenState.assignStyleIdsToTheme({
          id: result.id,
          styleIds: result.$figmaStyleReferences,
        });
      }
      dispatch.uiState.completeJob(BackgroundJobs.UI_ATTACHING_LOCAL_STYLES);
    }
  }, [theme, tokenSets, settings, dispatch]);

  const handleDisconnectStyle = useCallback((token: string) => {
    if (theme) {
      track('Disconnect style', { token });
      dispatch.tokenState.disconnectStyleFromTheme({
        id: theme.id,
        key: token,
      });
    }
  }, [theme, dispatch.tokenState]);

  const handleDisconnectSelectedStyle = useCallback((tokens: string[]) => {
    if (theme) {
      track('Disconnect selected styles', { tokens });
      dispatch.tokenState.disconnectStyleFromTheme({
        id: theme.id,
        key: tokens,
      });
    }
  }, [theme, dispatch.tokenState]);

  const handleAttachLocalTextStyles = useCallback(() => {
    attachLocalStyles('typography');
  }, [attachLocalStyles]);

  const handleAttachLocalColorStyles = useCallback(() => {
    attachLocalStyles('colors');
  }, [attachLocalStyles]);

  const handleAttachLocalEffectStyles = useCallback(() => {
    attachLocalStyles('effects');
  }, [attachLocalStyles]);

  useEffect(() => {
    const allStyleIds = Object.values(rawStyleInfo).reduce<string[]>((list, map) => (
      list.concat(Object.values(map).map((info) => info.id))
    ), []);
    if (allStyleIds.length > 0) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.RESOLVE_STYLE_INFO,
        styleIds: allStyleIds,
      }).then(({ resolvedValues }) => {
        const nextStyleInfo = Object.fromEntries(Object.entries(rawStyleInfo).map(([category, stylesInfoMap]) => (
          [category, Object.fromEntries(Object.entries(stylesInfoMap).map(([tokenName, styleInfo]) => {
            const resolvedInfo = resolvedValues.find((resolved) => resolved.id === styleInfo.id);
            return [tokenName, {
              id: styleInfo.id,
              name: resolvedInfo?.name,
              failedToResolve: !resolvedInfo?.key,
            }];
          }))]
        )));
        setResolvedStyleInfo(nextStyleInfo);
      }).catch((err) => {
        console.error(err);
        Sentry.captureException(err);
      });
    }
  }, [rawStyleInfo]);

  useEffect(() => {
    if (tokenStyleGroups) {
      const styleInfo = Object.entries(tokenStyleGroups).reduce<StyleInfoPerCategory>((acc, [category, styles]) => {
        if (styles) {
          type StylesInfoMap = Record<string, StyleInfo>;
          acc[(category as keyof StyleInfoPerCategory)] = styles.reduce<StylesInfoMap>((map, { styleId, token }) => {
            map[token.name] = {
              id: styleId,
              failedToResolve: false,
            };
            return map;
          }, {});
        }
        return acc;
      }, {});
      setResolvedStyleInfo(styleInfo);
      setRawStyleInfo(styleInfo);
    }
  }, [tokenStyleGroups]);

  if (!tokenStyleGroups) {
    return null;
  }

  return (
    <Box css={{ padding: '$3 0', display: 'grid', gap: '$6' }}>
      <ThemeStyleManagementCategory
        label="Typography"
        styles={resolvedStyleInfo.typography ?? {}}
        onAttachLocalStyles={handleAttachLocalTextStyles}
        onDisconnectStyle={handleDisconnectStyle}
        onDisconnectSelectedStyle={handleDisconnectSelectedStyle}
      />
      <ThemeStyleManagementCategory
        label="Colors"
        styles={resolvedStyleInfo.colors ?? {}}
        onAttachLocalStyles={handleAttachLocalColorStyles}
        onDisconnectStyle={handleDisconnectStyle}
        onDisconnectSelectedStyle={handleDisconnectSelectedStyle}
      />
      <ThemeStyleManagementCategory
        label="Effects"
        styles={resolvedStyleInfo.effects ?? {}}
        onAttachLocalStyles={handleAttachLocalEffectStyles}
        onDisconnectStyle={handleDisconnectStyle}
        onDisconnectSelectedStyle={handleDisconnectSelectedStyle}
      />
    </Box>
  );
};
