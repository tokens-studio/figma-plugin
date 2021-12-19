import omit from 'just-omit';
import store from './store';
import setValuesOnNode from './setValuesOnNode';
import { TokenArrayGroup, TokenProps } from '../types/tokens';
import { ContextObject, StorageProviderType, StorageType } from '../types/api';
import { isSingleToken } from '../app/components/utils';
import * as pjs from '../../package.json';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { defaultNodeManager } from './NodeManager';
import { UpdateNodesSettings } from '@/types/UpdateNodesSettings';

export function returnValueToLookFor(key) {
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

export function mapValuesToTokens(tokens: TokenArrayGroup, values: NodeTokenRefMap): object {
  const mappedValues = Object.entries(values).reduce((acc, [key, tokenOnNode]) => {
    const resolvedToken = tokens.find((token) => token.name === tokenOnNode);
    if (!resolvedToken) return acc;

    acc[key] = isSingleToken(resolvedToken) ? resolvedToken[returnValueToLookFor(key)] : resolvedToken;
    return acc;
  }, {});
  return mappedValues;
}

export function setTokensOnDocument(tokens, updatedAt: string) {
  figma.root.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, 'version', pjs.plugin_version);
  figma.root.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, 'values', JSON.stringify(tokens));
  figma.root.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, 'updatedAt', updatedAt);
}

export function getTokenData(): { values: TokenProps; updatedAt: string; version: string } | null {
  try {
    const values = figma.root.getSharedPluginData('tokens', 'values');
    const version = figma.root.getSharedPluginData('tokens', 'version');
    const updatedAt = figma.root.getSharedPluginData('tokens', 'updatedAt');
    if (values) {
      const parsedValues = JSON.parse(values);
      if (Object.keys(parsedValues).length > 0) {
        const tokenObject = Object.entries(parsedValues).reduce((acc, [key, groupValues]) => {
          acc[key] = typeof groupValues === 'string' ? JSON.parse(groupValues) : groupValues;
          return acc;
        }, {});
        return {
          values: tokenObject as TokenProps,
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
  figma.root.setSharedPluginData('tokens', 'storageType', JSON.stringify(storageToSave));
}

export function getSavedStorageType(): StorageType {
  const values = figma.root.getSharedPluginData('tokens', 'storageType');

  if (values) {
    const context = JSON.parse(values);
    return context;
  }
  return { provider: StorageProviderType.LOCAL };
}

export function goToNode(id: string) {
  const node = figma.getNodeById(id);
  if (node?.type === 'INSTANCE') {
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
}

export async function updateNodes(nodes: readonly BaseNode[], tokens: TokenArrayGroup, settings?: UpdateNodesSettings) {
  const { ignoreFirstPartForStyles } = settings ?? {};

  const dataForNodes = await defaultNodeManager.findNodesWithData({ nodes });

  try {
    let i = 0;
    const len = nodes.length;
    const returnedValues: NodeTokenRefMap[] = [];
    while (i < len) {
      const node = nodes[i];
      const entry = dataForNodes.find((info) => info.id === node.id);
      if (entry && entry.tokens) {
        const mappedValues = mapValuesToTokens(tokens, entry.tokens);
        setValuesOnNode(node, mappedValues, entry.tokens, ignoreFirstPartForStyles);
        store.successfulNodes.push(node);
        returnedValues.push(entry.tokens);
      }

      i += 1;
    }
    return returnedValues[0];
  } catch (e) {
    console.log('got error', e);
  }

  return {};
}
