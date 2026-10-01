import { act, renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { CanceledError } from '../CanceledError';
import { ProcessStepStatus } from '../ProcessStepStatus';
import { ProcessStep, useProcess } from '../useProcess';

describe('useProcess', () => {
  const mockUser = {
    userId: 1,
    name: 'Jan Six',
    accessKey: 'figma-tokens',
  };

  it('should work', async () => {
    const { result: useStateResult } = renderHook(() => useState<typeof mockUser | null>(null));

    const steps: ProcessStep<string>[] = [
      {
        key: 'fetch-user-data',
        fn: async () => {
          useStateResult.current[1](mockUser);
        },
      },
      {
        key: 'verify-user-data',
        fn: async () => {},
      },
      {
        key: 'checkout',
        fn: async () => {},
      },
    ];

    const { result: useProcessResult } = renderHook(() => useProcess(steps));
    expect(useProcessResult.current.currentStep).toEqual(null);
    expect(useProcessResult.current.currentStatus).toEqual(ProcessStepStatus.IDLE);

    await act(() => useProcessResult.current.start());
    await waitFor(() => {
      expect(useProcessResult.current.currentStep).toEqual('fetch-user-data');
      expect(useProcessResult.current.currentStatus).toEqual(ProcessStepStatus.DONE);
      expect(useProcessResult.current.isComplete).toEqual(false);
      expect(useStateResult.current[0]).toEqual(mockUser);
    });

    await act(() => useProcessResult.current.next());
    await waitFor(() => {
      expect(useProcessResult.current.currentStep).toEqual('verify-user-data');
      expect(useProcessResult.current.currentStatus).toEqual(ProcessStepStatus.DONE);
      expect(useProcessResult.current.isComplete).toEqual(false);
    });

    await act(() => useProcessResult.current.next());
    await waitFor(() => {
      expect(useProcessResult.current.currentStep).toEqual('checkout');
      expect(useProcessResult.current.currentStatus).toEqual(ProcessStepStatus.DONE);
      expect(useProcessResult.current.isComplete).toEqual(true);
    });

    act(() => useProcessResult.current.reset());
    await waitFor(() => {
      expect(useProcessResult.current.currentStep).toEqual(null);
      expect(useProcessResult.current.currentStatus).toEqual(ProcessStepStatus.IDLE);
    });
  });

  it('should error', async () => {
    const steps: ProcessStep<string>[] = [
      {
        key: 'fetch-user-data',
        fn: async () => {
          throw new Error('network error');
        },
      },
    ];

    const { result: useProcessResult } = renderHook(() => useProcess(steps));
    // Catch inside act(): when the act() callback rejects, React doesn't flush the state updates.
    let error: unknown;
    await act(async () => {
      try {
        await useProcessResult.current.start();
      } catch (err) {
        error = err;
      }
    });
    await waitFor(() => {
      expect((error as Error).message).toEqual('network error');
    });
    await waitFor(() => {
      expect(useProcessResult.current.currentStep).toEqual('fetch-user-data');
      expect(useProcessResult.current.currentStatus).toEqual(ProcessStepStatus.FAILED);
      expect(useProcessResult.current.isComplete).toEqual(false);
    });
  });

  it('should be possible to cancel a step', async () => {
    const steps: ProcessStep<string>[] = [
      {
        key: 'fetch-user-data',
        fn: async () => new Promise<void>((resolve) => {
          setTimeout(resolve, 60000);
        }),
      },
    ];

    const { result: useProcessResult } = renderHook(() => useProcess(steps));

    try {
      // Don't wait for the step inside act(): React holds back renders until an async act() settles.
      act(() => {
        useProcessResult.current.start();
      });

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          act(() => {
            useProcessResult.current.cancelToken?.cancel();
          });
          resolve();
        }, 1000);
      });
    } catch (err) {
      console.log('errr', err);
      await waitFor(() => {
        expect(err instanceof CanceledError).toBe(true);
      });
    }

    // cancel the operation after 5 seconds
    await waitFor(() => {
      expect(useProcessResult.current.currentStatus).toEqual(ProcessStepStatus.CANCELED);
    });
  });
});
