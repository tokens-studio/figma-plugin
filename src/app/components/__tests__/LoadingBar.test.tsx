import React from 'react';
import get from 'just-safe-get';
import { render, resetStore } from '../../../../tests/config/setupTest';
import { store } from '@/app/store';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import LoadingBar, { backgroundJobTitles } from '../LoadingBar';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

describe('LoadingBar', () => {
  afterEach(() => {
    resetStore();
  });

  it('should not display without jobs', async () => {
    const result = render(<LoadingBar />);
    expect(result.queryByTestId('loadingBar')).toBeNull();
    result.unmount();
  });

  it('should display the job messages', async () => {
    Object.values(BackgroundJobs).reduce<Promise<void>>(async (prev, jobType) => {
      await prev;

      store.dispatch.uiState.startJob({
        name: jobType,
        isInfinite: true,
      });

      const result = render(<LoadingBar />);
      const jobTitle = get(backgroundJobTitles, jobType) as string | undefined;
      expect(result.queryByText(jobTitle || 'Hold on, updating...')).not.toBeNull();
      result.unmount();
    }, Promise.resolve());
  });

  it('should display the expected time', async () => {
    store.dispatch.uiState.startJob({
      name: BackgroundJobs.NODEMANAGER_UPDATE,
      timePerTask: 1000,
      completedTasks: 10,
      totalTasks: 100,
    });

    const result = render(<LoadingBar />);
    expect(await result.findByText(/90s remaining/)).not.toBeNull();

    result.unmount();
  });

  it('should be able to cancel', async () => {
    const asyncMessageChannelSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');

    store.dispatch.uiState.startJob({
      name: BackgroundJobs.NODEMANAGER_UPDATE,
      isInfinite: true,
    });

    const result = render(<LoadingBar />);
    const cancelButton = result.queryByText('Cancel');
    cancelButton?.click();

    expect(asyncMessageChannelSpy).toBeCalledWith({
      type: AsyncMessageTypes.CANCEL_OPERATION,
    });

    result.unmount();
  });

  it('should not display the job messages with minimized version', async () => {
    Object.values(BackgroundJobs).reduce<Promise<void>>(async (prev, jobType) => {
      await prev;

      store.dispatch.uiState.startJob({
        name: jobType,
        isInfinite: true,
      });

      store.dispatch.settings.setMinimizePluginWindow({
        width: 100,
        height: 100,
        isMinimized: true,
      });

      const result = render(<LoadingBar />);
      const jobTitle = get(backgroundJobTitles, jobType) as string | undefined;
      expect(result.queryByText(jobTitle || 'Hold on, updating...')).toBeNull();
      expect(result.queryByTestId('loadingBar')).not.toBeNull();
      result.unmount();
    }, Promise.resolve());
  });
});
