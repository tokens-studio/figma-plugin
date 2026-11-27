import { getReplaySessionIdWithRetry } from './getReplaySessionIdWithRetry';

describe('getReplaySessionIdWithRetry', () => {
  it('returns the current replay id when already available', async () => {
    const replayController = {
      getReplayId: jest.fn().mockReturnValue('replay-id-1'),
      start: jest.fn(),
    };

    const replayId = await getReplaySessionIdWithRetry(replayController);

    expect(replayId).toBe('replay-id-1');
    expect(replayController.start).not.toHaveBeenCalled();
    expect(replayController.getReplayId).toHaveBeenCalledTimes(1);
  });

  it('starts replay and retries until an id becomes available', async () => {
    const replayController = {
      getReplayId: jest
        .fn()
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('replay-id-2'),
      start: jest.fn(),
    };

    const replayId = await getReplaySessionIdWithRetry(replayController, {
      attempts: 3,
      retryDelayMs: 0,
    });

    expect(replayId).toBe('replay-id-2');
    expect(replayController.start).toHaveBeenCalledTimes(1);
    expect(replayController.getReplayId).toHaveBeenCalledTimes(3);
  });

  it('returns an empty string when no replay id is available', async () => {
    const replayController = {
      getReplayId: jest.fn().mockReturnValue(''),
      start: jest.fn(),
    };

    const replayId = await getReplaySessionIdWithRetry(replayController, {
      attempts: 2,
      retryDelayMs: 0,
    });

    expect(replayId).toBe('');
    expect(replayController.start).toHaveBeenCalledTimes(1);
    expect(replayController.getReplayId).toHaveBeenCalledTimes(3);
  });

  it('continues retrying when start throws', async () => {
    const replayController = {
      getReplayId: jest
        .fn()
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('replay-id-3'),
      start: jest.fn().mockImplementation(() => {
        throw new Error('start failed');
      }),
    };

    const replayId = await getReplaySessionIdWithRetry(replayController, {
      attempts: 3,
      retryDelayMs: 0,
    });

    expect(replayId).toBe('replay-id-3');
    expect(replayController.start).toHaveBeenCalledTimes(1);
    expect(replayController.getReplayId).toHaveBeenCalledTimes(3);
  });
});
