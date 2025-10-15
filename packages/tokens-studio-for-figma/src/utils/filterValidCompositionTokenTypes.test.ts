import { filterValidCompositionTokenTypes } from './filterValidCompositionTokenTypes';
import { Properties } from '@/constants/Properties';

describe('filterValidCompositionTokenTypes', () => {
  it('filters out composition property', () => {
    const input = ['sizing', Properties.composition, 'color'];
    expect(filterValidCompositionTokenTypes(input)).toEqual(['sizing', 'color']);
  });

  it('filters out description property', () => {
    const input = ['sizing', Properties.description, 'color'];
    expect(filterValidCompositionTokenTypes(input)).toEqual(['sizing', 'color']);
  });

  it('filters out value property', () => {
    const input = ['sizing', Properties.value, 'color'];
    expect(filterValidCompositionTokenTypes(input)).toEqual(['sizing', 'color']);
  });

  it('filters out tokenName property', () => {
    const input = ['sizing', Properties.tokenName, 'color'];
    expect(filterValidCompositionTokenTypes(input)).toEqual(['sizing', 'color']);
  });

  it('filters out tokenValue property', () => {
    const input = ['sizing', Properties.tokenValue, 'color'];
    expect(filterValidCompositionTokenTypes(input)).toEqual(['sizing', 'color']);
  });

  it('filters out multiple invalid properties', () => {
    const input = [
      'sizing',
      Properties.composition,
      'color',
      Properties.description,
      'spacing',
      Properties.value,
    ];
    expect(filterValidCompositionTokenTypes(input)).toEqual(['sizing', 'color', 'spacing']);
  });

  it('returns empty array when all properties are invalid', () => {
    const input = [
      Properties.composition,
      Properties.description,
      Properties.value,
      Properties.tokenName,
      Properties.tokenValue,
    ];
    expect(filterValidCompositionTokenTypes(input)).toEqual([]);
  });

  it('returns same array when no invalid properties', () => {
    const input = ['sizing', 'color', 'spacing', 'border'];
    expect(filterValidCompositionTokenTypes(input)).toEqual(['sizing', 'color', 'spacing', 'border']);
  });

  it('handles empty array', () => {
    expect(filterValidCompositionTokenTypes([])).toEqual([]);
  });

  it('keeps valid Properties enum values', () => {
    const input = [
      Properties.sizing,
      Properties.spacing,
      Properties.fill,
      Properties.composition, // should be filtered
      Properties.border,
    ];
    expect(filterValidCompositionTokenTypes(input)).toEqual([
      Properties.sizing,
      Properties.spacing,
      Properties.fill,
      Properties.border,
    ]);
  });
});
