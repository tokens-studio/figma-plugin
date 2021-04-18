/* eslint-disable default-case */
import objectPath from 'object-path';
import {fetchAllPluginData} from './pluginData';
import store from './store';
import setValuesOnNode from './updateNode';
import {TokenProps} from '../../types/tokens';
import {StorageProviderType, StorageType} from '../../types/api';
import * as pjs from '../../package.json';
import {transformValue} from './helpers';

function mapType(token, value) {
    if (value.type) return value.type;
    return token.split('.')[0];
}

function returnValueToLookFor(resolvedValue, key, token) {
    switch (key) {
        case 'tokenName':
            return token;
        case 'description':
            return resolvedValue?.description;
        case 'tokenValue':
            return resolvedValue.value || resolvedValue;
        default:
            return transformValue(resolvedValue?.value || resolvedValue, mapType(token, resolvedValue));
    }
}

export function mapValuesToTokens(object, values) {
    return Object.entries(values).reduce((acc, [key, tokenOnNode]) => {
        const resolvedToken = objectPath.get(object, tokenOnNode);
        if (!resolvedToken) return acc;

        acc[key] = returnValueToLookFor(resolvedToken, key, tokenOnNode);
        return acc;
    }, {});
}

export function setTokensOnDocument(tokens, updatedAt: string) {
    figma.root.setSharedPluginData('tokens', 'version', pjs.plugin_version);
    figma.root.setSharedPluginData('tokens', 'values', JSON.stringify(tokens));
    figma.root.setSharedPluginData('tokens', 'updatedAt', updatedAt);
}

export function getTokenData(): {values: TokenProps; updatedAt: string; version: string} {
    try {
        const values = figma.root.getSharedPluginData('tokens', 'values');
        const version = figma.root.getSharedPluginData('tokens', 'version');
        const updatedAt = figma.root.getSharedPluginData('tokens', 'updatedAt');
        if (values) {
            const parsedValues = JSON.parse(values);
            if (Object.keys(parsedValues).length > 0) {
                return {values: parsedValues, updatedAt, version};
            }
        }
    } catch (e) {
        console.log('Error reading tokens', e);
    }
    return null;
}

// set storage type (i.e. local or some remote provider)
export function saveStorageType({provider, id, name}: StorageType) {
    figma.root.setSharedPluginData('tokens', 'storageType', JSON.stringify({provider, id, name}));
}

export function getSavedStorageType(): StorageType {
    const values = figma.root.getSharedPluginData('tokens', 'storageType');

    if (values) {
        const {provider, name, id} = JSON.parse(values);
        return {provider, name, id};
    }
    return {provider: StorageProviderType.LOCAL};
}

export function goToNode(id) {
    const node = figma.getNodeById(id);
    if (node?.type === 'INSTANCE') {
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
    }
}

export function updateNodes(nodes, tokens) {
    let i = 0;
    const len = nodes.length;
    const returnedValues = [];
    while (i < len) {
        const node = nodes[i];
        const data = fetchAllPluginData(node);
        if (data) {
            const mappedValues = mapValuesToTokens(tokens, data);
            setValuesOnNode(node, mappedValues, data);
            store.successfulNodes.push(node);
            returnedValues.push(data);
        }

        i += 1;
    }
    return returnedValues[0];
}
