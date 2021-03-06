/* eslint-disable default-case */
import objectPath from 'object-path';
import {fetchAllPluginData} from './pluginData';
import store from './store';
import * as pjs from '../../package.json';
import {setValuesOnNode} from './updateNode';
import {isSingleToken} from '../app/components/utils';

export function mapValuesToTokens(object, values) {
    const array = Object.entries(values).map(([key, token]) => {
        const resolvedValue = objectPath.get(object, token);
        const value = isSingleToken(resolvedValue) ? resolvedValue.value : resolvedValue;

        return {
            [key]: value,
        };
    });
    array.map((item) => ({[item.key]: item.value}));
    return Object.assign({}, ...array);
}

export function setTokenData(tokens) {
    figma.root.setSharedPluginData('tokens', 'version', pjs.version);
    figma.root.setSharedPluginData('tokens', 'values', JSON.stringify(tokens));
}

export function getTokenData() {
    const values = figma.root.getSharedPluginData('tokens', 'values');
    const version = figma.root.getSharedPluginData('tokens', 'version');
    if (values) {
        const parsedValues = JSON.parse(values);
        return {values: parsedValues, version};
    }
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
            console.log('Mapvalues', tokens, data);
            const mappedValues = mapValuesToTokens(tokens, data);
            setValuesOnNode(node, mappedValues, data);
            store.successfulNodes.push(node);
            returnedValues.push(data);
        }

        i += 1;
    }
    return returnedValues[0];
}
