import { isSingleTokenValueObject } from '../isSingleTokenValueObject';

describe('isSingleTokenValueObject', () => {
  const correctToken = {
    objectString: {
      value: 'foo',
    },
    objectNumber: {
      value: 3,
    },
    objectZero: {
      value: 0,
    },
    // objectNull: {
    //   value: null,
    // },
  };
  const incorrectToken = {
    string: 'foo',
    number: 3,
    zero: 0,
    array: [0, 1, 2, 3],
  };

  it('correctly asserts if it is a value token', () => {
    Object.entries(correctToken).forEach((token) => {
      expect(isSingleTokenValueObject(token[1])).toBe(true);
    });
  });

  it('correctly asserts if it is not a value token', () => {
    Object.entries(incorrectToken).forEach((token) => {
      expect(isSingleTokenValueObject(token[1])).toBe(false);
    });
  });
});
