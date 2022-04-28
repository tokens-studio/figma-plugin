import omit from 'just-omit';
import store from './store';
import setValuesOnNode from './setValuesOnNode';
import { AnyTokenSet } from '../types/tokens';
import { ContextObject, StorageProviderType, StorageType } from '../types/api';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import * as pjs from '../../package.json';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { NodeManagerNode } from './NodeManager';
import { UpdateNodesSettings } from '@/types/UpdateNodesSettings';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultWorker } from './Worker';
import { getAllFigmaStyleMaps } from '@/utils/getAllFigmaStyleMaps';
import { ProgressTracker } from './ProgressTracker';
import { AnyTokenList, TokenStore } from '@/types/tokens';
import { isSingleToken } from '@/utils/is';
import { UsedTokenSetsMap } from '@/types';
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

// @TOOD fix object typing
export function mapValuesToTokens(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap, resolvedTokens: ResolveTokenValuesResult[]): object {
  const mappedValues = Object.entries(values).reduce((acc, [key, tokenOnNode]) => {
    const resolvedToken = tokens.get(tokenOnNode);
    if (!resolvedToken) return acc;
    if (isSingleToken(resolvedToken)) {
      acc[key] = resolvedToken[returnValueToLookFor(key)];
    } else acc[key] = resolvedToken;
    return acc;
  }, {});
  return mappedValues;
}

export function setTokensOnDocument(tokens: AnyTokenSet, updatedAt: string, usedTokenSet: UsedTokenSetsMap) {
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.version, pjs.plugin_version);
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.values, JSON.stringify(tokens));
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.updatedAt, updatedAt);
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.usedTokenSet, JSON.stringify(usedTokenSet));
}

export function getTokenData(): {
  values: TokenStore['values'];
  updatedAt: string;
  version: string;
} | null {
  try {
    const values = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.values);
    const version = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.version);
    const updatedAt = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.updatedAt);
    if (values) {
      const parsedValues = JSON.parse(values);
      if (Object.keys(parsedValues).length > 0) {
        const tokenObject = Object.entries(parsedValues).reduce((acc, [key, groupValues]) => {
          acc[key] = typeof groupValues === 'string' ? JSON.parse(groupValues) : groupValues;
          return acc;
        }, {});
        return {
          values: tokenObject as TokenStore['values'],
          updatedAt,
          version,
        };
      }
    }
  } catch (e) {
    console.log('Error reading tokens', e);
  }
  return null;
}

// set storage type (i.e. local or some remote provider)
export function saveStorageType(context: ContextObject) {
  // remove secret
  const storageToSave = omit(context, ['secret']);
  tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.storageType, JSON.stringify(storageToSave));
}

export function getSavedStorageType(): StorageType {
  const values = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.storageType);

  if (values) {
    const context = JSON.parse(values);
    return context;
  }
  return { provider: StorageProviderType.LOCAL };
}

export function goToNode(id: string) {
  const node = figma.getNodeById(id);
  if (node) {
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
}

export function selectNodes(ids: string[]) {
  const nodes = ids.map(figma.getNodeById);
  figma.currentPage.selection = nodes;
}

export function mergeCompositionToken(values: Object): Object {
  console.log("input", values);
  let tokensInCompositionToken: Object = {};
  if (values && values.composition) {
    values.composition.map((value) => {
      tokensInCompositionToken[value.property] = value.value;
    });  
    const { composition, ...objExcludedCompositionToken } = values;
    values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
  }
  console.log("output", values);
  return values;
}

export function extractCompositionToken(tokens: Map<string, AnyTokenList[number]>, values: NodeTokenRefMap): Object {
  if (values && values.composition) {
    const resolvedToken = tokens.get(values[composition]);
    console.log("resolve", resolvedToken)
    values.composition.map((value) => {
      tokensInCompositionToken[value.property] = value.value;
    });  
    const { composition, ...objExcludedCompositionToken } = values;
    values = { ...tokensInCompositionToken, ...objExcludedCompositionToken };
  }
  console.log("output", values);
  return values;
}

export async function updateNodes(
  entries: readonly NodeManagerNode[],
  tokens: Map<string, AnyTokenList[number]>,
  settings?: UpdateNodesSettings,
  resolvedTokens: ResolveTokenValuesResult[],
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
            console.log("tokens", tokens,"entyr.toekns" ,entry.tokens)
            // let mappedTokens = extractCompositionToken(tokens, entry.tokens);
            let mappedValues = mapValuesToTokens(tokens, entry.tokens, resolvedTokens);
            mappedValues = mergeCompositionToken(mappedValues);
            setValuesOnNode(entry.node, mappedValues, entry.tokens, figmaStyleMaps, ignoreFirstPartForStyles);
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
    return returnedValues[0];
  }

  return {};
}
