import * as Sentry from '@sentry/react';
import { replay, setupReplay } from './sentry';

describe('setupReplay', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('adds the configured replay integration when missing', () => {
    jest.useFakeTimers();
    const addIntegration = jest.fn();
    const getIntegration = jest.fn().mockReturnValue(undefined);
    const getClient = jest.fn().mockReturnValue({
      addIntegration,
      getIntegration,
    });

    jest.spyOn(Sentry, 'getCurrentHub').mockReturnValue({ getClient } as unknown as Sentry.Hub);

    setupReplay();
    jest.advanceTimersByTime(2000);

    expect(addIntegration).toHaveBeenCalledWith(replay);
  });

  it('does not add replay integration when already present', () => {
    jest.useFakeTimers();
    const addIntegration = jest.fn();
    const getIntegration = jest.fn().mockReturnValue(replay);
    const getClient = jest.fn().mockReturnValue({
      addIntegration,
      getIntegration,
    });

    jest.spyOn(Sentry, 'getCurrentHub').mockReturnValue({ getClient } as unknown as Sentry.Hub);

    setupReplay();
    jest.advanceTimersByTime(2000);

    expect(addIntegration).not.toHaveBeenCalled();
  });
});
