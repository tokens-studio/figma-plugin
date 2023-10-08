import { convertToOrderObj } from './convertToOrderObj';

const value = {
  sizing: 'sizing',
  height: 'height',
  width: 'width',
  spacing: 'spacing',
  verticalPadding: 'verticalPadding',
  horizontalPadding: 'horizontalPadding',
};

const orderObject = {
  height: 1,
  horizontalPadding: 5,
  sizing: 0,
  spacing: 3,
  verticalPadding: 4,
  width: 2,
};

describe('convertToOrderObj', () => {
  it('successfully convert object to orderObject', () => {
    expect(convertToOrderObj(value)).toEqual(orderObject);
  });
});
