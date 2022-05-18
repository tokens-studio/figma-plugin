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
import { TokenTypes } from '@/constants/TokenTypes';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType } from '@/types/StorageType';
import {
  ActiveThemeProperty, StorageTypeProperty, ThemesProperty, UpdatedAtProperty, ValuesProperty, VersionProperty,
} from '@/figmaStorage';

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

type MapValuesToTokensResult = Record<string, string | SingleToken['value'] | {
  property: string
  value?: SingleToken['value'];
}[]>;

export function mapValuesToTokens(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): MapValuesToTokensResult {
  const mappedValues = Object.entries(values).reduce<MapValuesToTokensResult>((acc, [key, tokenOnNode]) => {
    const resolvedToken = tokens.get(tokenOnNode);
    if (!resolvedToken) return acc;
    if (isSingleToken(resolvedToken)) {
      // typography or boxshadow property in composition token resovle alias
      if (resolvedToken && resolvedToken.type === TokenTypes.COMPOSITION && resolvedToken.rawValue) {
        const tokensInComposition: {
          property: string
          value?: SingleToken['value'];
        }[] = [];
        if (Array.isArray(resolvedToken.rawValue)) {
          for (let index = 0; index < resolvedToken.rawValue.length; index++) {
            const currentTokenWithRawValue = resolvedToken.rawValue[index];
            if (currentTokenWithRawValue.property === TokenTypes.TYPOGRAPHY || currentTokenWithRawValue.property === TokenTypes.BOX_SHADOW) {
              let strExcludedSymbol: string = '';
              if (String(currentTokenWithRawValue.value).startsWith('$')) strExcludedSymbol = String(currentTokenWithRawValue.value).slice(1, String(currentTokenWithRawValue.value).length);
              if (String(currentTokenWithRawValue.value).startsWith('{')) strExcludedSymbol = String(currentTokenWithRawValue.value).slice(1, String(currentTokenWithRawValue.value).length - 1);
              tokensInComposition.push({
                property: currentTokenWithRawValue.property,
                value: tokens.get(strExcludedSymbol)?.value,
              });
            } else if (Array.isArray(resolvedToken.value)) {
              tokensInComposition.push({
                property: currentTokenWithRawValue.property,
                value: resolvedToken.value[index].value,
              });
            }
          }
        } else {
          const currentTokenWithRawValue = resolvedToken.rawValue;
          if (currentTokenWithRawValue.property === TokenTypes.TYPOGRAPHY || currentTokenWithRawValue.property === TokenTypes.BOX_SHADOW) {
            let strExcludedSymbol: string = '';
            if (String(currentTokenWithRawValue.value).startsWith('$')) strExcludedSymbol = String(currentTokenWithRawValue.value).slice(1, String(currentTokenWithRawValue.value).length);
            if (String(currentTokenWithRawValue.value).startsWith('{')) strExcludedSymbol = String(currentTokenWithRawValue.value).slice(1, String(currentTokenWithRawValue.value).length - 1);
            tokensInComposition.push({
              property: currentTokenWithRawValue.property,
              value: tokens.get(strExcludedSymbol)?.value,
            });
          } else if ('value' in resolvedToken.value) {
            tokensInComposition.push({
              property: currentTokenWithRawValue.property,
              value: resolvedToken.value.value,
            });
          }
        }
        acc[key] = tokensInComposition;
      } else {
        const valueToLookFor = returnValueToLookFor(key);
        const value = resolvedToken[valueToLookFor];
        if (typeof value !== 'undefined') {
          acc[key] = value;
        }
      }
    } else acc[key] = resolvedToken;
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
} | null> {
  try {
    const values = await ValuesProperty.read(figma.root) ?? {};
    const themes = await ThemesProperty.read(figma.root) ?? [];
    const activeTheme = await ActiveThemeProperty.read(figma.root);
    const version = await VersionProperty.read(figma.root);
    const updatedAt = await UpdatedAtProperty.read(figma.root);

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
    if (Array.isArray(values.composition)) {
      values.composition.forEach((value) => {
        if (typeof value === 'object' && 'value' in value) {
          tokensInCompositionToken[value.property as Properties] = value.value;
        }
      });
    } else if (typeof values.composition === 'object' && 'property' in values.composition) {
      // @TODO this may not be correct
      tokensInCompositionToken[values.composition.property as Properties] = values.composition.value;
    }
    const { composition, ...objExcludedCompositionToken } = values;
    values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
  }
  return values;
}

export function destructureCompositionTokenForAlias(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): NodeTokenRefMap {
  if (values && values.composition) {
    const resolvedToken = tokens.get(values.composition);
    const tokensInCompositionToken: NodeTokenRefMap = {};
    if (resolvedToken?.rawValue && Array.isArray(resolvedToken?.rawValue)) {
      resolvedToken?.rawValue.forEach((token) => {
        if ('value' in token) {
          let strExcludedSymbol: string = '';
          if (String(token.value).startsWith('$')) strExcludedSymbol = String(token.value).slice(1, String(token.value).length);
          if (String(token.value).startsWith('{')) strExcludedSymbol = String(token.value).slice(1, String(token.value).length - 1);
          tokensInCompositionToken[token.property as Properties] = strExcludedSymbol;
        }
      });
    } else if (resolvedToken?.rawValue && typeof resolvedToken.rawValue === 'object' && 'value' in resolvedToken.rawValue) {
      let strExcludedSymbol: string = '';
      if (String(resolvedToken?.rawValue.value).startsWith('$')) strExcludedSymbol = String(resolvedToken?.rawValue.value).slice(1, String(resolvedToken?.rawValue.value).length);
      if (String(resolvedToken?.rawValue.value).startsWith('{')) strExcludedSymbol = String(resolvedToken?.rawValue.value).slice(1, String(resolvedToken?.rawValue.value).length - 1);
      tokensInCompositionToken[resolvedToken.rawValue.property as Properties] = strExcludedSymbol;
    }
    const { composition, ...objExcludedCompositionToken } = values;
    values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
  }
  return values;
}

export async function updateNodes(
  entries: readonly NodeManagerNode[],
  tokens: Map<string, AnyTokenList[number]>,
  settings?: UpdateNodesSettings,
) {
  const { ignoreFirstPartForStyles } = settings ?? {};
  const figmaStyleMaps = getAllFigmaStyleMaps();
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
            setValuesOnNode(entry.node, mappedValues, mappedTokens, figmaStyleMaps, ignoreFirstPartForStyles);
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
