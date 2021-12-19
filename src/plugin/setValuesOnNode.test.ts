import setValuesOnNode from './setValuesOnNode';

import * as setTextValuesOnTarget from './setTextValuesOnTarget';
import * as setEffectValuesOnTarget from './setEffectValuesOnTarget';

describe('updateNode', () => {
  const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTarget, 'default');
  const setEffectValuesOnTargetSpy = jest.spyOn(setEffectValuesOnTarget, 'default');

  const atomicValues = {
    textCase: 'TITLE',
    textDecoration: 'STRIKETHROUGH',
  };

  const typographyValues = {
    typography: {
      fontFamily: 'Inter',
      fontWeight: 'Bold',
      fontSize: '24',
    },
  };

  const boxShadowValues = {
    boxShadow: {
      type: 'dropShadow',
      color: '#00000080',
      x: 0,
      y: 0,
      blur: 10,
      spread: 0,
    },
  };

  const dataOnNode = {
    typography: 'type.heading.h1',
  };

  let textNodeMock;
  let solidNodeMock;

  beforeEach(() => {
    textNodeMock = {
      type: 'TEXT',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
    };

    solidNodeMock = {
      type: 'SOLID',
      effects: [],
    };
  });

  it('calls setTextValuesOnTarget if text node and atomic typography tokens are given', () => {
    setValuesOnNode(textNodeMock, atomicValues, dataOnNode);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('doesnt call setTextValuesOnTarget if no text node', () => {
    setValuesOnNode(solidNodeMock, atomicValues, dataOnNode);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
  });

  it('calls setTextValuesOnTarget if text node and composite typography tokens are given', () => {
    setValuesOnNode(textNodeMock, typographyValues, dataOnNode);
    figma.getLocalTextStyles.mockReturnValue([]);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('sets textstyle if matching Style is found', async () => {
    figma.getLocalTextStyles.mockReturnValue([{ name: 'type/heading/h1', id: '123' }]);
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '123' });
  });

  it('sets textstyle if matching Style is found and first part is ignored', async () => {
    figma.getLocalTextStyles.mockReturnValue([{ name: 'heading/h1', id: '456' }]);
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, true);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '456' });
  });

  it('calls setEffectValuesOnTarget if effect node and effects are given', () => {
    setValuesOnNode(solidNodeMock, boxShadowValues, {});
    expect(setEffectValuesOnTargetSpy).toHaveBeenCalled();
  });
});
