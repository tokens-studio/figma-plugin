import { createMultipleTokens } from './createMultipleTokens';
import { pushToTokensStudioOAuth, reloadStudioProject } from '../../../providers/tokens-studio/tokensStudioOAuth';
import { notifyToUI } from '@/plugin/notifiers';
import { store } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('../../../providers/tokens-studio/tokensStudioOAuth', () => ({
  pushToTokensStudioOAuth: jest.fn(async () => ({ data: { id: 's-new' } })),
  reloadStudioProject: jest.fn(async () => {}),
}));
jest.mock('@/plugin/notifiers', () => ({ notifyToUI: jest.fn() }));
jest.mock('@/app/store', () => ({ store: { getState: jest.fn() } }));

const mockPush = jest.mocked(pushToTokensStudioOAuth);

const setState = (simple: boolean) => {
  jest.mocked(store.getState).mockReturnValue({
    uiState: {
      api: {
        provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'p1', changeSetId: 'cs1', orgId: 'o1',
      },
    },
    tokenState: {
      tokenSetMetadata: { 'Color-mode/Light': { id: 's-light' } },
      studioSimpleView: { projectId: 'p1', active: simple, collections: [] },
    },
  } as any);
};

const payload = [
  {
    parent: 'Color-mode/Light', name: 'bg', value: '#fff', type: 'color',
  },
  {
    parent: 'Brand', name: 'logo', value: '#f00', type: 'color',
  },
] as any;

describe('createMultipleTokens', () => {
  let dispatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = { tokenState: { setTokenSetMetadata: jest.fn() } };
  });

  it('creates no set in a Simple project: tokens go only to existing mode sets, and the rest is reported', async () => {
    setState(true);

    await createMultipleTokens(dispatch)(payload, {});

    expect(mockPush.mock.calls.map(([args]) => args.action)).toEqual(['BATCH_CREATE_TOKENS']);
    expect(mockPush.mock.calls[0][0].data).toEqual([
      expect.objectContaining({ name: 'bg', token_set_id: 's-light' }),
    ]);
    expect(notifyToUI).toHaveBeenCalledWith(expect.stringContaining('Nothing was imported into "Brand"'), { error: true });
    expect(reloadStudioProject).toHaveBeenCalled();
  });

  it('keeps creating the missing set in an Advanced project', async () => {
    setState(false);

    await createMultipleTokens(dispatch)(payload, {});

    expect(mockPush.mock.calls.map(([args]) => [args.action, args.action === 'CREATE_TOKEN_SET' ? args.data : undefined])).toEqual([
      ['CREATE_TOKEN_SET', { name: 'Brand' }],
      ['BATCH_CREATE_TOKENS', undefined],
    ]);
    expect(reloadStudioProject).not.toHaveBeenCalled();
  });
});
