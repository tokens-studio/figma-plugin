import { StorageProviderType } from '@/constants/StorageProviderType';
import { pushThemeToTokensStudioOAuth } from '../utils/pushThemeToTokensStudioOAuth';
import { disconnectVariablesFromThemes } from '../disconnectVariablesFromThemes';
import { restoreVariableReferencesToThemes } from '../restoreVariableReferencesToThemes';

const mockGetState = jest.fn();

jest.mock('@/app/store', () => ({
  store: { getState: () => mockGetState() },
}));

jest.mock('../utils/pushThemeToTokensStudioOAuth', () => ({
  pushThemeToTokensStudioOAuth: jest.fn(),
}));

const themes = [{ id: 'light' }, { id: 'dark' }, { id: 'contrast' }];

describe.each([
  ['disconnectVariablesFromThemes', disconnectVariablesFromThemes, { light: ['fg'], dark: ['fg'] }],
  ['restoreVariableReferencesToThemes', restoreVariableReferencesToThemes, { light: { fg: 'key-1' }, dark: { fg: 'key-2' } }],
])('%s effect', (_, effect, payload) => {
  const createDispatch = () => ({ tokenState: { updateDocument: jest.fn() } }) as any;

  beforeEach(() => jest.clearAllMocks());

  it('updates the document once', () => {
    mockGetState.mockReturnValue({ uiState: { api: { provider: StorageProviderType.LOCAL } }, tokenState: { themes } });
    const dispatch = createDispatch();
    effect(dispatch)(payload, {});

    expect(dispatch.tokenState.updateDocument).toHaveBeenCalledTimes(1);
    expect(dispatch.tokenState.updateDocument).toHaveBeenCalledWith({ updateRemote: true, shouldUpdateNodes: false });
    expect(pushThemeToTokensStudioOAuth).not.toHaveBeenCalled();
  });

  it('pushes only the affected themes to Tokens Studio', () => {
    const state = { uiState: { api: { provider: StorageProviderType.TOKENS_STUDIO_OAUTH } }, tokenState: { themes } };
    mockGetState.mockReturnValue(state);
    const dispatch = createDispatch();
    effect(dispatch)(payload, {});

    expect(pushThemeToTokensStudioOAuth).toHaveBeenCalledTimes(2);
    expect(pushThemeToTokensStudioOAuth).toHaveBeenCalledWith(themes[0], state, dispatch);
    expect(pushThemeToTokensStudioOAuth).toHaveBeenCalledWith(themes[1], state, dispatch);
  });
});
