import { sortSelectionValueByProperties } from './sortSelectionValueByProperties';

const SelectionValue = {
  verticalPadding: 'verticalPadding',
  textDecoration: 'textDecoration',
  width: 'width',
  sizing: 'sizing',
  spacing: 'spacing',
  textCase: 'textCase',
  height: 'height',
  value: 'documentation',
  horizontalPadding: 'horizontalPadding',
  paragraphSpacing: 'paragraphSpacing',
  tokenValue: 'documentation',
};

const sortedSelectionValues = {
  sizing: 'sizing',
  height: 'height',
  width: 'width',
  spacing: 'spacing',
  verticalPadding: 'verticalPadding',
  horizontalPadding: 'horizontalPadding',
  paragraphSpacing: 'paragraphSpacing',
  textCase: 'textCase',
  textDecoration: 'textDecoration',
  tokenValue: 'documentation',
  value: 'documentation',
};

describe('convertToOrderObj', () => {
  it('successfully convert object to orderObject', () => {
    expect(sortSelectionValueByProperties(SelectionValue)).toEqual(sortedSelectionValues);
  });
});
