import {useTokenState} from '../store/TokenContext';

export const onUpdate = (state) => {
    setTimeout(() => {
        parent.postMessage(
            {
                pluginMessage: {
                    type: 'update',
                    values: selectionValues,
                    tokens: state.tokens,
                },
            },
            '*'
        );
    }, 100);
};

export const onSetNodeData = (data = {}) => {
    setTimeout(() => {
        parent.postMessage(
            {
                pluginMessage: {
                    type: 'set-node-data',
                    values: {
                        ...selectionValues,
                        ...data,
                    },
                    tokens: state.tokens,
                },
            },
            '*'
        );
    }, 100);
};

export const removeTokenValues = (state) => {
    setTimeout(() => {
        parent.postMessage(
            {
                pluginMessage: {
                    type: 'remove-node-data',
                },
            },
            '*'
        );
    }, 100);
};

export const createStyles = (state) => {
    setTimeout(() => {
        parent.postMessage(
            {
                pluginMessage: {
                    type: 'create-styles',
                    tokens: state.tokens,
                },
            },
            '*'
        );
    }, 100);
};
