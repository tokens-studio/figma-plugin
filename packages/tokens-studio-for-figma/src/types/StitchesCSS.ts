import type { ConfigType, DefaultThemeMap } from '@stitches/react/types/config';
import type { CSS } from '@stitches/react/types/css-util';
import type { theme } from '@/stitches.config';

export type StitchesCSS = CSS<
ConfigType.Media<Record<string, unknown>>,
  typeof theme,
ConfigType.ThemeMap<DefaultThemeMap>,
ConfigType.Utils<Record<string, unknown>>
>;
