import { SettingsState } from '@/app/store/models/settings';
import {
  AnyTokenList, SingleBoxShadowToken, SingleColorToken, SingleTypographyToken,
} from '@/types/tokens';
import { transformValue } from './helpers';
import updateColorStyles from './updateColorStyles';
import updateEffectStyles from './updateEffectStyles';
import updateTextStyles from './updateTextStyles';

export default function updateStyles(
  tokens: AnyTokenList,
  shouldCreate = false,
  settings: SettingsState = {} as SettingsState,
): void {
  const styleTokens = tokens.map((token) => {
    const slice = settings?.ignoreFirstPartForStyles ? 1 : 0;
    const name = token.name.split('.').slice(slice).join('/');
    return {
      ...token,
      name,
      value: (typeof token.value === 'string')
        ? transformValue(token.value, token.type)
        : token.value,
    };
  });
  const colorTokens = styleTokens.filter((n) => ['color', 'colors'].includes(n.type)) as SingleColorToken[];
  const textTokens = styleTokens.filter((n) => ['typography'].includes(n.type)) as SingleTypographyToken[];
  const effectTokens = styleTokens.filter((n) => ['boxShadow'].includes(n.type)) as SingleBoxShadowToken[];

  if (!colorTokens && !textTokens && !effectTokens) return;
  if (colorTokens.length > 0) {
    updateColorStyles(colorTokens, shouldCreate);
  }
  if (textTokens.length > 0) {
    updateTextStyles(textTokens, shouldCreate);
  }
  if (effectTokens.length > 0) {
    updateEffectStyles(effectTokens, shouldCreate);
  }
}
