import { createMockStore } from '@tests/config/setupTest';

describe('Can set swap styles', () => {
  it('should work', () => {
    const mockStore = createMockStore({});
    expect(mockStore.getState().settings.swapStyles).toEqual(false);
    mockStore.dispatch.settings.setSwapStyles(true);
    expect(mockStore.getState().settings.swapStyles).toEqual(true);
  });
});
