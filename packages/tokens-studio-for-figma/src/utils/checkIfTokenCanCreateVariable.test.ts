import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from './tokenHelpers';
import checkIfTokenCanCreateVariable from './checkIfTokenCanCreateVariable';

describe('checkIfTokenCanCreateVariable', () => {
  it('multi value border radius and spacing tokens can\'t create variable', () => {
    const multiValueBorderRadiusToken = {
      name: 'border-radius-multi-value',
      value: '1 2',
      type: TokenTypes.BORDER_RADIUS,
    } as ResolveTokenValuesResult;
    const multiValueSpacingToken = {
      name: 'spacing-multi-value',
      value: '1 2',
      type: TokenTypes.SPACING,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(multiValueBorderRadiusToken)).toBe(false);
    expect(checkIfTokenCanCreateVariable(multiValueSpacingToken)).toBe(false);
  });

  it('gradient colors can\'t create variable', () => {
    const gradientColor = {
      name: 'border-radius-multi-value',
      value: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
      type: TokenTypes.COLOR,
    } as ResolveTokenValuesResult;
    expect(checkIfTokenCanCreateVariable(gradientColor)).toBe(false);
  });
});
