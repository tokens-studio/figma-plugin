import { assignStyleIdsToCurrentTheme } from './assignStyleIdsToCurrentTheme';
import { pushThemesToStudio } from './pushThemesToStudio';
import { notifyThemePushFailures, pushThemeToTokensStudioOAuth } from './utils/pushThemeToTokensStudioOAuth';
import { store } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { notifyToUI } from '@/plugin/notifiers';

jest.mock('./utils/pushThemeToTokensStudioOAuth', () => ({
  pushThemeToTokensStudioOAuth: jest.fn(),
  notifyThemePushFailures: jest.fn(),
}));

jest.mock('@/app/store', () => ({
  store: { getState: jest.fn() },
}));

jest.mock('@/plugin/notifiers', () => ({
  notifyToUI: jest.fn(),
}));

const mockNotify = jest.mocked(notifyToUI);
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
    type StateParts = {
      themes?: typeof themes;
      id?: string;
      branch?: string;
      changeSetId?: string;
      resolverChangeSetId?: string;
    };

    const stateWith = (parts: StateParts = {}) => {
      const merged = {
        themes,
        id: 'project-1',
        branch: 'main',
        changeSetId: 'change-set-1',
        resolverChangeSetId: 'change-set-1',
        ...parts,
      };
      return {
        uiState: {
          api: {
            provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
            id: merged.id,
            branch: merged.branch,
            changeSetId: merged.changeSetId,
          },
        },
        tokenState: {
          themes: merged.themes,
          serverResolverContext: { changeSetId: merged.resolverChangeSetId },
        },
      };
    };

    const pushWhile = async (next: StateParts, start: StateParts = {}) => {
      let finishFirst: (value: { ok: true }) => void = () => {};
      mockPush.mockReturnValueOnce(new Promise((resolve) => {
        finishFirst = resolve;
      }));
      mockGetState.mockReturnValue(stateWith(start) as any);
      const nextState = stateWith({ ...start, ...next });

      const pushing = pushThemesToStudio(dispatch)(['a', 'b', 'c']);
      await Promise.resolve();
      mockGetState.mockReturnValue(nextState as any);
      finishFirst({ ok: true });
      await pushing;

      return nextState;
    };

    const pushedIds = () => mockPush.mock.calls.map(([theme]) => theme.id);

    it('sends the newer values of a theme saved in the meantime', async () => {
      const savedB = { ...themes[1], name: 'B saved' };

      const nextState = await pushWhile({ themes: [themes[0], savedB, themes[2]] });

      expect(pushedIds()).toEqual(['a', 'b', 'c']);
      expect(mockPush.mock.calls[1][0]).toEqual(savedB);
      expect(mockPush.mock.calls[1][1]).toBe(nextState);
    });

    it('skips a theme deleted in the meantime', async () => {
      await pushWhile({ themes: [themes[0], themes[2]] });

      expect(pushedIds()).toEqual(['a', 'c']);
    });

    it('keeps going when the first push resolves a change set that was missing after a reload', async () => {
      await pushWhile(
        { changeSetId: 'change-set-1' },
        { changeSetId: undefined, resolverChangeSetId: undefined },
      );

      expect(pushedIds()).toEqual(['a', 'b', 'c']);
    });

    it('stops when the branch name changes, even from a missing change set', async () => {
      await pushWhile(
        { branch: 'other', changeSetId: 'change-set-2' },
        { changeSetId: undefined, resolverChangeSetId: undefined },
      );

      expect(pushedIds()).toEqual(['a']);
    });

    it('keeps going when the credentials lose the change set on the same branch, since a push resolves it again', async () => {
      await pushWhile({ changeSetId: undefined });

      expect(pushedIds()).toEqual(['a', 'b', 'c']);
      expect(mockNotify).not.toHaveBeenCalledWith(expect.any(String), { error: true });
    });

    it('stops when the change set changes, says what was saved, then which branch the unsent themes need', async () => {
      await pushWhile({ changeSetId: 'change-set-2' });

      expect(pushedIds()).toEqual(['a']);
      expect(mockNotify.mock.calls).toEqual([
        ['Saved 1 theme to Tokens Studio'],
        ['The branch changed, so 2 themes were not saved in Tokens Studio. Switch back to "main" and export styles again to save them.', { error: true }],
      ]);
    });

    it('names the main branch when the credentials carry no branch name', async () => {
      await pushWhile({ changeSetId: 'change-set-2' }, { branch: undefined });

      expect(mockNotify).toHaveBeenCalledWith(expect.stringContaining('Switch back to "main"'), { error: true });
    });

    it('says nothing when the branch changes after the last push', async () => {
      mockGetState.mockReturnValue(stateWith() as any);
      mockPush.mockImplementationOnce(async () => {
        mockGetState.mockReturnValue(stateWith({ changeSetId: 'change-set-2' }) as any);
        return { ok: true };
      });

      await pushThemesToStudio(dispatch)(['a']);

      expect(mockNotify).not.toHaveBeenCalledWith(expect.any(String), { error: true });
    });

    it('stops when the project changes', async () => {
      await pushWhile({ id: 'project-2' });

      expect(pushedIds()).toEqual(['a']);
    });

    it('stops while a pull for another branch runs, before the change set in the credentials moves', async () => {
      await pushWhile({ resolverChangeSetId: 'change-set-2' });

      expect(pushedIds()).toEqual(['a']);
    });
  });

  it('reports every refused theme in one message and still pushes the rest', async () => {
    const failure = { themeName: 'A', action: 'update' as const, reason: 'Refused' };
    mockPush.mockResolvedValueOnce({ ok: false, failure });

    await pushThemesToStudio(dispatch)(['a', 'b']);

    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush.mock.calls[0][3]).toEqual({ notifyOnFailure: false, notifyOnSuccess: false });
    expect(mockNotifyFailures).toHaveBeenCalledWith([failure]);
  });

  it('shows one success message for the whole export', async () => {
    await pushThemesToStudio(dispatch)(['a', 'b', 'c']);

    expect(mockNotify.mock.calls).toEqual([['Saved 3 themes to Tokens Studio']]);
  });

  it('counts only saved themes, and reports success before failures, which stay until dismissed', async () => {
    const failure = { themeName: 'A', action: 'update' as const, reason: 'Refused' };
    mockPush.mockResolvedValueOnce({ ok: false, failure });

    await pushThemesToStudio(dispatch)(['a', 'b']);

    expect(mockNotify.mock.calls).toEqual([['Saved 1 theme to Tokens Studio']]);
    expect(mockNotify.mock.invocationCallOrder[0]).toBeLessThan(mockNotifyFailures.mock.invocationCallOrder[0]);
  });

  it('claims no success for a theme that was not sent', async () => {
    mockPush.mockResolvedValue({ ok: true, skipped: true });

    await pushThemesToStudio(dispatch)(['a', 'b']);

    expect(mockNotify).not.toHaveBeenCalled();
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

  it('stops when the provider is no longer Studio, since the theme would go nowhere', async () => {
    mockPush.mockImplementationOnce(async () => {
      setState(StorageProviderType.GITHUB);
      return { ok: true };
    });

    await pushThemesToStudio(dispatch)(['a', 'b']);

    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});

describe('assignStyleIdsToCurrentTheme', () => {
  it('saves the document and leaves the push to Tokens Studio to its caller', () => {
    jest.clearAllMocks();
    setState();
    const dispatch: any = { tokenState: { updateDocument: jest.fn() } };

    assignStyleIdsToCurrentTheme(dispatch)();

    expect(dispatch.tokenState.updateDocument).toHaveBeenCalledWith({ updateRemote: true, shouldUpdateNodes: false });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
