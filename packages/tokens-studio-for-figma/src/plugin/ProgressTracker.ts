import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { MessageFromPluginTypes } from '@/types/messages';
import { postToUI } from './notifiers';

export class ProgressTracker {
  private jobName: BackgroundJobs;

  private jobStart = 0;

  private totalProgress = 0;

  private lastReportedProgress = 0;

  private lastProgressReport = 0;

  constructor(name: BackgroundJobs, autoStart = true) {
    this.jobName = name;
    console.log('[PROGRESS TRACKER] Created for job:', name, 'autoStart:', autoStart);
    if (autoStart) {
      this.startJob();
    }
  }

  public startJob() {
    this.totalProgress = 0;
    this.lastReportedProgress = 0;
    this.jobStart = Date.now();
    this.lastProgressReport = Date.now();
    console.log('[PROGRESS TRACKER]', this.jobName, 'job started');
  }

  public next() {
    this.totalProgress += 1;
  }

  public reportIfNecessary() {
    const timeSinceLastReport = Date.now() - this.lastProgressReport;
    if (timeSinceLastReport > 1000) {
      const progressDelta = this.totalProgress - this.lastReportedProgress;
      const timePerTask = (Date.now() - this.jobStart) / (this.totalProgress || 1);
      console.log('[PROGRESS TRACKER]', this.jobName, 'reporting progress: total=', this.totalProgress, 'delta=', progressDelta, 'timePerTask=', timePerTask);
      postToUI({
        type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
        name: this.jobName,
        count: progressDelta,
        timePerTask,
      });
      this.lastProgressReport = Date.now();
      this.lastReportedProgress = this.totalProgress;
    }
  }
}
