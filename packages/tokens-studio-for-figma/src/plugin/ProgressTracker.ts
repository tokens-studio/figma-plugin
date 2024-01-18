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
    if (autoStart) {
      this.startJob();
    }
  }

  public startJob() {
    this.totalProgress = 0;
    this.lastReportedProgress = 0;
    this.jobStart = Date.now();
    this.lastProgressReport = Date.now();
  }

  public next() {
    this.totalProgress += 1;
  }

  public reportIfNecessary() {
    if (Date.now() - this.lastProgressReport > 1000) {
      postToUI({
        type: MessageFromPluginTypes.COMPLETE_JOB_TASKS,
        name: this.jobName,
        count: this.totalProgress - this.lastReportedProgress,
        timePerTask: (Date.now() - this.jobStart) / (this.totalProgress || 1),
      });
      this.lastProgressReport = Date.now();
      this.lastReportedProgress = this.totalProgress;
    }
  }
}
