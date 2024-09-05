import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { MessageFromPluginTypes } from '@/types/messages';
import { TokenStore } from '@/types/tokens';
import { mockUiPostMessage } from '../../../tests/__mocks__/figmaMock';
import {
  notifyException, notifySelection, notifySetTokens, trackFromPlugin,
} from '../notifiers';

describe('notifySelection', () => {
  it('should work', () => {
    notifySelection({
      selectionValues: [],
      mainNodeSelectionValues: [],
      selectedNodes: 0,
    });

    expect(mockUiPostMessage).toBeCalledTimes(1);
    expect(mockUiPostMessage).toBeCalledWith({
      type: MessageFromPluginTypes.SELECTION,
      selectionValues: [],
      mainNodeSelectionValues: [],
      selectedNodes: 0,
    });
  });
});

describe('notifySetTokens', () => {
  it('should work', () => {
    const mockStoreValues: TokenStore = {
      version: '',
      updatedAt: '',
      values: {},
      usedTokenSet: {},
      checkForChanges: true,
      activeTheme: {},
      themes: [],
      storageType: {
        provider: AVAILABLE_PROVIDERS.LOCAL as StorageProviderType.LOCAL,
      },
    };
    notifySetTokens(mockStoreValues);
    expect(mockUiPostMessage).toBeCalledTimes(1);
    expect(mockUiPostMessage).toBeCalledWith({
      type: MessageFromPluginTypes.SET_TOKENS,
      values: mockStoreValues,
    });
  });
});

describe('notifyException', () => {
  it('should work', () => {
    notifyException('does not work', { foo: 'bar' });
    expect(mockUiPostMessage).toBeCalledTimes(1);
    expect(mockUiPostMessage).toBeCalledWith({
      type: MessageFromPluginTypes.NOTIFY_EXCEPTION,
      error: 'does not work',
      opts: { foo: 'bar' },
    });
  });
});

describe('trackFromPlugin', () => {
  it('should work', () => {
    trackFromPlugin('does work', { foo: 'bar' });
    expect(mockUiPostMessage).toBeCalledTimes(1);
    expect(mockUiPostMessage).toBeCalledWith({
      type: MessageFromPluginTypes.TRACK_FROM_PLUGIN,
      title: 'does work',
      opts: { foo: 'bar' },
    });
  });
});
