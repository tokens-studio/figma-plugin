import setValuesOnNode from './setValuesOnNode';

import * as setTextValuesOnTarget from './setTextValuesOnTarget';
import * as setEffectValuesOnTarget from './setEffectValuesOnTarget';

describe('setValuesOnNode', () => {
  const emptyFigmaStylesMap = {
    effectStyles: new Map(),
    paintStyles: new Map(),
    textStyles: new Map(),
  };

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
    boxShadow: 'shadows.default',
  };

  let textNodeMock;
  let solidNodeMock;
  let textNodeMockOriginal;
  let solidNodeMockOriginal;

  beforeEach(() => {
    textNodeMock = {
      characters: 'foobar',
      type: 'TEXT',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
      fills: ['#000000'],
    };

    solidNodeMock = {
      type: 'SOLID',
      effects: [],
    };
    textNodeMockOriginal = textNodeMock;
    solidNodeMockOriginal = solidNodeMock;
  });

  it('calls setTextValuesOnTarget if text node and atomic typography tokens are given', async () => {
    await setValuesOnNode(textNodeMock, atomicValues, dataOnNode, emptyFigmaStylesMap);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMockOriginal, ...atomicValues });
  });

  it('doesnt call setTextValuesOnTarget if no text node', async () => {
    await setValuesOnNode(solidNodeMock, atomicValues, dataOnNode, emptyFigmaStylesMap);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
  });

  it('calls setTextValuesOnTarget if text node and composite typography tokens are given', async () => {
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, emptyFigmaStylesMap);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMockOriginal, fontSize: 24, fontName: { family: 'Inter', style: 'Bold' } });
  });

  it('sets textstyle if matching Style is found', async () => {
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      textStyles: new Map([
        ['type/heading/h1', { name: 'type/heading/h1', id: '123' }],
      ]),
    });
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMockOriginal, textStyleId: '123' });
  });

  it('sets textstyle if matching Style is found and first part is ignored', async () => {
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      textStyles: new Map([
        ['heading/h1', { name: 'heading/h1', id: '456' }],
      ]),
    }, true);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMockOriginal, textStyleId: '456' });
  });

  it('sets effectStyle if matching Style is found', async () => {
    await setValuesOnNode(solidNodeMock, boxShadowValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      effectStyles: new Map([
        ['shadows/default', { name: 'shadows/default', id: '123' }],
      ]),
    });
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMockOriginal, effectStyleId: '123' });
  });

  it('calls setEffectValuesOnTarget if effect node and effects are given', async () => {
    await setValuesOnNode(solidNodeMock, boxShadowValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      effectStyles: new Map([
        ['shadows/other', { name: 'shadows/other', id: '123' }],
      ]),
    });
    expect(setEffectValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('changes fill if needed', async () => {
    await setValuesOnNode(textNodeMock, { fill: '#ff0000' }, { ...dataOnNode, fill: 'fg.default' }, emptyFigmaStylesMap);
    expect(textNodeMock).toEqual({
      ...textNodeMockOriginal,
      fills: [{
        color: {
          r: 1, g: 0, b: 0,
        },
        opacity: 1,
        type: 'SOLID',
      }],
    });
  });

  it('changes characters if needed', async () => {
    await setValuesOnNode(textNodeMock, { fill: '#ff0000', value: 'My new content' }, { ...dataOnNode, fill: 'default' }, emptyFigmaStylesMap);
    expect(textNodeMock.characters).toEqual('My new content');
  });

  it('doesnt change characters if not needed', async () => {
    await setValuesOnNode(textNodeMock, { fill: '#00ff00' }, { ...dataOnNode, fill: 'fg.default' }, emptyFigmaStylesMap);
    expect(textNodeMock.characters).toEqual('foobar');
  });
});
