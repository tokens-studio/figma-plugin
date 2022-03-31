import React from 'react';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import { RootState } from '../store';
import Button from './Button';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { useDelayedFlag } from '@/hooks';
import { BackgroundJobs } from '@/constants/BackgroundJobs';

const backgroundJobTitles = {
  [BackgroundJobs.NODEMANAGER_UPDATE]: 'Finding and caching tokens...',
  [BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA]: 'Determing nodes to update...',
  [BackgroundJobs.PLUGIN_UPDATENODES]: 'Updating nodes...',
  [BackgroundJobs.PLUGIN_UPDATEPLUGINDATA]: 'Updating plugin data...',
  [BackgroundJobs.UI_PULLTOKENS]: 'Fetching remote tokens...',
  [BackgroundJobs.UI_APPLYNODEVALUE]: 'Applying node value...',
  [BackgroundJobs.UI_EDITSINGLETOKEN]: 'Updating token...',
  [BackgroundJobs.UI_CREATESINGLETOKEN]: 'Creating token...',
  [BackgroundJobs.UI_DELETETOKENGROUP]: 'Deleting token...',
  [BackgroundJobs.UI_DUPLICATETOKEN]: 'Duplicating token...',
};

export default function LoadingBar() {
  const { backgroundJobs } = useSelector((state: RootState) => state.uiState);
  const hasInfiniteJobs = React.useMemo(() => backgroundJobs.some((job) => job.isInfinite), [backgroundJobs]);
  const expectedWaitTime = React.useMemo(() => backgroundJobs.reduce((time, job) => (
    time + (job.totalTasks ? (
      (job.totalTasks - (job.completedTasks ?? 0)) * (job.timePerTask ?? 0)
    ) : 0)
  ), 0), [backgroundJobs]);
  const expectedWaitTimeInSeconds = React.useMemo(() => (
    Math.round(expectedWaitTime / 1000)
  ), [expectedWaitTime]);
  const shouldShow = useDelayedFlag(
    !(
      (!backgroundJobs.length || expectedWaitTime < 100)
      && !hasInfiniteJobs
    ),
  );

  const handleCancel = React.useCallback(() => {
    postToFigma({
      type: MessageToPluginTypes.CANCEL_OPERATION,
    });
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed w-full z-20" data-cy="loadingBar">
      <div className="flex items-center space-x-2 bg-gray-300 p-2 rounded m-2">
        <div className="inline-flex rotate">
          <Icon name="loading" />
        </div>
        <div className="flex flex-grow items-center justify-between">
          <div className="font-medium text-xxs">
            {backgroundJobTitles[backgroundJobs[backgroundJobs.length - 1]?.name] ?? 'Hold on, updating...'}
            {expectedWaitTimeInSeconds >= 1 && (
              `(${expectedWaitTimeInSeconds}s remaining)`
            )}
          </div>
          <Button variant="ghost" size="small" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
