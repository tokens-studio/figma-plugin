import setValuesOnNode from './setValuesOnNode';

import * as setTextValuesOnTarget from './setTextValuesOnTarget';
import * as setEffectValuesOnTarget from './setEffectValuesOnTarget';

describe('updateNode', () => {
  const emptyFigmaStylesMap = {
    effectStyles: new Map(),
    paintStyles: new Map(),
    textStyles: new Map(),
  };

  const emptyThemeInfo = {
    activeTheme: null,
    themes: [],
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

  beforeEach(() => {
    textNodeMock = {
      type: 'TEXT',
      textStyleId: '',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
    };

    solidNodeMock = {
      type: 'SOLID',
      fillStyleId: '',
      effectStyleId: '',
      strokeStyleId: '',
      effects: [],
    };
  });

  it('calls setTextValuesOnTarget if text node and atomic typography tokens are given', async () => {
    await setValuesOnNode(textNodeMock, atomicValues, dataOnNode, emptyFigmaStylesMap, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('doesnt call setTextValuesOnTarget if no text node', async () => {
    await setValuesOnNode(solidNodeMock, atomicValues, dataOnNode, emptyFigmaStylesMap, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
  });

  it('calls setTextValuesOnTarget if text node and composite typography tokens are given', async () => {
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, emptyFigmaStylesMap, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('sets textstyle if matching Style is found', async () => {
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      textStyles: new Map([
        ['type/heading/h1', { name: 'type/heading/h1', id: '123' }],
      ]),
    }, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '123' });
  });

  it('sets textstyle if matching Style is found and first part is ignored', async () => {
    await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      textStyles: new Map([
        ['heading/h1', { name: 'heading/h1', id: '456' }],
      ]),
    }, emptyThemeInfo, true);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '456' });
  });

  it('sets effectStyle if matching Style is found', async () => {
    await setValuesOnNode(solidNodeMock, boxShadowValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      effectStyles: new Map([
        ['shadows/default', { name: 'shadows/default', id: '123' }],
      ]),
    }, emptyThemeInfo);
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, effectStyleId: '123' });
  });

  it('calls setEffectValuesOnTarget if effect node and effects are given', async () => {
    await setValuesOnNode(solidNodeMock, boxShadowValues, dataOnNode, {
      ...emptyFigmaStylesMap,
      effectStyles: new Map([
        ['shadows/other', { name: 'shadows/other', id: '123' }],
      ]),
    }, emptyThemeInfo);
    expect(setEffectValuesOnTargetSpy).toHaveBeenCalled();
  });
});
