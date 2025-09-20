import { mockCreateVariable } from '../../tests/__mocks__/figmaMock';
import { SingleToken } from '@/types/tokens';
import setValuesOnVariable from './setValuesOnVariable';
import { TokenTypes } from '@/constants/TokenTypes';

const baseFontSize = '16px';

// TODO: A lot of these tests could be rearranged and grouped follow the order of logic of each file, to see better what happy / sad paths are being covered.

describe('SetValuesOnVariable', () => {
  const mockSetValueForMode = jest.fn();
  const variablesInFigma = [
    {
      id: 'VariableID:309:16431',
      key: '123',
      name: 'button/primary/borderRadius',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: 16,
      },
    } as unknown as Variable,
    {
      id: 'VariableID:309:16432',
      key: '124',
      name: 'button/primary/height',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: 32,
      },
    } as unknown as Variable,
    {
      id: 'VariableID:309:16435',
      key: '125',
      name: 'colors/black',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
      },
    } as unknown as Variable,
    {
      id: 'VariableID:309:16436',
      key: '126',
      name: 'colors/accent',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
      },
    } as unknown as Variable,
    {
      id: 'VariableID:309:16437',
      key: '127',
      name: 'text/string',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: 'foobar',
      },
    } as unknown as Variable,
    {
      id: 'VariableID:309:16438',
      key: '128',
      name: 'text/stringChanged',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: 'foobar',
      },
    } as unknown as Variable,
    {
      id: 'VariableID:309:16439',
      key: '129',
      name: 'boolean/true',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: true,
      },
    } as unknown as Variable,
    {
      id: 'VariableID:309:16440',
      key: '130',
      name: 'boolean/false',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: false,
      },
    } as unknown as Variable,
  ] as Variable[];
  const mode = '309';
  const collection = {
    id: 'VariableCollectionId:309:16430',
  } as VariableCollection;
  it('when there is a variable which is connected to the token, we only update the value if it has changed, but not for others', () => {
    const tokens = [
      {
        name: 'button.primary.borderRadius',
        path: 'button/primary/borderRadius',
        rawValue: '{accent.default}',
        value: '8',
        type: TokenTypes.BORDER_RADIUS,
        variableId: '123',
      },
      {
        name: 'button.primary.height',
        path: 'button/primary/height',
        rawValue: '32',
        value: '32',
        type: TokenTypes.SIZING,
        variableId: '124',
      },
      {
        name: 'colors.black',
        path: 'colors/black',
        rawValue: '#000000',
        value: '#000000',
        type: TokenTypes.COLOR,
        variableId: '125',
      },
      {
        name: 'colors.accent',
        path: 'colors/accent',
        rawValue: '#ff0000',
        value: '#ff0000',
        type: TokenTypes.COLOR,
        variableId: '126',
      },
      {
        name: 'text.string',
        path: 'text/string',
        rawValue: 'foobar',
        value: 'foobar',
        type: TokenTypes.TEXT,
        variableId: '127',
      },
      {
        name: 'text.stringChanged',
        path: 'text/stringChanged',
        rawValue: 'foobarX',
        value: 'foobarX',
        type: TokenTypes.TEXT,
        variableId: '128',
      },
      {
        name: 'boolean.true',
        path: 'boolean/true',
        rawValue: 'true',
        value: 'true',
        type: TokenTypes.BOOLEAN,
        variableId: '129',
      },
      {
        name: 'boolean.false',
        path: 'boolean/false',
        rawValue: 'true',
        value: 'true',
        type: TokenTypes.BOOLEAN,
        variableId: '130',
      },
    ] as SingleToken<true, { path: string, variableId: string }>[];
    setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    // Check that the right values are called (only those that were changed)
    expect(mockSetValueForMode).toBeCalledWith(mode, 8);
    expect(mockSetValueForMode).toBeCalledWith(mode, {
      r: 1, g: 0, b: 0, a: 1,
    });
    expect(mockSetValueForMode).toBeCalledWith(mode, 'foobarX');
    expect(mockSetValueForMode).toBeCalledWith(mode, true);
    // Check that its only called for the right items (4 changed, 4 kept the same values)
    expect(mockSetValueForMode).toHaveBeenCalledTimes(4);
  });

  it('should create a new variable when there is no variable which is connected to the token', () => {
    const tokens = [
      {
        name: 'button.primary.width',
        path: 'button/primary/width',
        rawValue: '{accent.onAccent}',
        value: '16',
        type: TokenTypes.SIZING,
      },
    ] as SingleToken<true, { path: string, variableId: string }>[];
    setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    expect(mockCreateVariable).toBeCalledWith('button/primary/width', collection, 'FLOAT');
  });

  it('should rename variable if name and path differ and shouldRename is given', async () => {
    const tokens = [
      {
        name: 'button.primary.height',
        path: 'button/primary/height',
        rawValue: 16,
        value: '16',
        type: TokenTypes.NUMBER,
        variableId: '123',
      },
    ];
    const result = await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize, true);
    expect(result.renamedVariableKeys).toEqual(['123']);
    expect(variablesInFigma[0].name).toEqual('button/primary/height');
    expect(mockCreateVariable).not.toBeCalled();
  });

  it('should apply fontWeight token with numeric value', async () => {
    const tokens = [{
      name: 'global.fontWeight',
      path: 'global/fontWeight',
      value: 300,
      rawValue: 300,
      type: TokenTypes.FONT_WEIGHTS,
      variableId: '1234',
    }];
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    expect(mockCreateVariable).toBeCalledWith('global/fontWeight', collection, 'FLOAT');
  });

  it('should apply variable scopes when token has figma extensions', async () => {
    const mockSetScopes = jest.fn();
    const testVariable = {
      id: 'VariableID:309:scopes',
      key: 'scopes-test',
      name: 'colors/primary',
      setValueForMode: mockSetValueForMode,
      valuesByMode: { 309: { r: 0, g: 0, b: 1, a: 1 } },
      set scopes(value) { mockSetScopes(value); },
    } as unknown as Variable;

    const tokens = [{
      name: 'colors.primary',
      path: 'colors/primary',
      value: '#0000ff',
      rawValue: '#0000ff',
      type: TokenTypes.COLOR,
      variableId: 'scopes-test',
      $extensions: {
        'com.figma': {
          scopes: ['ALL_FILLS', 'TEXT_FILL'],
        },
      },
    }];

    variablesInFigma.push(testVariable);
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    expect(mockSetScopes).toBeCalledWith(['ALL_FILLS', 'TEXT_FILL']);
  });

  it('should apply variable code syntax when token has figma extensions', async () => {
    const mockSetVariableCodeSyntax = jest.fn();
    const testVariable = {
      id: 'VariableID:309:syntax',
      key: 'syntax-test',
      name: 'colors/secondary',
      setValueForMode: mockSetValueForMode,
      valuesByMode: { 309: { r: 1, g: 0, b: 0, a: 1 } },
      setVariableCodeSyntax: mockSetVariableCodeSyntax,
    } as unknown as Variable;

    const tokens = [{
      name: 'colors.secondary',
      path: 'colors/secondary',
      value: '#ff0000',
      rawValue: '#ff0000',
      type: TokenTypes.COLOR,
      variableId: 'syntax-test',
      $extensions: {
        'com.figma': {
          codeSyntax: {
            Web: '--color-secondary',
            Android: 'color_secondary',
            iOS: 'ColorSecondary',
          },
        },
      },
    }];

    variablesInFigma.push(testVariable);
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    expect(mockSetVariableCodeSyntax).toBeCalledWith('WEB', '--color-secondary');
    expect(mockSetVariableCodeSyntax).toBeCalledWith('ANDROID', 'color_secondary');
    expect(mockSetVariableCodeSyntax).toBeCalledWith('iOS', 'ColorSecondary');
  });

  it('should apply hiddenFromPublishing when token has figma extensions', async () => {
    const testVariable = {
      id: 'VariableID:309:hidden',
      key: 'hidden-test',
      name: 'colors/hidden',
      setValueForMode: mockSetValueForMode,
      valuesByMode: { 309: { r: 0, g: 1, b: 0, a: 1 } },
      hiddenFromPublishing: false,
    } as unknown as Variable;

    const tokens = [{
      name: 'colors.hidden',
      path: 'colors/hidden',
      value: '#00ff00',
      rawValue: '#00ff00',
      type: TokenTypes.COLOR,
      variableId: 'hidden-test',
      $extensions: {
        'com.figma': {
          hiddenFromPublishing: true,
        },
      },
    }];

    variablesInFigma.push(testVariable);
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    expect(testVariable.hiddenFromPublishing).toBe(true);
  });

  it('should apply all figma extensions together', async () => {
    const mockSetScopes = jest.fn();
    const mockSetVariableCodeSyntax = jest.fn();
    const testVariable = {
      id: 'VariableID:309:combined',
      key: 'combined-test',
      name: 'spacing/medium',
      setValueForMode: mockSetValueForMode,
      valuesByMode: { 309: 16 },
      set scopes(value) { mockSetScopes(value); },
      setVariableCodeSyntax: mockSetVariableCodeSyntax,
      hiddenFromPublishing: false,
    } as unknown as Variable;

    const tokens = [{
      name: 'spacing.medium',
      path: 'spacing/medium',
      value: '16',
      rawValue: '16',
      type: TokenTypes.SPACING,
      variableId: 'combined-test',
      $extensions: {
        'com.figma': {
          scopes: ['GAP', 'WIDTH_HEIGHT'],
          codeSyntax: {
            Web: '--spacing-medium',
          },
          hiddenFromPublishing: true,
        },
      },
    }];

    variablesInFigma.push(testVariable);
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    expect(mockSetScopes).toBeCalledWith(['GAP', 'WIDTH_HEIGHT']);
    expect(mockSetVariableCodeSyntax).toBeCalledWith('WEB', '--spacing-medium');
    expect(testVariable.hiddenFromPublishing).toBe(true);
  });
});
