import { ExportNumberVariablesTokenTypes, TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from './tokenHelpers';
import { numberMatchesPercentage } from '@/plugin/figmaTransforms/numberMatchesPercentage';
import { SettingsState } from '@/app/store/models/settings';

export default function checkIfTokenCanCreateVariable(token: ResolveTokenValuesResult, settings: SettingsState): boolean {
  if (
    (token.type === TokenTypes.COLOR && settings.variablesColor)
    || (ExportNumberVariablesTokenTypes.includes(token.type) && settings.variablesNumber)
    || ([TokenTypes.TEXT, TokenTypes.FONT_FAMILIES].includes(token.type) && settings.variablesString)
    || (token.type === TokenTypes.BOOLEAN && settings.variablesBoolean)
    || (token.type === TokenTypes.FONT_WEIGHTS && Boolean(parseFloat(token.value)) && settings.variablesNumber)
    || (token.type === TokenTypes.FONT_WEIGHTS && !parseFloat(token.value) && settings.variablesString)
  ) {
  // Ignore multi value spacing and multi value borderRadius tokens
    if ((token.type === TokenTypes.BORDER_RADIUS || token.type === TokenTypes.SPACING) && typeof token.value === 'string') {
      return token.value.split(' ').length === 1;
    }
    // Ignore gradient colors (all types: linear, radial, conic)
    if (token.type === TokenTypes.COLOR && typeof token.value === 'string'
        && (token.value.startsWith('linear-gradient') || token.value.startsWith('radial-gradient') || token.value.startsWith('conic-gradient'))) {
      return false;
    }
    // Ignore AUTO values on lineHeight
    if (token.type === TokenTypes.LINE_HEIGHTS && typeof token.value === 'string' && token.value === 'AUTO') {
      return false;
    }
    // Ignore percentage values, except on text type tokens and opacity tokens
    if (token.type !== TokenTypes.TEXT && token.type !== TokenTypes.OPACITY && typeof token.value === 'string' && numberMatchesPercentage(token.value)) {
      return false;
    }
    return true;
  }
  return false;
}
