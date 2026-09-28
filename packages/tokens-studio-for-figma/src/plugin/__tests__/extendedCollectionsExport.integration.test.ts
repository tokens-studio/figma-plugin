import {
  mockGetLocalVariableCollections,
  mockGetLocalVariables,
} from '../../../tests/__mocks__/figmaMock';
import { AsyncMessageTypes, GetThemeInfoMessageResult } from '@/types/AsyncMessages';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { TokenTypes } from '@/constants/TokenTypes';
import createLocalVariablesInPlugin from '../createLocalVariablesInPlugin';
import { SingleToken } from '@/types/tokens';
import { SettingsState } from '@/app/store/models/settings';
import { ThemeObjectsList } from '@/types';

const PARENT_COLL_ID = 'parent-coll-id';
const CHILD_COLL_ID = 'child-coll-id';
const PARENT_MODE_ID = 'p-mode';
const CHILD_MODE_ID = 'child-composite-mode';

describe('extended collections export (integration)', () => {
  const runAfter: (() => void)[] = [];
  let themesResponse: ThemeObjectsList = [];

  const mockGetThemeInfoHandler = async (): Promise<GetThemeInfoMessageResult> => ({
    type: AsyncMessageTypes.GET_THEME_INFO,
    activeTheme: { [INTERNAL_THEMES_NO_GROUP]: 'parent-light' },
    themes: themesResponse,
  });

  runAfter.push(AsyncMessageChannel.ReactInstance.connect());
  AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, mockGetThemeInfoHandler);
  runAfter.push(AsyncMessageChannel.PluginInstance.connect());

  const tokens = {
    global: [
      {
        name: 'button.primary.borderRadius',
        value: '8',
        type: TokenTypes.BORDER_RADIUS,
      } as SingleToken,
    ],
  };

  const settings = {
    baseFontSize: '16',
    variablesNumber: true,
    exportExtendedCollections: true,
  } as SettingsState;

  const makeExtendedCollection = () => ({
    id: CHILD_COLL_ID,
    name: 'Brand',
    isExtension: true,
    parentVariableCollectionId: PARENT_COLL_ID,
    modes: [{ name: 'Light', modeId: CHILD_MODE_ID, parentModeId: PARENT_MODE_ID }],
    renameMode: jest.fn(),
  });

  const makeParentCollection = (extendImpl: jest.Mock) => ({
    id: PARENT_COLL_ID,
    name: 'Colors',
    modes: [{ name: 'Light', modeId: PARENT_MODE_ID }],
    renameMode: jest.fn(),
    extend: extendImpl,
  });

  const makeParentVariable = () => ({
    id: 'var-1',
    key: 'var-key-1',
    name: 'button/primary/borderRadius',
    remote: false,
    resolvedType: 'FLOAT',
    description: '',
    variableCollectionId: PARENT_COLL_ID,
    valuesByMode: { [PARENT_MODE_ID]: 8 } as Record<string, unknown>,
    setValueForMode: jest.fn(),
    clearValueForMode: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLocalVariableCollections.mockImplementation(() => []);
  });

  it('exports an imported extended theme end-to-end: extends parent once, writes via the child composite mode', async () => {
    const extendedCollection = makeExtendedCollection();
    const extendMock = jest.fn().mockResolvedValue(extendedCollection);
    const parentCollection = makeParentCollection(extendMock);
    const parentVariable = makeParentVariable();

    // First export: only the parent collection exists in Figma
    (global.figma.variables.getLocalVariableCollectionsAsync as jest.Mock) = jest.fn()
      .mockResolvedValue([parentCollection]);
    mockGetLocalVariables.mockImplementation(() => [parentVariable]);

    // Imported extended theme carries the "Parent/Child" group form
    themesResponse = [
      {
        id: 'parent-light',
        name: 'Light',
        group: 'Colors',
        selectedTokenSets: { global: TokenSetStatus.ENABLED },
        $figmaStyleReferences: {},
        $figmaCollectionId: PARENT_COLL_ID,
        $figmaModeId: PARENT_MODE_ID,
      },
      {
        id: 'child-light',
        name: 'Light',
        group: 'Colors/Brand',
        selectedTokenSets: { global: TokenSetStatus.ENABLED },
        $figmaStyleReferences: {},
        $figmaIsExtension: true,
        $figmaParentThemeId: 'parent-light',
        $figmaParentCollectionId: PARENT_COLL_ID,
      },
    ];

    const result = await createLocalVariablesInPlugin(tokens, settings, ['parent-light', 'child-light']);

    // The child collection was created exactly once, from the stripped child name
    expect(extendMock).toHaveBeenCalledTimes(1);
    expect(extendMock).toHaveBeenCalledWith('Brand');

    // The extended theme was NOT silently skipped: the collection lookup
    // resolved (via the backfilled $figmaCollectionId) and variables were
    // processed for both themes
    expect(result.allVariableCollectionIds['parent-light']).toEqual(expect.objectContaining({
      collectionId: PARENT_COLL_ID,
      modeId: PARENT_MODE_ID,
    }));
    expect(result.allVariableCollectionIds['child-light']).toEqual(expect.objectContaining({
      collectionId: CHILD_COLL_ID,
      modeId: CHILD_MODE_ID,
    }));
  });

  it('re-export with persisted metadata reuses the existing child collection (no duplicate extend)', async () => {
    const extendedCollection = makeExtendedCollection();
    const extendMock = jest.fn().mockResolvedValue(extendedCollection);
    const parentCollection = makeParentCollection(extendMock);
    const parentVariable = makeParentVariable();

    // Second export: the child collection already exists in Figma and the
    // theme carries the persisted $figmaCollectionId / $figmaModeId
    (global.figma.variables.getLocalVariableCollectionsAsync as jest.Mock) = jest.fn()
      .mockResolvedValue([parentCollection, extendedCollection]);
    mockGetLocalVariables.mockImplementation(() => [parentVariable]);

    themesResponse = [
      {
        id: 'parent-light',
        name: 'Light',
        group: 'Colors',
        selectedTokenSets: { global: TokenSetStatus.ENABLED },
        $figmaStyleReferences: {},
        $figmaCollectionId: PARENT_COLL_ID,
        $figmaModeId: PARENT_MODE_ID,
      },
      {
        id: 'child-light',
        name: 'Light',
        group: 'Colors/Brand',
        selectedTokenSets: { global: TokenSetStatus.ENABLED },
        $figmaStyleReferences: {},
        $figmaIsExtension: true,
        $figmaParentThemeId: 'parent-light',
        $figmaParentCollectionId: PARENT_COLL_ID,
        $figmaCollectionId: CHILD_COLL_ID,
        $figmaModeId: CHILD_MODE_ID,
      },
    ];

    const result = await createLocalVariablesInPlugin(tokens, settings, ['parent-light', 'child-light']);

    expect(extendMock).not.toHaveBeenCalled();
    expect(result.allVariableCollectionIds['child-light']).toEqual(expect.objectContaining({
      collectionId: CHILD_COLL_ID,
      modeId: CHILD_MODE_ID,
    }));
  });

  it('child value equal to parent stays inherited (no explicit child-mode write)', async () => {
    const extendedCollection = makeExtendedCollection();
    const extendMock = jest.fn().mockResolvedValue(extendedCollection);
    const parentCollection = makeParentCollection(extendMock);
    const parentVariable = makeParentVariable();

    (global.figma.variables.getLocalVariableCollectionsAsync as jest.Mock) = jest.fn()
      .mockResolvedValue([parentCollection, extendedCollection]);
    mockGetLocalVariables.mockImplementation(() => [parentVariable]);

    themesResponse = [
      {
        id: 'child-light',
        name: 'Light',
        group: 'Colors/Brand',
        selectedTokenSets: { global: TokenSetStatus.ENABLED },
        $figmaStyleReferences: {},
        $figmaIsExtension: true,
        $figmaParentThemeId: 'parent-light',
        $figmaParentCollectionId: PARENT_COLL_ID,
        $figmaCollectionId: CHILD_COLL_ID,
        $figmaModeId: CHILD_MODE_ID,
      },
    ];

    await createLocalVariablesInPlugin(tokens, settings, ['child-light']);

    // Token value (8) equals the parent mode value (8): the child mode must
    // remain inherited — no setValueForMode with the child composite mode
    expect(parentVariable.setValueForMode).not.toHaveBeenCalledWith(CHILD_MODE_ID, expect.anything());
  });
});
