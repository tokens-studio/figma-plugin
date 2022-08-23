import { store } from '@/app/store';
import { UpdateMode } from '@/constants/UpdateMode';
import { resetStore } from '../../../../tests/config/setupTest';

describe('uiState', () => {
  beforeEach(() => {
    resetStore();
  });

  it('can update the currentUpdateMode', async () => {
    await store.dispatch.uiState.setCurrentUpdateMode(UpdateMode.PAGE);

    const { currentUpdateMode } = store.getState().uiState;
    expect(currentUpdateMode).toEqual(UpdateMode.PAGE);
  });
});
