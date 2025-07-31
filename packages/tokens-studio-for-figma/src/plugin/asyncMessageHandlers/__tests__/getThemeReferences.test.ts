import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { defaultTokenValueRetriever } from '../../TokenValueRetriever';
import { getThemeReferences } from '../getThemeReferences';

jest.mock('@/AsyncMessageChannel', () => ({
  AsyncMessageChannel: {
    PluginInstance: {
      message: jest.fn(() => Promise.resolve({
        themes: [
          {
            id: 'theme1',
            name: 'Theme 1',
            $figmaVariableReferences: {
              token1: 'variable1',
            },
            $figmaStyleReferences: {
              token2: 'style1',
            },
            selectedTokenSets: {
              set1: 'enabled',
            },
          },
        ],
        activeTheme: {
          set1: 'theme1',
        },
      })),
    },
  },
}));
jest.mock('../../TokenValueRetriever');

describe('getThemeReferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear the cache of defaultTokenValueRetriever', async () => {
    await getThemeReferences();
    expect(defaultTokenValueRetriever.clearCache).toHaveBeenCalledTimes(1);
  });

  it('should call AsyncMessageChannel.PluginInstance.message with GET_THEME_INFO type', async () => {
    await getThemeReferences();
    expect(AsyncMessageChannel.PluginInstance.message).toHaveBeenCalledWith({
      type: AsyncMessageTypes.GET_THEME_INFO,
    });
  });

  it('should return the expected result', async () => {
    const result = await getThemeReferences();

    expect(result).toEqual({
      figmaStyleReferences: new Map([['token2', 'style1']]),
      figmaVariableReferences: new Map([['token1', 'variable1']]),
    });
  });

  it('should merge variable references with local references', async () => {
    const localVariables = [
      {
        name: 'local/variable1',
        key: 'localVariable1',
        variableCollectionId: 'VariableCollectionId:1:0',
      },
    ];
    const localPaintStyles = [
      {
        id: 'style2',
        name: 'local/style2',
      },
    ];
    jest.spyOn(figma.variables, 'getLocalVariablesAsync').mockResolvedValue(localVariables);
    jest.spyOn(figma.variables, 'getLocalVariableCollectionsAsync').mockResolvedValue([{
      id: 'VariableCollectionId:1:0',
      name: 'Collection 1',
      remote: false,
      modes: [
        { name: 'Default', modeId: '1:0' },
        { name: 'Dark', modeId: '1:1' },
        { name: 'Light', modeId: '1:2' },
      ],
    } as VariableCollection]);
    jest.spyOn(figma, 'getLocalPaintStyles').mockReturnValue(localPaintStyles);

    const result = await getThemeReferences();

    expect(result).toEqual({
      figmaStyleReferences: new Map([
        ['token2', 'style1'],
        ['local.style2', 'style2'],
      ]),
      figmaVariableReferences: new Map([
        ['token1', 'variable1'],
        ['local.variable1', 'localVariable1'],
      ]),
    });
  });

  it('should respect theme variable references when conflicting with local', async () => {
    const localVariables = [
      {
        name: 'token1',
        key: 'variableX',
        variableCollectionId: 'VariableCollectionId:1:0',
      },
    ];
    jest.spyOn(figma.variables, 'getLocalVariablesAsync').mockResolvedValue(localVariables);
    jest.spyOn(figma.variables, 'getLocalVariableCollectionsAsync').mockResolvedValue([{
      id: 'VariableCollectionId:1:0',
      name: 'Collection 1',
      remote: false,
      modes: [
        { name: 'Default', modeId: '1:0' },
        { name: 'Dark', modeId: '1:1' },
        { name: 'Light', modeId: '1:2' },
      ],
    } as VariableCollection]);

    const result = await getThemeReferences();

    expect(result).toEqual({
      figmaStyleReferences: new Map([
        ['token2', 'style1'],
        ['local.style2', 'style2'],
      ]),
      figmaVariableReferences: new Map([
        ['token1', 'variable1'],
      ]),
    });
  });
});
