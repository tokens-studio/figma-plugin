import { isTokenGroupWithTypeOfGroupLevel } from '../isTokenGroupWithTypeOfGroupLevel';

describe('isTokenGroupWithTypeOfGroupLevel', () => {
  it('should validate token group with type of group level', () => {
    expect(isTokenGroupWithTypeOfGroupLevel({
      type: 'color',
      default: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
      },
    })).toBe(true);
    expect(isTokenGroupWithTypeOfGroupLevel({
      type: 'color',
      default: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
        type: 'dimension',
      },
    })).toBe(true);
    expect(isTokenGroupWithTypeOfGroupLevel({
      type: 'color',
      value: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
        type: 'dimension',
      },
    })).toBe(true);
    expect(isTokenGroupWithTypeOfGroupLevel({
      type: 'typography',
      value: {
        value: {
          fontFamily: 'Roboto',
        },
      },
      subtle: {
        value: {
          fontFamily: 'aria',
        },
      },
    })).toBe(true);
  });

  it('should return false for token group with no type', () => {
    expect(isTokenGroupWithTypeOfGroupLevel({
      default: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
      },
    })).toBe(false);
    expect(isTokenGroupWithTypeOfGroupLevel({
      value: 'colors.gray.500',
      type: 'color',
    })).toBe(false);
    expect(isTokenGroupWithTypeOfGroupLevel({
      value: {
        fontFamily: 'Roboto',
      },
      subtle: {
        fontFamily: 'aria',
      },
      type: {
        fontFamily: 'Roboto',
      },
    })).toBe(false);
  });
});
