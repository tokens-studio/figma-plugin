/* eslint-disable default-case */
import {fetchAllPluginData} from './pluginData';
import store from './store';
import * as pjs from '../../package.json';
import setValuesOnNode from './updateNode';
import {TokenProps} from '../../types/tokens';
import {StorageProviderType, StorageType} from '../../types/api';
import {isSingleToken} from '../app/components/utils';

export function mapValuesToTokens(tokens, values): object {
    console.log('Values are', values, tokens);
    const mappedValues = Object.entries(values).reduce((acc, [key, tokenOnNode]) => {
        console.log('Finding', key, tokenOnNode);
        const resolvedToken = tokens.find((token) => token.name === tokenOnNode);
        if (!resolvedToken) return acc;
        const resolvedValue = resolvedToken.value;
        const value = isSingleToken(resolvedValue) ? resolvedValue.value : resolvedValue;

        console.log('returning', {
            [key]: value,
        });
        acc[key] = value;
        return acc;
    }, {});
    console.log('mappedValues', mappedValues);
    return mappedValues;
}

export function setTokensOnDocument(tokens, updatedAt: string) {
    figma.root.setSharedPluginData('tokens', 'version', pjs.version);
    figma.root.setSharedPluginData('tokens', 'values', JSON.stringify(tokens));
    figma.root.setSharedPluginData('tokens', 'updatedAt', updatedAt);
}

export function getTokenData(): {values: TokenProps; updatedAt: string; version: string} {
    const values = figma.root.getSharedPluginData('tokens', 'values');
    const version = figma.root.getSharedPluginData('tokens', 'version');
    const updatedAt = figma.root.getSharedPluginData('tokens', 'updatedAt');
    if (values) {
        const parsedValues = JSON.parse(values);
        console.log('Parsed values', parsedValues);
        return {values: parsedValues, updatedAt, version};
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
            console.log('Mapped values', mappedValues);
            setValuesOnNode(node, mappedValues, data);
            store.successfulNodes.push(node);
            returnedValues.push(data);
        }

        i += 1;
    }
    return returnedValues[0];
}
