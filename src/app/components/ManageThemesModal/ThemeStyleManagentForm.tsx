import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { settingsStateSelector, tokensSelector, themeByIdSelector } from '@/selectors';
import { mapTokensToStyleInfo } from '@/utils/tokenset';
import { convertTokenNameToPath } from '@/utils/convertTokenNameToPath';
import { RootState } from '@/app/store';
import { TokenTypes } from '@/constants/TokenTypes';
import Box from '../Box';
import { StyleInfo, ThemeStyleManagementCategory } from './ThemeStyleManagementCategory';

type StyleInfoPerCategory = Partial<Record<'typography' | 'colors' | 'effects', Record<string, StyleInfo>>>;

type Props = {
  id: string
};

export const ThemeStyleManagementForm: React.FC<Props> = ({ id }) => {
  const [styleInfo, setStyleInfo] = useState<StyleInfoPerCategory>({});
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

  useEffect(() => {
  // @TODO resolve names
    if (tokenStyleGroups) {
      const rawStyleInfo = Object.entries(tokenStyleGroups).reduce<StyleInfoPerCategory>((acc, [category, styles]) => {
        if (styles) {
          type StylesInfoMap = Record<string, StyleInfo>;
          acc[(category as keyof StyleInfoPerCategory)] = styles.reduce<StylesInfoMap>((map, { styleId, token }) => {
            map[token.name] = { id: styleId };
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
    <Box css={{ display: 'grid', gap: '$3' }}>
      <ThemeStyleManagementCategory
        label="Typography"
        styles={styleInfo.typography ?? {}}
        onAttachLocalStyles={console.log}
      />
      <ThemeStyleManagementCategory
        label="Colors"
        styles={styleInfo.colors ?? {}}
        onAttachLocalStyles={console.log}
      />
      <ThemeStyleManagementCategory
        label="Effects"
        styles={styleInfo.effects ?? {}}
        onAttachLocalStyles={console.log}
      />
    </Box>
  );
};
