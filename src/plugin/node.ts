import compact from 'just-compact';
import store from './store';
import setValuesOnNode from './setValuesOnNode';
import { Properties } from '@/constants/Properties';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { NodeManagerNode } from './NodeManager';
import { UpdateNodesSettings } from '@/types/UpdateNodesSettings';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultWorker } from './Worker';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { ProgressTracker } from './ProgressTracker';
import { AnyTokenList, SingleToken, TokenStore } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';
import { ThemeObjectsList } from '@/types';
import { CompositionTokenProperty } from '@/types/CompositionTokenProperty';
import { TokenTypes } from '@/constants/TokenTypes';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType } from '@/types/StorageType';
import {
  ActiveThemeProperty, CheckForChangesProperty, StorageTypeProperty, ThemesProperty, UpdatedAtProperty, ValuesProperty, VersionProperty,
} from '@/figmaStorage';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

// @TODO fix typings

export function returnValueToLookFor(key: string) {
  switch (key) {
    case 'tokenName':
      return 'name';
    case 'description':
      return 'description';
    case 'tokenValue':
      return 'rawValue';
    case 'value':
      return 'value';
    default:
      return 'value';
  }
}

type MapValuesToTokensResult = Record<string, string | number | SingleToken['value'] | {
  property: string
  value?: SingleToken['value'];
}[]>;

export function mapValuesToTokens(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): MapValuesToTokensResult {
  const mappedValues = Object.entries(values).reduce<MapValuesToTokensResult>((acc, [key, tokenOnNode]) => {
    const resolvedToken = tokens.get(tokenOnNode);
    if (!resolvedToken) return acc;

    acc[key] = isSingleToken(resolvedToken) ? resolvedToken[returnValueToLookFor(key)] || resolvedToken.value : resolvedToken;
    return acc;
  }, {});
  return mappedValues;
}

export async function getTokenData(): Promise<{
  values: TokenStore['values'];
  themes: ThemeObjectsList
  activeTheme: string | null
  updatedAt: string;
  version: string;
  checkForChanges: boolean | null
} | null> {
  try {
    const values = await ValuesProperty.read(figma.root) ?? {};
    const themes = await ThemesProperty.read(figma.root) ?? [];
    const activeTheme = await ActiveThemeProperty.read(figma.root);
    const version = await VersionProperty.read(figma.root);
    const updatedAt = await UpdatedAtProperty.read(figma.root);
    const checkForChanges = await CheckForChangesProperty.read(figma.root);

    if (Object.keys(values).length > 0) {
      const tokenObject = Object.entries(values).reduce<Record<string, AnyTokenList>>((acc, [key, groupValues]) => {
        acc[key] = typeof groupValues === 'string' ? JSON.parse(groupValues) : groupValues;
        return acc;
      }, {});
      return {
        values: tokenObject as TokenStore['values'],
        themes,
        activeTheme,
        updatedAt: updatedAt || '',
        version: version || '',
        checkForChanges,
      };
    }
  } catch (e) {
    console.log('Error reading tokens', e);
  }
  return null;
}

// set storage type (i.e. local or some remote provider)
export async function saveStorageType(context: StorageType) {
  await StorageTypeProperty.write(context);
}

export async function getSavedStorageType(): Promise<StorageType> {
  // the saved storage types will never contain credentials
  // as they should not be shared across
  const storageType = await StorageTypeProperty.read(figma.root);

  if (storageType) {
    return storageType;
  }
  return { provider: StorageProviderType.LOCAL };
}

export function goToNode(id: string) {
  const node = figma.getNodeById(id);
  if (
    node
    && node.type !== 'PAGE'
    && node.type !== 'DOCUMENT'
  ) {
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
}

export function selectNodes(ids: string[]) {
  const nodes = compact(ids.map(figma.getNodeById)).filter((node) => (
    node.type !== 'PAGE' && node.type !== 'DOCUMENT'
  )) as (Exclude<BaseNode, PageNode | DocumentNode>)[];
  figma.currentPage.selection = nodes;
}

export function destructureCompositionToken(values: MapValuesToTokensResult): MapValuesToTokensResult {
  const tokensInCompositionToken: Partial<
  Record<TokenTypes, SingleToken['value']>
  & Record<Properties, SingleToken['value']>
  > = {};
  if (values && values.composition) {
    Object.entries(values.composition).forEach(([property, value]) => {
      tokensInCompositionToken[property as CompositionTokenProperty] = value;
    });
    const { composition, ...objExcludedCompositionToken } = values;
    values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
  }
  return values;
}

export function destructureCompositionTokenForAlias(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): NodeTokenRefMap {
  if (values && values.composition) {
    const resolvedToken = tokens.get(values.composition);
    const tokensInCompositionToken: NodeTokenRefMap = {};
    if (resolvedToken?.rawValue) {
      Object.entries(resolvedToken?.rawValue).forEach(([property, value]) => {
        let strExcludedSymbol: string = '';
        if (String(value).startsWith('$')) strExcludedSymbol = String(value).slice(1, String(value).length);
        if (String(value).startsWith('{')) strExcludedSymbol = String(value).slice(1, String(value).length - 1);
        tokensInCompositionToken[property as CompositionTokenProperty] = strExcludedSymbol;
      });
      const { composition, ...objExcludedCompositionToken } = values;
      values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
    }
  }
  return values;
}

export async function updateNodes(
  entries: readonly NodeManagerNode[],
  tokens: Map<string, AnyTokenList[number]>,
  settings?: UpdateNodesSettings,
) {
  const { ignoreFirstPartForStyles, prefixStylesWithThemeName } = settings ?? {};
  const figmaStyleMaps = getAllFigmaStyleMaps();
  const themeInfo = await AsyncMessageChannel.message({
    type: AsyncMessageTypes.GET_THEME_INFO,
  });

  postToUI({
    type: MessageFromPluginTypes.START_JOB,
    job: {
      name: BackgroundJobs.PLUGIN_UPDATENODES,
      timePerTask: 2,
      completedTasks: 0,
      totalTasks: entries.length,
    },
  });

  const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATENODES);
  const promises: Set<Promise<void>> = new Set();
  const returnedValues: Set<NodeTokenRefMap> = new Set();
  entries.forEach((entry) => {
    promises.add(
      defaultWorker.schedule(async () => {
        try {
          if (entry.tokens) {
            const mappedTokens = destructureCompositionTokenForAlias(tokens, entry.tokens);
            let mappedValues = mapValuesToTokens(tokens, entry.tokens);
            mappedValues = destructureCompositionToken(mappedValues);
            setValuesOnNode(
              entry.node,
              mappedValues,
              mappedTokens,
              figmaStyleMaps,
              themeInfo,
              ignoreFirstPartForStyles,
              prefixStylesWithThemeName,
            );
            store.successfulNodes.add(entry.node);
            returnedValues.add(entry.tokens);
          }
        } catch (e) {
          console.log('got error', e);
        }

        tracker.next();
        tracker.reportIfNecessary();
      }),
    );
  });
  await Promise.all(promises);

  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.PLUGIN_UPDATENODES,
  });
  if (returnedValues.size) {
    return returnedValues.entries().next();
  }

  return {};
}
