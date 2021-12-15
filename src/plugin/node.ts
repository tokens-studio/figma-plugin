/* eslint-disable default-case */
import {fetchAllPluginData} from './pluginData';
import store from './store';
import setValuesOnNode from './setValuesOnNode';
import {TokenProps} from '../../types/tokens';
import {ContextObject, StorageProviderType, StorageType} from '../../types/api';
import {isSingleToken} from '../app/components/utils';
import * as pjs from '../../package.json';

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

export function mapValuesToTokens(tokens, values): object {
    const mappedValues = Object.entries(values).reduce((acc, [key, tokenOnNode]) => {
        const resolvedToken = tokens.find((token) => token.name === tokenOnNode);
        if (!resolvedToken) return acc;

        acc[key] = isSingleToken(resolvedToken) ? resolvedToken[returnValueToLookFor(key)] : resolvedToken;
        return acc;
    }, {});
    return mappedValues;
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
    const storageToSave = context;
    delete storageToSave.secret;
    figma.root.setSharedPluginData('tokens', 'storageType', JSON.stringify(storageToSave));
}

export function getSavedStorageType(): StorageType {
    const values = figma.root.getSharedPluginData('tokens', 'storageType');

    if (values) {
        const context = JSON.parse(values);
        return context;
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

export function updateNodes(nodes, tokens, settings) {
    const {ignoreFirstPartForStyles} = settings;
    try {
        let i = 0;
        const len = nodes.length;
        const returnedValues = [];
        while (i < len) {
            const node = nodes[i];
            const data = fetchAllPluginData(node);
            if (data) {
                console.log('updating node', node.id, data);

                const mappedValues = mapValuesToTokens(tokens, data);
                setValuesOnNode(node, mappedValues, data, ignoreFirstPartForStyles);
                store.successfulNodes.push(node);
                returnedValues.push(data);
            }

            i += 1;
        }
        return returnedValues[0];
    } catch (e) {
        console.log('got error', e);
    }
}
