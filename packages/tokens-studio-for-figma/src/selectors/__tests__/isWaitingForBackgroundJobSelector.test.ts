import { isWaitingForBackgroundJobSelector } from '../isWaitingForBackgroundJobSelector';
import type { RootState } from '@/app/store';
import { BackgroundJobs } from '@/constants/BackgroundJobs';

describe('isWaitingForBackgroundJobSelector', () => {
  it('should work', () => {
    expect(isWaitingForBackgroundJobSelector({
      uiState: {
        backgroundJobs: [{
          name: BackgroundJobs.NODEMANAGER_UPDATE,
          isInfinite: true,
        }],
      },
    } as unknown as RootState, BackgroundJobs.NODEMANAGER_UPDATE)).toBe(true);

    expect(isWaitingForBackgroundJobSelector({
      uiState: {
        backgroundJobs: [{
          name: BackgroundJobs.NODEMANAGER_UPDATE,
          completedTasks: 10,
          totalTasks: 12,
        }],
      },
    } as unknown as RootState, BackgroundJobs.NODEMANAGER_UPDATE)).toBe(false);

    expect(isWaitingForBackgroundJobSelector({
      uiState: {
        backgroundJobs: [{
          name: BackgroundJobs.NODEMANAGER_UPDATE,
          completedTasks: 13,
          totalTasks: 12,
        }],
      },
    } as unknown as RootState, BackgroundJobs.NODEMANAGER_UPDATE)).toBe(true);

    expect(isWaitingForBackgroundJobSelector({
      uiState: {
        backgroundJobs: [{
          name: BackgroundJobs.NODEMANAGER_UPDATE,
        }],
      },
    } as unknown as RootState, BackgroundJobs.NODEMANAGER_UPDATE)).toBe(true);
  });
});
