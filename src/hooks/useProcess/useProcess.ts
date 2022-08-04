import {
  useCallback, useMemo, useState,
} from 'react';
import { CanceledError } from '@/plugin/CanceledError';
import { ProcessCancelToken } from './ProcessCancelToken';
import { ProcessStepStatus } from './ProcessStepStatus';

export type ProcessStep<T extends string> = {
  key: T
  fn: (cancelToken: ProcessCancelToken) => Promise<void>
};

export function useProcess<T extends string = string>(steps: ProcessStep<T>[]) {
  const [currentStep, setCurrentStep] = useState<T | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ProcessStepStatus>(ProcessStepStatus.IDLE);
  const cancelToken = useMemo(() => new ProcessCancelToken(), []);

  const isComplete = useMemo(() => (
    steps.length
    && steps[steps.length - 1].key === currentStep
    && currentStatus === ProcessStepStatus.DONE
  ), [steps, currentStep, currentStatus]);

  const perform = useCallback(async (currentKey: string) => {
    const cleanup: (() => void)[] = [];

    try {
      setCurrentStatus(ProcessStepStatus.PENDING);
      const step = steps.find(({ key }) => key === currentKey);
      if (!step) throw new Error(`Missing step ${currentKey}`);

      await Promise.race([
        new Promise<void>((resolve, reject) => {
          cleanup.push(cancelToken.on('canceled', () => {
            reject(new CanceledError());
          }));
        }).catch((err) => {
          if (err && err instanceof CanceledError) {
            console.trace(err);
            console.error(`Operation cancelled: ${currentKey}`);
            setCurrentStatus(ProcessStepStatus.CANCELED);
          }
        }),
        await step.fn(cancelToken),
      ]);

      setCurrentStatus(ProcessStepStatus.DONE);
    } catch (err) {
      setCurrentStatus(ProcessStepStatus.FAILED);
      throw err;
    } finally {
      cleanup.forEach((fn) => fn());
    }
  }, [steps, cancelToken]);

  const start = useCallback(async () => {
    if (steps.length) {
      const { key } = steps[0];
      setCurrentStep(key);
      setCurrentStatus(ProcessStepStatus.IDLE);
      await perform(key);
    }
  }, [steps, perform]);

  const next = useCallback(async () => {
    const currentStepIndex = steps.findIndex(({ key }) => key === currentStep);
    if (currentStepIndex > -1 && currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      setCurrentStep(nextStep.key);
      setCurrentStatus(ProcessStepStatus.IDLE);
      await perform(nextStep.key);
    }
  }, [steps, perform, currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(null);
    setCurrentStatus(ProcessStepStatus.IDLE);
  }, []);

  return useMemo(() => ({
    isComplete,
    currentStep,
    currentStatus,
    start,
    next,
    reset,
    cancelToken,
  }), [
    isComplete,
    currentStep,
    currentStatus,
    start,
    next,
    reset,
    cancelToken,
  ]);
}
