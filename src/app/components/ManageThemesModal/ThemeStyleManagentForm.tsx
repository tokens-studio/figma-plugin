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
import { StyleInfo, ThemeStyleManagementCategory } from './ThemeStyleManagementCategory';
import { AsyncMessageTypes, AttachLocalStylesToTheme } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { isEqual } from '@/utils/isEqual';

type StyleInfoPerCategory = Partial<Record<'typography' | 'colors' | 'effects', Record<string, StyleInfo>>>;

type Props = {
  id: string
};

export const ThemeStyleManagementForm: React.FC<Props> = ({ id }) => {
  const [styleInfo, setStyleInfo] = useState<StyleInfoPerCategory>({});
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
        dispatch.tokenState.assignStyleIdsToTheme({
          id: result.id,
          styleIds: result.$figmaStyleReferences,
        });
      }
      dispatch.uiState.completeJob(BackgroundJobs.UI_ATTACHING_LOCAL_STYLES);
    }
  }, [theme, tokenSets, settings, dispatch]);

  const handleAttachLocalTextStyles = useCallback(() => {
    attachLocalStyles('typography');
  }, [attachLocalStyles]);

  const handleAttachLocalColorStyles = useCallback(() => {
    attachLocalStyles('colors');
  }, [attachLocalStyles]);

  const handleAttachLocaEffectStyles = useCallback(() => {
    attachLocalStyles('effects');
  }, [attachLocalStyles]);

  useEffect(() => {
    const allStyleIds = Object.values(styleInfo).reduce<string[]>((list, map) => (
      list.concat(Object.values(map).map((info) => info.id))
    ), []);
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.RESOLVE_STYLE_INFO,
      styleIds: allStyleIds,
    }).then(({ resolvedValues }) => {
      const nextStyleInfo = Object.fromEntries(Object.entries(styleInfo).map(([category, stylesInfoMap]) => (
        [category, Object.fromEntries(Object.entries(stylesInfoMap).map(([tokenName, styleInfo]) => {
          const resolvedStyleInfo = resolvedValues.find((resolved) => resolved.id === styleInfo.id);
          return [tokenName, {
            id: styleInfo.id,
            name: resolvedStyleInfo?.name,
            failedToResolve: !resolvedStyleInfo?.key,
          }];
        }))]
      )));
      if (!isEqual(styleInfo, nextStyleInfo)) {
        setStyleInfo(nextStyleInfo);
      }
    }).catch((err) => {
      console.error(err);
      Sentry.captureException(err);
    });
  }, [styleInfo]);

  useEffect(() => {
  // @TODO resolve names
    if (tokenStyleGroups) {
      const rawStyleInfo = Object.entries(tokenStyleGroups).reduce<StyleInfoPerCategory>((acc, [category, styles]) => {
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
      setStyleInfo(rawStyleInfo);
    }
  }, [tokenStyleGroups]);

  if (!tokenStyleGroups) {
    return null;
  }

  return (
    <Box css={{ padding: '$3 0', display: 'grid', gap: '$6' }}>
      <ThemeStyleManagementCategory
        label="Typography"
        styles={styleInfo.typography ?? {}}
        onAttachLocalStyles={handleAttachLocalTextStyles}
      />
      <ThemeStyleManagementCategory
        label="Colors"
        styles={styleInfo.colors ?? {}}
        onAttachLocalStyles={handleAttachLocalColorStyles}
      />
      <ThemeStyleManagementCategory
        label="Effects"
        styles={styleInfo.effects ?? {}}
        onAttachLocalStyles={handleAttachLocaEffectStyles}
      />
    </Box>
  );
};
