import React from 'react';
import { Provider } from 'react-redux';
import {
  render, resetStore, createMockStore,
} from '../../../tests/config/setupTest';
import { ConvertToDTCGModal } from './ConvertToDTCGModal';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

// useRemoteTokens carries a large dependency web (storage clients, hooks). We only need
// pushTokens to exist as a callable — the modal is what's under test.
jest.mock('../store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    pushTokens: jest.fn(),
  }),
}));

// Modal wrapper renders via a portal; asset imports need a stub in jest for the require.
jest.mock('@/app/assets/hints/w3cformat.png', () => 'w3cformat.png', { virtual: true });
jest.mock('@/app/assets/hints/legacyformat.png', () => 'legacyformat.png', { virtual: true });

const TOKENS_LEGACY = {
  global: [{ name: 'primary', value: '#000', type: 'color' }],
};

// lastSyncedState after a successful sync in LEGACY. The 3-tuple carries the format at index 2.
const LAST_SYNCED_LEGACY = JSON.stringify([TOKENS_LEGACY, [], TokenFormatOptions.Legacy], null, 2);

// LastSynced that DIFFERS by a real token value (not just format) → true pending edit.
const LAST_SYNCED_DIFFERENT_TOKENS = JSON.stringify(
  [{ global: [{ name: 'primary', value: '#ffffff', type: 'color' }] }, [], TokenFormatOptions.DTCG],
  null,
  2,
);

describe('ConvertToDTCGModal', () => {
  beforeEach(() => {
    resetStore();
  });

  // Regression: after the user flips the format, compareLastSyncedState reports a diff
  // (format is part of the serialized tuple), so hasChanges becomes true. That used to
  // disable the convert/revert button via `disabled={hasRemoteChanges}` — trapping the
  // user with no way to undo through this UI if they cancelled or failed the push dialog.
  // Fix: exempt the format-only diff case so the reverse conversion stays reachable.
  it('keeps the revert button enabled when the only diff is the format flip', () => {
    const mockStore = createMockStore({
      uiState: {
        showConvertTokenFormatModal: true,
        storageType: { provider: StorageProviderType.GITHUB },
      },
      tokenState: {
        tokens: TOKENS_LEGACY,
        themes: [],
        // Currently DTCG — the user just flipped from Legacy.
        tokenFormat: TokenFormatOptions.DTCG,
        // Last sync was in Legacy: same tokens, different format at index 2.
        lastSyncedState: LAST_SYNCED_LEGACY,
        remoteData: { tokens: TOKENS_LEGACY, themes: [], metadata: { tokenSetOrder: ['global'] } },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <ConvertToDTCGModal />
      </Provider>,
    );

    // The revert button (isDTCG → 'converttolegacy'). i18n falls through to the key in tests.
    const revertButton = result.getByText('converttolegacy').closest('button');
    expect(revertButton).not.toBeNull();
    expect(revertButton).not.toBeDisabled();
    // And the pushfirsterror hint isn't rendered.
    expect(result.queryByText('pushfirsterror')).toBeNull();

    result.unmount();
  });

  // Negative: a real token/theme edit still gates the button, so users can't accidentally
  // convert on top of unpushed content changes.
  it('disables the convert button when tokens differ beyond the format flip', () => {
    const mockStore = createMockStore({
      uiState: {
        showConvertTokenFormatModal: true,
        storageType: { provider: StorageProviderType.GITHUB },
      },
      tokenState: {
        tokens: TOKENS_LEGACY,
        themes: [],
        tokenFormat: TokenFormatOptions.DTCG,
        // Last sync had different token values (real pending edit).
        lastSyncedState: LAST_SYNCED_DIFFERENT_TOKENS,
        remoteData: {
          tokens: { global: [{ name: 'primary', value: '#ffffff', type: 'color' }] },
          themes: [],
          metadata: { tokenSetOrder: ['global'] },
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <ConvertToDTCGModal />
      </Provider>,
    );

    const revertButton = result.getByText('converttolegacy').closest('button');
    expect(revertButton).not.toBeNull();
    expect(revertButton).toBeDisabled();
    expect(result.queryByText('pushfirsterror')).toBeInTheDocument();

    result.unmount();
  });

  // Local storage never blocks (no remote to be out of sync with).
  it('keeps the button enabled for LOCAL storage even with pending changes', () => {
    const mockStore = createMockStore({
      uiState: {
        showConvertTokenFormatModal: true,
        storageType: { provider: StorageProviderType.LOCAL },
      },
      tokenState: {
        tokens: TOKENS_LEGACY,
        themes: [],
        tokenFormat: TokenFormatOptions.DTCG,
        lastSyncedState: LAST_SYNCED_DIFFERENT_TOKENS,
        remoteData: { tokens: {}, themes: [], metadata: {} },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <ConvertToDTCGModal />
      </Provider>,
    );

    const revertButton = result.getByText('converttolegacy').closest('button');
    expect(revertButton).not.toBeNull();
    expect(revertButton).not.toBeDisabled();

    result.unmount();
  });
});
