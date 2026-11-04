import { assignStyleIdsToCurrentTheme } from './assignStyleIdsToCurrentTheme';
import { pushThemesToStudio } from './pushThemesToStudio';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('./utils/pushThemeToTokensStudioOAuth', () => ({
  pushThemeToTokensStudioOAuth: jest.fn(),
  notifyThemePushFailures: jest.fn(),
}));

jest.mock('@/app/store', () => ({
  store: { getState: jest.fn() },
}));

const mockPush = jest.mocked(pushThemeToTokensStudioOAuth);
const mockNotifyFailures = jest.mocked(notifyThemePushFailures);
const mockGetState = jest.mocked(store.getState);

const themes = [
  { id: 'a', name: 'A', group: 'Brand' },
  { id: 'b', name: 'B', group: 'Brand' },
  { id: 'c', name: 'C', group: 'Brand' },
];

const setState = (provider = StorageProviderType.TOKENS_STUDIO_OAUTH) => {
  mockGetState.mockReturnValue({
    uiState: { api: { provider, id: 'project-1', changeSetId: 'change-set-1' } },
    tokenState: { themes },
  } as any);
};

describe('pushThemesToStudio', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = { tokenState: { updateDocument: jest.fn() } };
    mockPush.mockResolvedValue({ ok: true });
    setState();
  });

  it('pushes each given theme once', async () => {
    await pushThemesToStudio(dispatch)(['a', 'b', 'c']);

    expect(mockPush.mock.calls.map(([theme]) => theme.id)).toEqual(['a', 'b', 'c']);
    expect(mockNotifyFailures).toHaveBeenCalledWith([]);
  });

  it('pushes a repeated theme id once', async () => {
    await pushThemesToStudio(dispatch)(['a', 'a']);

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('waits for one push to finish before it starts the next', async () => {
    let finishFirst: (value: { ok: true }) => void = () => {};
    mockPush.mockReturnValueOnce(new Promise((resolve) => {
      finishFirst = resolve;
    }));

    const pushing = pushThemesToStudio(dispatch)(['a', 'b']);
    await Promise.resolve();
    expect(mockPush).toHaveBeenCalledTimes(1);

    finishFirst({ ok: true });
    await pushing;
    expect(mockPush).toHaveBeenCalledTimes(2);
  });

  describe('when state changes while an earlier push waits', () => {
    const pushWhile = async (nextThemes: typeof themes) => {
      let finishFirst: (value: { ok: true }) => void = () => {};
      mockPush.mockReturnValueOnce(new Promise((resolve) => {
        finishFirst = resolve;
      }));
      const nextState = {
        uiState: { api: { provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', changeSetId: 'change-set-1' } },
        tokenState: { themes: nextThemes },
      };

      const pushing = pushThemesToStudio(dispatch)(['a', 'b']);
      await Promise.resolve();
      mockGetState.mockReturnValue(nextState as any);
      finishFirst({ ok: true });
      await pushing;

      return nextState;
    };

    it('sends the newer values of a theme saved in the meantime', async () => {
      const savedB = { ...themes[1], name: 'B saved' };

      const nextState = await pushWhile([themes[0], savedB, themes[2]]);

      expect(mockPush).toHaveBeenCalledTimes(2);
      expect(mockPush.mock.calls[1][0]).toEqual(savedB);
      expect(mockPush.mock.calls[1][1]).toBe(nextState);
    });

    it('skips a theme deleted in the meantime', async () => {
      await pushWhile([themes[0], themes[2]]);

      expect(mockPush.mock.calls.map(([theme]) => theme.id)).toEqual(['a']);
    });
  });

  it('reports every refused theme in one message and still pushes the rest', async () => {
    const failure = { themeName: 'A', action: 'update' as const, reason: 'Refused' };
    mockPush.mockResolvedValueOnce({ ok: false, failure });

    await pushThemesToStudio(dispatch)(['a', 'b']);

    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush.mock.calls[0][3]).toEqual({ notifyOnFailure: false });
    expect(mockNotifyFailures).toHaveBeenCalledWith([failure]);
  });

  it('skips an id that matches no theme', async () => {
    await pushThemesToStudio(dispatch)(['missing', 'b']);

    expect(mockPush.mock.calls.map(([theme]) => theme.id)).toEqual(['b']);
  });

  it('does nothing for an empty list', async () => {
    await pushThemesToStudio(dispatch)([]);

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockNotifyFailures).not.toHaveBeenCalled();
  });

  it('does nothing for another storage provider', async () => {
    setState(StorageProviderType.GITHUB);

    await pushThemesToStudio(dispatch)(['a']);

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockNotifyFailures).not.toHaveBeenCalled();
  });
});

describe('assignStyleIdsToCurrentTheme', () => {
  it('saves the document and leaves the push to Tokens Studio to its caller', () => {
    jest.clearAllMocks();
    setState();
    const dispatch: any = { tokenState: { updateDocument: jest.fn() } };

    assignStyleIdsToCurrentTheme(dispatch)(
      { selectedThemes: ['a', 'b', 'c'] },
      { uiState: { api: { provider: StorageProviderType.TOKENS_STUDIO_OAUTH } } },
    );

    expect(dispatch.tokenState.updateDocument).toHaveBeenCalledWith({ updateRemote: true, shouldUpdateNodes: false });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
