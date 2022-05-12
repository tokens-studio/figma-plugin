import React from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';
import { useDelayedFlag } from '@/hooks';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { backgroundJobsSelector } from '@/selectors';
import Stack from './Stack';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import Spinner from './Spinner';

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
  [BackgroundJobs.UI_REDOING]: 'Redoing action...',
  [BackgroundJobs.UI_UNDOING]: 'Undoing action...',
};

export default function LoadingBar() {
  const backgroundJobs = useSelector(backgroundJobsSelector);
  const currentJob = React.useMemo(() => backgroundJobs?.[backgroundJobs.length - 1], [backgroundJobs]);
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
    AsyncMessageChannel.message({
      type: AsyncMessageTypes.CANCEL_OPERATION,
    });
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed w-full z-20" data-cy="loadingBar">
      <Stack
        direction="row"
        align="center"
        gap={2}
        css={{
          backgroundColor: '$bgSubtle', padding: '$2', borderRadius: '$default', margin: '$2',
        }}
      >
        <Spinner />
        <div className="flex flex-grow items-center justify-between">
          <div className="font-medium text-xxs">
            {(currentJob ? backgroundJobTitles[currentJob.name as keyof typeof backgroundJobTitles] : null) ?? 'Hold on, updating...'}
            {expectedWaitTimeInSeconds >= 1 && (
              `(${expectedWaitTimeInSeconds}s remaining)`
            )}
          </div>
          <Button variant="ghost" size="small" onClick={handleCancel}>Cancel</Button>
        </div>
      </Stack>
    </div>
  );
}
