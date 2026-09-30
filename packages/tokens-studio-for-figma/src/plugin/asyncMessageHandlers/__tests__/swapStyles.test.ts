import { UpdateMode } from '@/constants/UpdateMode';
import { applySiblingStyleId } from '../applySiblingStyle';
import { swapStyles } from '../swapStyles';

jest.mock('../applySiblingStyle', () => ({
  applySiblingStyleId: jest.fn(),
}));

const mockedApplySiblingStyleId = applySiblingStyleId as jest.MockedFunction<typeof applySiblingStyleId>;

describe('swapStyles', () => {
  beforeEach(() => {
    Object.assign(figma.currentPage, { children: [{ type: 'RECTANGLE', id: '1:1' }] });
  });

  it('does not scan the page when there are no sibling-style references', async () => {
    await swapStyles({ active: 'light' }, [{ id: 'light', name: 'Light', selectedTokenSets: {} }], UpdateMode.PAGE);

    expect(mockedApplySiblingStyleId).not.toHaveBeenCalled();
  });

  it('waits for all style swaps when references exist', async () => {
    let finishSwap: () => void = () => {};
    const swapping = new Promise<void>((resolve) => {
      finishSwap = resolve;
    });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    mockedApplySiblingStyleId.mockImplementationOnce(async () => {
      signalStarted();
      await swapping;
    });

    const updating = swapStyles(
      { active: 'light' },
      [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {},
          $figmaStyleReferences: { 'color.primary': 'S:1234,' },
        },
      ],
      UpdateMode.PAGE,
    );

    await started;
    let completed = false;
    updating.then(() => {
      completed = true;
    });
    await Promise.resolve();
    expect(completed).toBe(false);

    finishSwap();
    await updating;
    expect(mockedApplySiblingStyleId).toHaveBeenCalledTimes(1);
  });
});
