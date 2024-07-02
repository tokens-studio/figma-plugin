import { createSelector } from 'reselect';
import type { RootState } from '@/app/store';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { backgroundJobsSelector } from './backgroundJobsSelector';

const backgroundJobArgSelector = (state: RootState, job: BackgroundJobs) => job;

export const isWaitingForBackgroundJobSelector = createSelector(
  backgroundJobsSelector,
  backgroundJobArgSelector,
  (jobs, name) => {
    const jobInfo = jobs.find((job) => job.name === name);
    return (
      jobInfo?.isInfinite
      || (jobInfo && (jobInfo.completedTasks ?? 0) >= (jobInfo.totalTasks ?? 0))
    ) ?? false;
  },
);
