import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('renameTokenSetFolder', () => {
  it('should rename styleId to current theme', async () => {
    const mockStore = createMockStore({
      tokenState: {
        tokens: {
          'foob/baz': [],
          'foob/bazo': [],
          foobare: [],
          foo: [],
        },
      },
    });
    await mockStore.dispatch.tokenState.renameTokenSetFolder({ oldName: 'foob', newName: 'foobar' });
    const { tokens } = mockStore.getState().tokenState;
    expect(tokens).toEqual({
      'foobar/baz': [],
      'foobar/bazo': [],
      foobare: [],
      foo: [],
    });
  });
});
