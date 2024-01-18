import React from 'react';
import get from 'just-safe-get';
import { useSelector } from 'react-redux';
import {
  Box, Button, Spinner, Stack, Text,
} from '@tokens-studio/ui';
import { useDelayedFlag } from '@/hooks';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { backgroundJobsSelector, windowSizeSelector } from '@/selectors';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { formatNumber } from '@/utils/formatNumber';
// TODO : i18n needs some refactoring
export const backgroundJobTitles = {
  [BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA]: 'Finding nodes...',
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
  [BackgroundJobs.UI_ATTACHING_LOCAL_STYLES]: 'Attaching local styles to theme...',
  [BackgroundJobs.UI_CREATEVARIABLES]: 'Creating variables...',
};

export default function LoadingBar() {
  const backgroundJobs = useSelector(backgroundJobsSelector);
  const windowSize = useSelector(windowSizeSelector);

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
  const completedTasks = React.useMemo(() => backgroundJobs.reduce((total, job) => (
    total + (job.completedTasks ?? 0)
  ), 0), [backgroundJobs]);
  const totalTasks = React.useMemo(() => backgroundJobs.reduce((total, job) => (
    total + (job.totalTasks ?? 0)
  ), 0), [backgroundJobs]);

  const handleCancel = React.useCallback(() => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CANCEL_OPERATION,
    });
  }, []);

  if (!shouldShow) {
    return null;
  }

  const message = get(backgroundJobTitles, backgroundJobs[backgroundJobs.length - 1]?.name ?? '', '');

  return (
    <Box css={{ position: 'fixed', width: '100%', zIndex: 20 }} data-testid="loadingBar">
      <Stack
        direction="row"
        align="center"
        gap={2}
        css={{
          backgroundColor: !windowSize?.isMinimized ? '$bgSubtle' : 'unset', padding: '$2', borderRadius: '$small', margin: '$2',
        }}
      >
        <Spinner />
        {!windowSize?.isMinimized && (
          <Stack direction="row" align="center" justify="between" css={{ flexGrow: 1 }}>
            <Text size="xsmall" bold>
              {message || 'Hold on, updating...'}
              {completedTasks > 0 && totalTasks > 0 && (
                ` ${formatNumber(completedTasks)}/${formatNumber(totalTasks)}`
              )}
            </Text>
            <Stack direction="row" align="center" gap={1}>
              <Text size="xsmall" muted>
                {expectedWaitTimeInSeconds >= 1 && (
                  `${expectedWaitTimeInSeconds}s`
                )}
              </Text>
              <Button variant="invisible" size="small" onClick={handleCancel}>Cancel</Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
