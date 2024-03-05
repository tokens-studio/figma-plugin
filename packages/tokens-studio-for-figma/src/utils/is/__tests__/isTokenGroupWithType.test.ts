import { isTokenGroupWithType } from '../isTokenGroupWithType';

describe('isTokenGroupWithType', () => {
  const tokenGroupsWithType = [
    {
      type: 'color',
      default: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
      },
    },
    {
      type: 'color',
      default: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
        type: 'dimension',
      },
    },
    {
      type: 'color',
      value: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
        type: 'dimension',
      },
    },
    {
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
    },
  ];

  const tokenGroupsWithOutType = [
    {
      default: {
        value: 'colors.black',
      },
      subtle: {
        value: 'colors.gray.500',
      },
    },
    {
      value: 'colors.gray.500',
      type: 'color',
    },
    {
      value: {
        fontFamily: 'Roboto',
      },
      subtle: {
        fontFamily: 'aria',
      },
      type: {
        fontFamily: 'Roboto',
      },
    },
  ];

  it('should validate token group with type of group level', () => {
    tokenGroupsWithType.forEach((item) => {
      expect(isTokenGroupWithType(item)).toBe(true);
    });
  });

  it('should return false for token group with no type', () => {
    tokenGroupsWithOutType.forEach((item) => {
      expect(isTokenGroupWithType(item)).toBe(false);
    });
  });
});
