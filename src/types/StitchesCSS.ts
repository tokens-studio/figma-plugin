import type { ConfigType, DefaultThemeMap } from '@stitches/react/types/config';
import type { CSS } from '@stitches/react/types/css-util';
import type { theme } from '@/stitches.config';

export type StitchesCSS = CSS<
// eslint-disable-next-line @typescript-eslint/ban-types
ConfigType.Media<{}>,
typeof theme,
ConfigType.ThemeMap<DefaultThemeMap>,
// eslint-disable-next-line @typescript-eslint/ban-types
ConfigType.Utils<{}>
>;
