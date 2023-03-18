import { createMockStore } from '../../../../../tests/config/setupTest';
import { mockFetch } from '../../../../../tests/__mocks__/fetchMock';
import { updateJSONBinTokens } from '../jsonbin';

describe('updateJSONBinTokens', () => {
  it('should work', async () => {
    const mockStore = createMockStore({});
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
    }));

    await updateJSONBinTokens({
      tokens: {},
      themes: [],
      context: {
        id: 'jsonbin',
        secret: 'secret',
      },
      updatedAt: '2022-06-16T10:00:00.000Z',
      dispatch: mockStore.dispatch,
    });

    expect(mockFetch).toBeCalledTimes(1);
  });

  it('should check updatedAt', async () => {
    const mockStore = createMockStore({});
    mockFetch.mockImplementationOnce(() => (
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          record: {
            version: '1',
            updatedAt: '2022-06-15T10:00:00.000Z',
            values: {},
            $themes: [],
            $metadata: {},
          },
        }),
      })
    ));

    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
    }));

    await updateJSONBinTokens({
      tokens: {},
      themes: [],
      context: {
        id: 'jsonbin',
        secret: 'secret',
      },
      oldUpdatedAt: '2022-06-15T12:00:00.000Z',
      updatedAt: '2022-06-16T10:00:00.000Z',
      dispatch: mockStore.dispatch,
    });

    expect(mockFetch).toBeCalledTimes(2);
  });
});
