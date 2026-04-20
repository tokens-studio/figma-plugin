type ReplayController = {
  getReplayId: () => string | undefined | Promise<string | undefined>;
  start: () => void | Promise<void>;
};

type GetReplaySessionIdWithRetryOptions = {
  attempts?: number;
  retryDelayMs?: number;
  startIfMissing?: boolean;
};

const DEFAULT_ATTEMPTS = 6;
const DEFAULT_RETRY_DELAY_MS = 300;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getReplayId(replayController: ReplayController) {
  return (await Promise.resolve(replayController.getReplayId())) || '';
}

export async function getReplaySessionIdWithRetry(
  replayController: ReplayController,
  options: GetReplaySessionIdWithRetryOptions = {},
) {
  const {
    attempts = DEFAULT_ATTEMPTS,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    startIfMissing = true,
  } = options;

  let replayId = await getReplayId(replayController);
  if (replayId) return replayId;

  if (startIfMissing) {
    try {
      await Promise.resolve(replayController.start());
    } catch (error) {
      // If replay start fails, keep trying to read any existing replay id.
    }
  }

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await wait(retryDelayMs);
    replayId = await getReplayId(replayController);
    if (replayId) return replayId;
  }

  return '';
}
