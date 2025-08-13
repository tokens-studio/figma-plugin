import pullVariables from './pullVariables';
import * as notifiers from './notifiers';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';

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

jest.mock('@/AsyncMessageChannel', () => ({
  AsyncMessageChannel: {
    PluginInstance: {
      message: jest.fn().mockResolvedValue({
        themes: [],
      }),
    },
  },
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
  const notifyRenamedCollectionsSpy = jest.spyOn(notifiers, 'notifyRenamedCollections');

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the AsyncMessageChannel mock for each test
    (AsyncMessageChannel.PluginInstance.message as jest.Mock).mockResolvedValue({
      themes: [],
    });
  });

  it('pulls variables without no dimension options', async () => {
    await pullVariables({ useDimensions: false, useRem: false }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      colors: [
        {
          name: 'Color',
          parent: 'Collection 1/Default',
          type: 'color',
          value: '#ffffff',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Dark',
          type: 'color',
          value: '#000000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Light',
          type: 'color',
          value: '#ff0000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Custom',
          type: 'color',
          value: '#bada55',
        },
      ],
      numbers: [
        {
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'number',
          value: 24,
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'number',
          value: 24,
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'number',
          value: 24,
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'number',
          value: 24,
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'number',
          value: 16,
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'number',
          value: 16,
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'number',
          value: 16,
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'number',
          value: 16,
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Default',
          type: 'number',
          value: 24.8,
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Dark',
          type: 'number',
          value: 24.8,
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Light',
          type: 'number',
          value: 24.8,
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Custom',
          type: 'number',
          value: 24.8,
        },
      ],
      booleans: [
        {
          name: 'Boolean',
          parent: 'Collection 1/Default',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Dark',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Light',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Custom',
          type: 'boolean',
          value: 'true',
        },
      ],
      strings: [
        {
          name: 'String',
          parent: 'Collection 1/Default',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Dark',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Light',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Custom',
          type: 'text',
          value: 'Hello',
        },
      ],
    }, []);
  });

  it('pulls variables with Convert numbers to dimensions option', async () => {
    await pullVariables({ useDimensions: 'true', useRem: false }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      colors: [
        {
          name: 'Color',
          parent: 'Collection 1/Default',
          type: 'color',
          value: '#ffffff',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Dark',
          type: 'color',
          value: '#000000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Light',
          type: 'color',
          value: '#ff0000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Custom',
          type: 'color',
          value: '#bada55',
        },
      ],
      dimensions: [
        {
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '24px',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '24px',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '24px',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '24px',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '16px',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '16px',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '16px',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '16px',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '24.8px',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '24.8px',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '24.8px',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '24.8px',
        },
      ],
      booleans: [
        {
          name: 'Boolean',
          parent: 'Collection 1/Default',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Dark',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Light',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Custom',
          type: 'boolean',
          value: 'true',
        },
      ],
      strings: [
        {
          name: 'String',
          parent: 'Collection 1/Default',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Dark',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Light',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Custom',
          type: 'text',
          value: 'Hello',
        },
      ],
    }, []);
  });

  it('pulls variables with Use rem for dimension values option', async () => {
    await pullVariables({ useDimensions: false, useRem: true }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      colors: [
        {
          name: 'Color',
          parent: 'Collection 1/Default',
          type: 'color',
          value: '#ffffff',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Dark',
          type: 'color',
          value: '#000000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Light',
          type: 'color',
          value: '#ff0000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Custom',
          type: 'color',
          value: '#bada55',
        },
      ],
      dimensions: [
        {
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1.55rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1.55rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1.55rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1.55rem',
        },
      ],
      booleans: [
        {
          name: 'Boolean',
          parent: 'Collection 1/Default',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Dark',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Light',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Custom',
          type: 'boolean',
          value: 'true',
        },
      ],
      strings: [
        {
          name: 'String',
          parent: 'Collection 1/Default',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Dark',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Light',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Custom',
          type: 'text',
          value: 'Hello',
        },
      ],
    }, []);
  });

  it('pulls variables with dimensions in rem if both options are selected', async () => {
    await pullVariables({ useDimensions: true, useRem: true }, [], false);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
      colors: [
        {
          name: 'Color',
          parent: 'Collection 1/Default',
          type: 'color',
          value: '#ffffff',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Dark',
          type: 'color',
          value: '#000000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Light',
          type: 'color',
          value: '#ff0000',
        },
        {
          name: 'Color',
          parent: 'Collection 1/Custom',
          type: 'color',
          value: '#bada55',
        },
      ],
      dimensions: [
        {
          name: 'Number1',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number1',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1.5rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number2',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Default',
          type: 'dimension',
          value: '1.55rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Dark',
          type: 'dimension',
          value: '1.55rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Light',
          type: 'dimension',
          value: '1.55rem',
        },
        {
          name: 'Number3',
          parent: 'Collection 1/Custom',
          type: 'dimension',
          value: '1.55rem',
        },
      ],
      booleans: [
        {
          name: 'Boolean',
          parent: 'Collection 1/Default',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Dark',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Light',
          type: 'boolean',
          value: 'true',
        },
        {
          name: 'Boolean',
          parent: 'Collection 1/Custom',
          type: 'boolean',
          value: 'true',
        },
      ],
      strings: [
        {
          name: 'String',
          parent: 'Collection 1/Default',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Dark',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Light',
          type: 'text',
          value: 'Hello',
        },
        {
          name: 'String',
          parent: 'Collection 1/Custom',
          type: 'text',
          value: 'Hello',
        },
      ],
    }, []);
  });

  it('creates theme options for pro users', async () => {
    await pullVariables({ useDimensions: false, useRem: false }, [], true);

    expect(notifyStyleValuesSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: 'Default',
          group: 'Collection 1',
          selectedTokenSets: {
            'Collection 1/Default': 'enabled',
          },
          $figmaStyleReferences: {},
          $figmaModeId: '1:0',
          $figmaCollectionId: 'VariableID:1:0',
        }),
      ]),
    );
  });

  it('updates existing themes when collection names change', async () => {
    // Mock AsyncMessageChannel to return existing themes with old collection name
    (AsyncMessageChannel.PluginInstance.message as jest.Mock).mockResolvedValueOnce({
      themes: [
        {
          id: 'old-collection-default',
          name: 'Default',
          group: 'Old Collection',
          selectedTokenSets: {
            'Old Collection/Default': 'enabled',
          },
          $figmaStyleReferences: {},
          $figmaModeId: '1:0',
          $figmaCollectionId: 'VariableID:1:0',
        },
      ],
    });

    // Mock the collection with a new name but same ID
    global.figma.variables.getVariableCollectionByIdAsync = jest.fn().mockResolvedValueOnce({
      id: 'VariableID:1:0',
      name: 'Collection 1', // New name
      modes: [
        { name: 'Default', modeId: '1:0' },
      ],
    });

    await pullVariables({ useDimensions: false, useRem: false }, [], true);

    // Check if notifyRenamedCollections was called with the old and new collection names
    expect(notifyRenamedCollectionsSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        ['Old Collection/Default', 'Collection 1/Default'],
      ]),
    );
  });

  it('updates existing themes when mode names change', async () => {
    // Mock AsyncMessageChannel to return existing themes with old mode name
    (AsyncMessageChannel.PluginInstance.message as jest.Mock).mockResolvedValueOnce({
      themes: [
        {
          id: 'collection-1-old-mode',
          name: 'Old Mode',
          group: 'Collection 1',
          selectedTokenSets: {
            'Collection 1/Old Mode': 'enabled',
          },
          $figmaStyleReferences: {},
          $figmaModeId: '1:0',
          $figmaCollectionId: 'VariableID:1:0',
        },
      ],
    });

    // Mock the collection with a mode that has a new name but same ID
    global.figma.variables.getVariableCollectionByIdAsync = jest.fn().mockResolvedValueOnce({
      id: 'VariableID:1:0',
      name: 'Collection 1',
      modes: [
        { name: 'Default', modeId: '1:0' }, // New mode name, same ID
      ],
    });

    await pullVariables({ useDimensions: false, useRem: false }, [], true);

    // Check if notifyRenamedCollections was called with the old and new mode names
    expect(notifyRenamedCollectionsSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        ['Collection 1/Old Mode', 'Collection 1/Default'],
      ]),
    );
  });

  it('updates existing themes when both collection and mode names change', async () => {
    // Mock AsyncMessageChannel to return existing themes with old collection and mode names
    (AsyncMessageChannel.PluginInstance.message as jest.Mock).mockResolvedValueOnce({
      themes: [
        {
          id: 'old-collection-old-mode',
          name: 'Old Mode',
          group: 'Old Collection',
          selectedTokenSets: {
            'Old Collection/Old Mode': 'enabled',
          },
          $figmaStyleReferences: {},
          $figmaModeId: '1:0',
          $figmaCollectionId: 'VariableID:1:0',
        },
      ],
    });

    // Mock the collection with new name and mode with new name but same IDs
    global.figma.variables.getVariableCollectionByIdAsync = jest.fn().mockResolvedValueOnce({
      id: 'VariableID:1:0',
      name: 'Collection 1', // New collection name
      modes: [
        { name: 'Default', modeId: '1:0' }, // New mode name, same ID
      ],
    });

    await pullVariables({ useDimensions: false, useRem: false }, [], true);

    // Check if notifyRenamedCollections was called with the old and new names
    expect(notifyRenamedCollectionsSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        ['Old Collection/Old Mode', 'Collection 1/Default'],
      ]),
    );
  });
});
