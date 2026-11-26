import {
  mockGetLocalVariableCollectionsAsync,
  mockGetLocalVariablesAsync,
  mockGetVariableCollectionByIdAsync,
} from '../../../tests/__mocks__/figmaMock';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import updateVariablesFromPlugin from '../updateVariablesFromPlugin';

const PARENT_COLL = 'VariableCollectionId:1:1';
const CHILD_COLL = 'VariableCollectionId:1:2';
const PARENT_MODE = '1:10';
const CHILD_MODE = `${CHILD_COLL}/1:20`;

const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id } as VariableAlias);

describe('updateVariablesFromPlugin — extended collections', () => {
  const disconnect: (() => void)[] = [];
  let fgDefault: any;
  let childCollection: any;

  const themeInfo = (): GetThemeInfoMessageResult => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: { Colors: 'colors-light', brand: 'brand-light' },
    themes: [
      {
        id: 'colors-light',
        name: 'Light',
        group: 'Colors',
        selectedTokenSets: { semantic: TokenSetStatus.ENABLED },
        $figmaCollectionId: PARENT_COLL,
        $figmaModeId: PARENT_MODE,
        $figmaVariableReferences: { 'fg.default': 'fg-key' },
      },
      {
        id: 'brand-light',
        name: 'Light',
        group: 'brand',
        selectedTokenSets: { semantic: TokenSetStatus.ENABLED, brand: TokenSetStatus.ENABLED },
        $figmaParentThemeId: 'colors-light',
        $figmaIsExtension: true,
        $figmaCollectionId: CHILD_COLL,
        $figmaModeId: CHILD_MODE,
        $figmaVariableReferences: { 'fg.default': 'fg-key' },
      },
    ],
  });

  beforeAll(() => {
    disconnect.push(AsyncMessageChannel.ReactInstance.connect());
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, async () => themeInfo());
  });

  afterAll(() => {
    disconnect.forEach((fn) => fn());
  });

  beforeEach(() => {
    const blue = {
      id: 'blue-id', key: 'blue-key', name: 'colors/blue/500', variableCollectionId: PARENT_COLL, valuesByMode: {},
    };
    const red = {
      id: 'red-id', key: 'red-key', name: 'colors/red/500', variableCollectionId: PARENT_COLL, valuesByMode: {},
    };
    fgDefault = {
      id: 'fg-id',
      key: 'fg-key',
      name: 'fg/default',
      variableCollectionId: PARENT_COLL,
      description: '',
      valuesByMode: { [PARENT_MODE]: alias('red-id') },
      setValueForMode: jest.fn(function set(this: any, modeId: string, value: VariableValue) {
        this.valuesByMode[modeId] = value;
      }),
      removeOverrideForMode: jest.fn(),
      setVariableCodeSyntax: jest.fn(),
      removeVariableCodeSyntax: jest.fn(),
    };
    childCollection = {
      id: CHILD_COLL,
      name: 'brand',
      isExtension: true,
      parentVariableCollectionId: PARENT_COLL,
      modes: [{ modeId: CHILD_MODE, name: 'Light', parentModeId: PARENT_MODE }],
      // The brand set overrides fg.default to red in the child
      variableOverrides: { 'fg-id': { [CHILD_MODE]: alias('red-id') } },
    };
    const parentCollection = {
      id: PARENT_COLL, name: 'Colors', isExtension: false, modes: [{ modeId: PARENT_MODE, name: 'Light' }],
    };

    mockGetLocalVariablesAsync.mockImplementation(() => Promise.resolve([fgDefault, blue, red]));
    mockGetLocalVariableCollectionsAsync.mockImplementation(() => Promise.resolve([parentCollection, childCollection]));
    mockGetVariableCollectionByIdAsync.mockImplementation((id: string) => Promise.resolve(
      id === CHILD_COLL ? childCollection : parentCollection,
    ));
  });

  it('keeps a brand override in the child when a shared-set edit makes the parent match it', async () => {
    // Base set changes fg.default from red to blue; brand still overrides it to red

    await updateVariablesFromPlugin({
      name: 'fg.default',
      parent: 'semantic',
      rawValue: '{colors.blue.500}',
      value: '#0000ff',
      type: TokenTypes.COLOR,
    } as any);

    // Parent mode gets the edit
    expect(fgDefault.setValueForMode).toHaveBeenCalledWith(PARENT_MODE, alias('blue-id'));
    // Child override is neither cleared nor rewritten
    expect(fgDefault.removeOverrideForMode).not.toHaveBeenCalled();
    expect(fgDefault.setValueForMode).not.toHaveBeenCalledWith(CHILD_MODE, expect.anything());
  });

  it('keeps a raw brand override in the child when a raw shared-set edit makes the parent match it', async () => {
    fgDefault.valuesByMode[PARENT_MODE] = {
      r: 0, g: 0, b: 1, a: 1,
    };
    childCollection.variableOverrides['fg-id'][CHILD_MODE] = {
      r: 1, g: 0, b: 0, a: 1,
    };

    await updateVariablesFromPlugin({
      name: 'fg.default',
      parent: 'semantic',
      rawValue: '#00ff00',
      value: '#00ff00',
      type: TokenTypes.COLOR,
    } as any);

    expect(fgDefault.setValueForMode).toHaveBeenCalledWith(PARENT_MODE, {
      r: 0, g: 1, b: 0, a: 1,
    });
    expect(fgDefault.removeOverrideForMode).not.toHaveBeenCalled();
    expect(fgDefault.setValueForMode).not.toHaveBeenCalledWith(CHILD_MODE, expect.anything());
  });
});
