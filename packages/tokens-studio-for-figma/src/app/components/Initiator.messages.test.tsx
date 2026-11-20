import React from 'react';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { render, fireEvent, createMockStore } from '../../../tests/config/setupTest';
import { Initiator } from './Initiator';
import { track } from '@/utils/analytics';
import { Tabs } from '@/constants/Tabs';

jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

jest.mock('@sentry/react', () => ({
  ...jest.requireActual('@sentry/react'),
  captureException: jest.fn(),
}));

function setup() {
  const mockStore = createMockStore({});
  render(
    <Provider store={mockStore}>
      <Initiator />
    </Provider>,
  );
  const send = (pluginMessage: Record<string, unknown>) => fireEvent(
    window,
    new MessageEvent('message', { data: { pluginMessage } }),
  );
  return { mockStore, send };
}

describe('Initiator plugin messages', () => {
  it('reports exceptions from the plugin to Sentry', () => {
    const { send } = setup();
    send({ type: 'notify_exception', error: 'boom', opts: { tags: { area: 'export' } } });
    expect(Sentry.captureException).toHaveBeenCalledWith({ error: 'boom', tags: { area: 'export' } });
  });

  it('forwards tracking events from the plugin', () => {
    const { send } = setup();
    send({ type: 'track_from_plugin', title: 'Applied token', opts: { count: 2 } });
    expect(track).toHaveBeenCalledWith('Applied token', { count: 2 });
  });

  it('stores the API providers sent by the plugin', () => {
    const { mockStore, send } = setup();
    const providers = [{
      provider: 'github', id: 'org/repo', secret: 'x', name: 'Repo',
    }];
    send({ type: 'apiProviders', providers });
    expect(mockStore.getState().uiState.apiProviders).toEqual(providers);
  });

  it('imports variables and their themes, then opens the tokens tab', () => {
    const { mockStore, send } = setup();
    const setTokensFromVariables = jest.spyOn(mockStore.dispatch.tokenState, 'setTokensFromVariables').mockImplementation(() => ({} as any));
    const setThemesFromVariables = jest.spyOn(mockStore.dispatch.tokenState, 'setThemesFromVariables').mockImplementation(() => ({} as any));
    const values = { colors: [{ name: 'red', value: '#ff0000', type: 'color' }] };
    const themes = [{ id: 'light', name: 'Light', selectedTokenSets: {} }];

    send({ type: 'variables', values, themes });

    expect(setTokensFromVariables).toHaveBeenCalledWith(values);
    expect(setThemesFromVariables).toHaveBeenCalledWith(themes);
    expect(mockStore.getState().uiState.activeTab).toBe(Tabs.TOKENS);
  });

  it('skips the variable import when the message has no values or themes', () => {
    const { mockStore, send } = setup();
    const setTokensFromVariables = jest.spyOn(mockStore.dispatch.tokenState, 'setTokensFromVariables');
    const setThemesFromVariables = jest.spyOn(mockStore.dispatch.tokenState, 'setThemesFromVariables');

    send({ type: 'variables' });

    expect(setTokensFromVariables).not.toHaveBeenCalled();
    expect(setThemesFromVariables).not.toHaveBeenCalled();
  });

  it('records renamed collections only when there are any', () => {
    const { mockStore, send } = setup();
    const setRenamedCollections = jest.spyOn(mockStore.dispatch.tokenState, 'setRenamedCollections').mockImplementation(() => ({} as any));

    send({ type: 'rename_collections_and_modes', renamedCollections: [] });
    expect(setRenamedCollections).not.toHaveBeenCalled();

    const renamedCollections = [['Old collection', 'New collection']];
    send({ type: 'rename_collections_and_modes', renamedCollections });
    expect(setRenamedCollections).toHaveBeenCalledWith(renamedCollections);
  });

  it('applies the hide deprecated tokens setting from the plugin', () => {
    const { mockStore, send } = setup();
    send({ type: 'hide_deprecated_tokens', hideDeprecatedTokens: true });
    expect(mockStore.getState().uiState.hideDeprecatedTokens).toBe(true);
  });

  it('ignores messages it does not handle', () => {
    const { mockStore, send } = setup();
    const before = mockStore.getState();
    send({ type: 'unknown_message' });
    expect(mockStore.getState()).toBe(before);
  });
});
