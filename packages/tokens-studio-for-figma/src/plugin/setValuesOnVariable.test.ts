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
    expect(mockSetValueForMode).toBeCalledWith(mode, 8);
    expect(mockSetValueForMode).toBeCalledWith(mode, {
      r: 1, g: 0, b: 0, a: 1,
    });
    expect(mockSetValueForMode).toBeCalledWith(mode, 'foobarX');
    expect(mockSetValueForMode).toBeCalledWith(mode, true);
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

  describe('extended collections', () => {
    const parentCollectionId = 'VariableCollectionId:parent:100';
    const childCollectionId = 'VariableCollectionId:child:200';

    const inheritedVariable = {
      id: 'VariableID:inherited:1',
      key: 'inherited-key-1',
      name: 'colors/primary',
      variableCollectionId: parentCollectionId, // Belongs to parent
      resolvedType: 'COLOR',
      setValueForMode: jest.fn(),
      valuesByMode: {
        'child-mode-1': { r: 1, g: 0, b: 0, a: 1 },
      },
    } as unknown as Variable;

    const extendedCollection = {
      id: childCollectionId,
      parentVariableCollectionId: parentCollectionId,
      variableIds: ['VariableID:inherited:1'],
    } as unknown as VariableCollection;

    beforeEach(() => {
      inheritedVariable.setValueForMode = jest.fn();
    });

    it('should not create new variables in extended collections', async () => {
      const tokens = [
        {
          name: 'colors.newColor',
          path: 'colors/newColor',
          rawValue: '#00ff00',
          value: '#00ff00',
          type: TokenTypes.COLOR,
        },
      ] as SingleToken<true, { path: string; variableId: string }>[];

      await setValuesOnVariable(
        [inheritedVariable],
        tokens,
        extendedCollection,
        'child-mode-1',
        baseFontSize,
      );

      // Should NOT attempt to create a variable in extended collection
      expect(mockCreateVariable).not.toHaveBeenCalled();
    });

    it('should set override values on inherited variables in extended collections', async () => {
      const tokens = [
        {
          name: 'colors.primary',
          path: 'colors/primary',
          rawValue: '#00ff00',
          value: '#00ff00',
          type: TokenTypes.COLOR,
          variableId: 'inherited-key-1',
        },
      ] as SingleToken<true, { path: string; variableId: string }>[];

      await setValuesOnVariable(
        [inheritedVariable],
        tokens,
        extendedCollection,
        'child-mode-1',
        baseFontSize,
      );

      // Should set override value on inherited variable
      expect(inheritedVariable.setValueForMode).toHaveBeenCalledWith(
        'child-mode-1',
        { r: 0, g: 1, b: 0, a: 1 },
      );
    });

    it('should not rename inherited variables in extended collections', async () => {
      const tokens = [
        {
          name: 'colors.primaryRenamed',
          path: 'colors/primaryRenamed',
          rawValue: '#ff0000',
          value: '#ff0000',
          type: TokenTypes.COLOR,
          variableId: 'inherited-key-1',
        },
      ] as SingleToken<true, { path: string; variableId: string }>[];

      const result = await setValuesOnVariable(
        [inheritedVariable],
        tokens,
        extendedCollection,
        'child-mode-1',
        baseFontSize,
        true, // shouldRename = true
      );

      // Should NOT rename inherited variable
      expect(result.renamedVariableKeys).not.toContain('inherited-key-1');
      expect(inheritedVariable.name).toBe('colors/primary');
    });

    it('should not modify description on inherited variables', async () => {
      const originalDescription = 'Original description';
      inheritedVariable.description = originalDescription;

      const tokens = [
        {
          name: 'colors.primary',
          path: 'colors/primary',
          rawValue: '#ff0000',
          value: '#ff0000',
          type: TokenTypes.COLOR,
          variableId: 'inherited-key-1',
          description: 'New description',
        },
      ] as SingleToken<true, { path: string; variableId: string }>[];

      await setValuesOnVariable(
        [inheritedVariable],
        tokens,
        extendedCollection,
        'child-mode-1',
        baseFontSize,
      );

      // Description should remain unchanged for inherited variables
      expect(inheritedVariable.description).toBe(originalDescription);
    });
  });
});
