import { createMockStore } from '../../../../../../tests/config/setupTest';

const createStore = () => createMockStore({
  tokenState: {
    themes: [{
      id: 'light',
      name: 'Light',
      selectedTokenSets: {},
      $figmaVariableReferences: { 'fg.default': 'key-1', 'fg.muted': 'key-2' },
    }, {
      id: 'dark',
      name: 'Dark',
      selectedTokenSets: {},
      $figmaVariableReferences: { 'fg.default': 'key-3' },
    }, {
      id: 'contrast',
      name: 'Contrast',
      selectedTokenSets: {},
    }],
  },
});

describe('disconnectVariablesFromThemes', () => {
  it('removes the given references from each theme in one update', async () => {
    const store = createStore();
    await store.dispatch.tokenState.disconnectVariablesFromThemes({
      light: ['fg.default'],
      dark: ['fg.default'],
      contrast: ['fg.default'],
    });
    const { themes } = store.getState().tokenState;
    expect(themes[0].$figmaVariableReferences).toEqual({ 'fg.muted': 'key-2' });
    expect(themes[1].$figmaVariableReferences).toEqual({});
    expect(themes[2].$figmaVariableReferences).toBeUndefined();
  });
});

describe('restoreVariableReferencesToThemes', () => {
  it('adds missing references and leaves existing ones alone', async () => {
    const store = createStore();
    await store.dispatch.tokenState.restoreVariableReferencesToThemes({
      light: { 'fg.default': 'key-other', 'bg.default': 'key-4' },
      dark: { 'fg.default': 'key-3' },
      contrast: { 'fg.default': 'key-5' },
    });
    const { themes } = store.getState().tokenState;
    expect(themes[0].$figmaVariableReferences).toEqual({ 'fg.default': 'key-1', 'fg.muted': 'key-2', 'bg.default': 'key-4' });
    expect(themes[1].$figmaVariableReferences).toEqual({ 'fg.default': 'key-3' });
    expect(themes[2].$figmaVariableReferences).toEqual({ 'fg.default': 'key-5' });
  });
});
