import {init} from '@rematch/core';
import {models, RootModel} from './index';

describe('editToken', () => {
    let store;
    beforeEach(() => {
        store = init<RootModel>({
            redux: {
                initialState: {
                    tokenState: {
                        tokens: {
                            global: [
                                {
                                    name: 'primary',
                                    value: '1',
                                },
                                {
                                    name: 'alias',
                                    value: '$primary',
                                },
                                {
                                    name: 'primary50',
                                    value: '0.50',
                                },
                                {
                                    name: 'alias50',
                                    value: '$primary50',
                                },
                            ],
                            options: [
                                {
                                    name: 'background',
                                    value: '$primary',
                                },
                            ],
                        },
                        usedTokenSet: ['global'],
                    },
                },
            },
            models,
        });
    });

    it('calls updateAliases if old name differs from new name', async () => {
        await store.dispatch.tokenState.editToken({
            parent: 'global',
            oldName: 'primary',
            name: 'brand.primary',
            value: '1',
        });

        const {tokens} = store.getState().tokenState;
        expect(tokens.global[1].value).toEqual('{brand.primary}');
    });

    it('doesnt interfere with tokens that have a similar name', async () => {
        await store.dispatch.tokenState.editToken({
            parent: 'global',
            oldName: 'primary',
            name: 'secondary',
            value: '1',
        });

        const {tokens} = store.getState().tokenState;
        expect(tokens.global[1].value).toEqual('{secondary}');
        expect(tokens.global[3].value).toEqual('$primary50');
    });

    it('also updates tokens from other sets', async () => {
        await store.dispatch.tokenState.editToken({
            parent: 'global',
            oldName: 'primary',
            name: 'secondary',
            value: '1',
        });

        const {tokens} = store.getState().tokenState;
        expect(tokens.options[0].value).toEqual('{secondary}');
    });
});
