import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { VariableToCreateToken } from '@/types/payloads';
import { reconcileImportedVariableToken } from '../reconcileImportedVariableToken';

const figmaDefaults = {
  'com.figma.scopes': ['ALL_SCOPES'],
  'com.figma.hiddenFromPublishing': false,
};

const imported = (overrides: Partial<VariableToCreateToken>): VariableToCreateToken => ({
  name: 'token',
  value: '0',
  type: TokenTypes.DIMENSION,
  parent: 'core/default',
  $extensions: figmaDefaults,
  ...overrides,
});

const existing = (overrides: Partial<SingleToken>) => ({ name: 'token', ...overrides } as SingleToken);

describe('reconcileImportedVariableToken', () => {
  it('ignores a unit the import added to an unchanged unitless font weight', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '400', type: TokenTypes.FONT_WEIGHTS }),
      imported({ value: '400px' }),
    );
    expect(result.hasChanges).toBe(false);
    expect(result.token).toMatchObject({ value: '400', type: TokenTypes.FONT_WEIGHTS });
  });

  it('writes a changed font weight without a unit and keeps its type', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '400', type: TokenTypes.FONT_WEIGHTS }),
      imported({ value: '500px' }),
    );
    expect(result.hasChanges).toBe(true);
    expect(result.token).toMatchObject({ value: '500', type: TokenTypes.FONT_WEIGHTS });
  });

  it('keeps a numeric value numeric', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: 1.5, type: TokenTypes.NUMBER }),
      imported({ value: '1.6px' }),
    );
    expect(result.token).toMatchObject({ value: 1.6, type: TokenTypes.NUMBER });
  });

  it('keeps px on a dimension when the import used plain numbers', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '8px', type: TokenTypes.DIMENSION }),
      imported({ value: 12, type: TokenTypes.NUMBER }),
    );
    expect(result.token).toMatchObject({ value: '12px', type: TokenTypes.DIMENSION });
  });

  it('converts between rem and px using the base font size', () => {
    const unchanged = reconcileImportedVariableToken(
      existing({ value: '1rem', type: TokenTypes.SPACING }),
      imported({ value: '20px' }),
      20,
    );
    expect(unchanged.hasChanges).toBe(false);
    expect(unchanged.token.value).toBe('1rem');

    const changed = reconcileImportedVariableToken(
      existing({ value: '1rem', type: TokenTypes.SPACING }),
      imported({ value: '24px' }),
      16,
    );
    expect(changed.token).toMatchObject({ value: '1.5rem', type: TokenTypes.SPACING });

    const fromRem = reconcileImportedVariableToken(
      existing({ value: '400', type: TokenTypes.FONT_WEIGHTS }),
      imported({ value: '25rem' }),
      16,
    );
    expect(fromRem.hasChanges).toBe(false);
  });

  it('treats tiny float differences from Figma as equal', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '0.1', type: TokenTypes.OPACITY }),
      imported({ value: 0.1000000015, type: TokenTypes.NUMBER }),
    );
    expect(result.hasChanges).toBe(false);
  });

  it('takes the imported value when the existing one is not a plain number', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '{spacing.base} * 2', type: TokenTypes.DIMENSION }),
      imported({ value: '16px' }),
    );
    expect(result.hasChanges).toBe(true);
    expect(result.token).toMatchObject({ value: '16px', type: TokenTypes.DIMENSION });
  });

  it('takes the imported value when the existing value is not a string or number', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: { fontSize: '16' } as any, type: TokenTypes.TYPOGRAPHY }),
      imported({ value: '16px' }),
    );
    expect(result.hasChanges).toBe(true);
    expect(result.token.value).toBe('16px');
  });

  it('keeps the type of string tokens such as font families', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: 'Inter', type: TokenTypes.FONT_FAMILIES }),
      imported({ value: 'Roboto', type: TokenTypes.TEXT }),
    );
    expect(result.token).toMatchObject({ value: 'Roboto', type: TokenTypes.FONT_FAMILIES });
  });

  it('takes the imported type when a color or boolean is involved', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '8px', type: TokenTypes.DIMENSION }),
      imported({ value: '#ff0000', type: TokenTypes.COLOR }),
    );
    expect(result.token.type).toBe(TokenTypes.COLOR);
  });

  it('does not add or flag default Figma metadata', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '8px', type: TokenTypes.DIMENSION }),
      imported({ value: '8px' }),
    );
    expect(result.hasChanges).toBe(false);
    expect(result.token.$extensions).toBeUndefined();
  });

  it('keeps Figma metadata keys the token already had, even at their default', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '8px', type: TokenTypes.DIMENSION, $extensions: { 'com.figma.scopes': ['ALL_SCOPES'] } as any }),
      imported({ value: '8px' }),
    );
    expect(result.hasChanges).toBe(false);
    expect(result.token.$extensions).toEqual({ 'com.figma.scopes': ['ALL_SCOPES'] });
  });

  it('flags and applies changed Figma metadata', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '8px', type: TokenTypes.DIMENSION }),
      imported({ value: '8px', $extensions: { ...figmaDefaults, 'com.figma.scopes': ['GAP'] } }),
    );
    expect(result.hasChanges).toBe(true);
    expect(result.token.$extensions).toEqual({ 'com.figma.scopes': ['GAP'] });
  });

  it('keeps non-Figma extensions and the deprecated flag', () => {
    const studio = { id: 'abc', modify: { type: 'lighten', value: '0.2', space: 'lch' } };
    const result = reconcileImportedVariableToken(
      existing({
        value: '400',
        type: TokenTypes.FONT_WEIGHTS,
        $deprecated: true,
        $extensions: { 'studio.tokens': studio, 'com.figma.codeSyntax': { web: 'old' } } as any,
      }),
      imported({ value: '500px' }),
    );
    expect(result.token.$extensions).toEqual({ 'studio.tokens': studio });
    expect(result.token.$deprecated).toBe(true);
  });

  it('flags a changed description', () => {
    const result = reconcileImportedVariableToken(
      existing({ value: '8px', type: TokenTypes.DIMENSION, description: 'old' }),
      imported({ value: '8px', description: 'new' }),
    );
    expect(result.hasChanges).toBe(true);
    expect(result.token.description).toBe('new');
  });
});
