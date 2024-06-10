import { createMockStore } from '../../../../../../tests/config/setupTest';

describe('Can set swap styles', () => {
  it('should work', () => {
    const mockStore = createMockStore({});
    expect(mockStore.getState().settings.shouldSwapStyles).toEqual(false);
    mockStore.dispatch.settings.setShouldSwapStyles(true);
    expect(mockStore.getState().settings.shouldSwapStyles).toEqual(true);
  });
});
