import pullVariables from './pullVariables';
import * as notifiers from './notifiers';

jest.mock('./getVariablesWithoutZombies', () => ({
  getVariablesWithoutZombies: jest.fn().mockResolvedValue([
    {
      name: 'Color',
      remote: false,
      resolvedType: 'COLOR',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': {
          r: 1, g: 1, b: 1, a: 1,
        },
        '1:1': {
          r: 0, g: 0, b: 0, a: 1,
        },
        '1:2': {
          r: 1, g: 0, b: 0, a: 1,
        },
        '1:3': {
          r: 0.729411780834198, g: 0.8549019694328308, b: 0.3333333432674408, a: 1,
        },
      },
    },
    {
      name: 'Number1',
      remote: false,
      resolvedType: 'FLOAT',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': 24,
        '1:1': 24,
        '1:2': 24,
        '1:3': 24,
      },
    },
    {
      name: 'Number2',
      remote: false,
      resolvedType: 'FLOAT',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': 16,
        '1:1': 16,
        '1:2': 16,
        '1:3': 16,
      },
    },
    {
      name: 'Number3',
      remote: false,
      resolvedType: 'FLOAT',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': 24.8,
        '1:1': 24.8,
        '1:2': 24.8,
        '1:3': 24.8,
      },
    },
    {
      name: 'String',
      remote: false,
      resolvedType: 'STRING',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': 'Hello',
        '1:1': 'Hello',
        '1:2': 'Hello',
        '1:3': 'Hello',
      },
    },
    {
      name: 'Boolean',
      remote: false,
      resolvedType: 'BOOLEAN',
      variableCollectionId: 'coll1',
      valuesByMode: {
        '1:0': true,
        '1:1': true,
        '1:2': true,
        '1:3': true,
      },
    },
  ]),
}));

// Update the figma global mocks to include the new async function
global.figma = {
  ui: {
    postMessage: jest.fn(),
  },
  clientStorage: {
    getAsync: jest.fn().mockImplementation((key) => {
      if (key === 'uiSettings') {
        // Return a JSON string (the new code awaits twice but this string is already resolved)
        return Promise.resolve(JSON.stringify({ baseFontSize: 16 }));
      }
      return Promise.resolve(null);
    }),
  },
  variables: {
    // New async version returns a promise that resolves with the expected collection
    getVariableCollectionByIdAsync: jest.fn().mockResolvedValue({
      id: 'VariableID:1:0',
      name: 'Collection 1',
      modes: [
        { name: 'Default', modeId: '1:0' },
        { name: 'Dark', modeId: '1:1' },
        { name: 'Light', modeId: '1:2' },
        { name: 'Custom', modeId: '1:3' },
      ],
    }),
    // Mock for getting a variable by ID (used for VARIABLE_ALIAS values)
    getVariableById: jest.fn().mockReturnValue({ name: 'AliasName', id: 'aliasId' }),
  },
};

describe('pullStyles', () => {
  const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyVariableValues');

  beforeEach(() => {
    notifyStyleValuesSpy.mockClear();
  });

  it('pulls variables without no dimension options', async () => {
    await pullVariables({ useDimensions: false, useRem: false }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith(
      {
        colors: expect.arrayContaining([
          {
            name: 'Color',
            parent: 'Collection 1/Default',
            type: 'color',
            value: '#ffffff',
          },
        ]),
        numbers: expect.arrayContaining([
          {
            name: 'Number1',
            parent: 'Collection 1/Default',
            type: 'number',
            value: 24,
          },
        ]),
        strings: expect.arrayContaining([
          {
            name: 'String',
            parent: 'Collection 1/Default',
            type: 'text',
            value: 'Hello',
          },
        ]),
        booleans: expect.arrayContaining([
          {
            name: 'Boolean',
            parent: 'Collection 1/Default',
            type: 'boolean',
            value: 'true',
          },
        ]),
      },
      [],
      [],
    );
  });

  it('pulls variables with Convert numbers to dimensions option', async () => {
    await pullVariables({ useDimensions: 'true', useRem: false }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith(
      {
        colors: expect.arrayContaining([
          {
            name: 'Color',
            parent: 'Collection 1/Default',
            type: 'color',
            value: '#ffffff',
          },
        ]),
        dimensions: expect.arrayContaining([
          {
            name: 'Number1',
            parent: 'Collection 1/Default',
            type: 'dimension',
            value: '24px',
          },
        ]),
        strings: expect.any(Array),
        booleans: expect.any(Array),
      },
      [],
      [],
    );
  });

  it('pulls variables with Use rem for dimension values option', async () => {
    await pullVariables({ useDimensions: false, useRem: true }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith(
      {
        colors: expect.any(Array),
        dimensions: expect.arrayContaining([
          {
            name: 'Number1',
            parent: 'Collection 1/Default',
            type: 'dimension',
            value: '1.5rem',
          },
        ]),
        strings: expect.any(Array),
        booleans: expect.any(Array),
      },
      [],
      [],
    );
  });

  it('pulls variables with dimensions in rem if both options are selected', async () => {
    await pullVariables({ useDimensions: true, useRem: true }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith(
      {
        colors: expect.any(Array),
        dimensions: expect.arrayContaining([
          {
            name: 'Number1',
            parent: 'Collection 1/Default',
            type: 'dimension',
            value: '1.5rem',
          },
        ]),
        strings: expect.any(Array),
        booleans: expect.any(Array),
      },
      [],
      [],
    );
  });

  it('creates theme options for pro users', async () => {
    await pullVariables({ useDimensions: false, useRem: false }, [], true);

    const expectedTheme = {
      $figmaCollectionId: 'VariableID:1:0',
      $figmaModeId: '1:0',
      $figmaStyleReferences: {},
      $figmaVariableReferences: {},
      group: 'Collection 1',
      id: expect.any(String),
      name: 'Default',
      selectedTokenSets: {
        'Collection 1/Default': 'enabled',
      },
    };

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([expectedTheme]),
      [],
    );
  });
});
