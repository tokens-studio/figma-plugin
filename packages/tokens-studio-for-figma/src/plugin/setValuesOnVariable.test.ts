import { mockCreateVariable } from '../../tests/__mocks__/figmaMock';
import { SingleToken } from '@/types/tokens';
import setValuesOnVariable from './setValuesOnVariable';
import { TokenTypes } from '@/constants/TokenTypes';

const baseFontSize = '16px';

// TODO: A lot of these tests could be rearranged and grouped follow the order of logic of each file, to see better what happy / sad paths are being covered.

describe('SetValuesOnVariable', () => {
  const mockSetValueForMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateVariable.mockImplementation((name, collection, type) => ({
      id: `VariableID:${Date.now()}`,
      key: `key-${Date.now()}`,
      name,
      resolvedType: type,
      description: '',
      variableCollectionId: collection.id,
      valuesByMode: {},
      setValueForMode: jest.fn(),
      remove: jest.fn(),
    }));
  });
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
  it('when there is a variable which is connected to the token, we only update the value if it has changed, but not for others', async () => {
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
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    // Check that the right values are called (only those that were changed)
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, 8);
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, {
      r: 1, g: 0, b: 0, a: 1,
    });
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, 'foobarX');
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, true);
    // Check that its only called for the right items (4 changed, 4 kept the same values)
    expect(mockSetValueForMode).toHaveBeenCalledTimes(4);
  });

  it('should create a new variable when there is no variable which is connected to the token', async () => {
    const tokens = [
      {
        name: 'button.primary.width',
        path: 'button/primary/width',
        rawValue: '{accent.onAccent}',
        value: '16',
        type: TokenTypes.SIZING,
      },
    ] as SingleToken<true, { path: string, variableId: string }>[];
    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);
    expect(mockCreateVariable).toHaveBeenCalledWith('button/primary/width', collection, 'FLOAT');
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
    const result = await setValuesOnVariable(variablesInFigma, tokens as any, collection, mode, baseFontSize, true);
    expect(result.renamedVariableKeys).toEqual(['123']);
    expect(variablesInFigma[0].name).toEqual('button/primary/height');
    expect(mockCreateVariable).not.toHaveBeenCalled();
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
    await setValuesOnVariable(variablesInFigma, tokens as any, collection, mode, baseFontSize);
    expect(mockCreateVariable).toHaveBeenCalledWith('global/fontWeight', collection, 'FLOAT');
  });

  describe('Variable Scopes and Code Syntax Updates', () => {
    const mockSetVariableCodeSyntax = jest.fn();
    let testVariable: Variable;

    beforeEach(() => {
      jest.clearAllMocks();
      testVariable = {
        id: 'VariableID:test:1',
        key: 'test-key-1',
        name: 'test/variable',
        resolvedType: 'FLOAT',
        description: '',
        variableCollectionId: collection.id,
        valuesByMode: { 309: 16 },
        scopes: ['ALL_SCOPES'] as VariableScope[],
        setValueForMode: mockSetValueForMode,
        setVariableCodeSyntax: mockSetVariableCodeSyntax,
        remove: jest.fn(),
      } as unknown as Variable;
    });

    it('should update scopes with value change', async () => {
      const tokens = [{
        name: 'test.variable',
        path: 'test/variable',
        rawValue: '24',
        value: '24',
        type: TokenTypes.SIZING,
        variableId: 'test-key-1',
        $extensions: {
          'com.figma.scopes': ['CORNER_RADIUS'],
        },
      }] as SingleToken<true, { path: string; variableId: string }>[];

      await setValuesOnVariable([testVariable], tokens, collection, mode, baseFontSize);

      // Verify scopes were updated
      expect(testVariable.scopes).toEqual(['CORNER_RADIUS']);
      // Verify value was updated
      expect(mockSetValueForMode).toHaveBeenCalledWith(mode, 24);
    });

    it('should update codeSyntax with value change', async () => {
      const colorVariable = {
        ...testVariable,
        resolvedType: 'COLOR',
        valuesByMode: {
          309: {
            r: 0, g: 0, b: 0, a: 1,
          },
        },
      } as unknown as Variable;

      const tokens = [{
        name: 'test.variable',
        path: 'test/variable',
        rawValue: '#ff0000',
        value: '#ff0000',
        type: TokenTypes.COLOR,
        variableId: 'test-key-1',
        $extensions: {
          'com.figma.codeSyntax': {
            Web: 'red',
            iOS: 'UIColor.red',
          },
        },
      }] as SingleToken<true, { path: string; variableId: string }>[];

      await setValuesOnVariable([colorVariable], tokens, collection, mode, baseFontSize);

      // Verify codeSyntax was set
      expect(mockSetVariableCodeSyntax).toHaveBeenCalledWith('WEB', 'red');
      expect(mockSetVariableCodeSyntax).toHaveBeenCalledWith('iOS', 'UIColor.red');
      // Verify value was updated to new color
      expect(mockSetValueForMode).toHaveBeenCalledWith(mode, {
        r: 1, g: 0, b: 0, a: 1,
      });
    });

    it('should not update when scopes remain the same', async () => {
      testVariable.scopes = ['WIDTH_HEIGHT', 'GAP'] as VariableScope[];

      const tokens = [{
        name: 'test.variable',
        path: 'test/variable',
        rawValue: '16',
        value: '16',
        type: TokenTypes.SIZING,
        variableId: 'test-key-1',
        $extensions: {
          'com.figma.scopes': ['WIDTH_HEIGHT', 'GAP'], // Same as current
        },
      }] as SingleToken<true, { path: string; variableId: string }>[];

      await setValuesOnVariable([testVariable], tokens, collection, mode, baseFontSize);

      // Scopes should remain the same
      expect(testVariable.scopes).toEqual(['WIDTH_HEIGHT', 'GAP']);
      // Value setter should NOT be called since value and metadata haven't changed
      expect(mockSetValueForMode).not.toHaveBeenCalled();
    });

    it('should remove codeSyntax when it is cleared in token extensions', async () => {
      (testVariable as any).codeSyntax = {
        WEB: 'oldWebCode',
        ANDROID: 'oldAndroidCode',
      };
      const mockRemoveVariableCodeSyntax = jest.fn();
      (testVariable as any).removeVariableCodeSyntax = mockRemoveVariableCodeSyntax;

      const tokens = [{
        name: 'test.variable',
        path: 'test/variable',
        rawValue: '16',
        value: '16',
        type: TokenTypes.SIZING,
        variableId: 'test-key-1',
        $extensions: {
          'com.figma.codeSyntax': {
            Web: '', // Cleared
            Android: undefined, // Also cleared
            iOS: 'newIOSCode', // Added
          },
        },
      }] as SingleToken<true, { path: string; variableId: string }>[];

      await setValuesOnVariable([testVariable], tokens, collection, mode, baseFontSize);

      // Verify removal calls
      expect(mockRemoveVariableCodeSyntax).toHaveBeenCalledWith('WEB');
      // Android: undefined in token means SKIP (for aggregation), so NOT called
      expect(mockRemoveVariableCodeSyntax).not.toHaveBeenCalledWith('ANDROID');
      // Verify set call
      expect(mockSetVariableCodeSyntax).toHaveBeenCalledWith('iOS', 'newIOSCode');
    });

    it('should preserve codeSyntax when providedPlatformsByVariable indicates it is provided elsewhere', async () => {
      // Setup current syntax
      (testVariable as any).codeSyntax = {
        WEB: 'preservedWebCode',
      };
      const mockRemoveVariableCodeSyntax = jest.fn();
      (testVariable as any).removeVariableCodeSyntax = mockRemoveVariableCodeSyntax;

      const tokens = [{
        name: 'test.variable',
        path: 'test/variable',
        rawValue: '16',
        value: '16',
        type: TokenTypes.SIZING,
        variableId: 'test-key-1',
        $extensions: {
          'com.figma.codeSyntax': {
            Android: 'androidCode',
          },
        },
      }] as SingleToken<true, { path: string; variableId: string }>[];

      const providedPlatformsByVariable = {
        'test.variable': new Set(['web', 'android']),
      };

      await setValuesOnVariable([testVariable], tokens, collection, mode, baseFontSize, false, null, {}, providedPlatformsByVariable);

      // Web should NOT be removed because it's in providedPlatformsByVariable
      expect(mockRemoveVariableCodeSyntax).not.toHaveBeenCalledWith('WEB');
      // Android should be set
      expect(mockSetVariableCodeSyntax).toHaveBeenCalledWith('ANDROID', 'androidCode');
    });

    it('should purge codeSyntax when NOT in providedPlatformsByVariable', async () => {
      // Setup current syntax
      (testVariable as any).codeSyntax = {
        WEB: 'oldWebCode',
      };
      const mockRemoveVariableCodeSyntax = jest.fn();
      (testVariable as any).removeVariableCodeSyntax = mockRemoveVariableCodeSyntax;

      const tokens = [{
        name: 'test.variable',
        path: 'test/variable',
        rawValue: '16',
        value: '16',
        type: TokenTypes.SIZING,
        variableId: 'test-key-1',
        $extensions: {
          'com.figma.codeSyntax': {
            Android: 'androidCode',
          },
        },
      }] as SingleToken<true, { path: string; variableId: string }>[];

      const providedPlatformsByVariable = {
        'test.variable': new Set(['android']), // Web is missing!
      };

      await setValuesOnVariable([testVariable], tokens, collection, mode, baseFontSize, false, null, {}, providedPlatformsByVariable);

      // Web SHOULD be removed
      expect(mockRemoveVariableCodeSyntax).toHaveBeenCalledWith('WEB');
      // Android should be set
      expect(mockSetVariableCodeSyntax).toHaveBeenCalledWith('ANDROID', 'androidCode');
    });
  });
});
