import { act, renderHook } from '@testing-library/react-hooks';
import { useState } from 'react';
import { useDelayedFlag } from '../useDelayedFlag';

describe('useDelayedFlag', () => {
  it('should be able to turn on the flag immediately', async () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState(false);
      const flag = useDelayedFlag(value, 1000, false, true);
      return { flag, value, setValue };
    });
    act(() => {
      result.current.setValue(true);
    });
    expect(result.current.flag).toEqual(true);
  });

  it('should be able to turn on the flag delayed', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => {
      const [value, setValue] = useState(false);
      const flag = useDelayedFlag(value, 1000, true, true);
      return { flag, value, setValue };
    });
    act(() => {
      result.current.setValue(true);
    });
    expect(result.current.flag).toEqual(false);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.flag).toEqual(true);

    jest.useRealTimers();
  });

  it('should be able to turn off the flag immediately', async () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState(true);
      const flag = useDelayedFlag(value, 1000, false, false);
      return { flag, value, setValue };
    });
    act(() => {
      result.current.setValue(false);
    });
    expect(result.current.flag).toEqual(false);
  });

  it('should be able to turn off the flag delayed', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => {
      const [value, setValue] = useState(true);
      const flag = useDelayedFlag(value, 1000, false, true);
      return { flag, value, setValue };
    });
    act(() => {
      result.current.setValue(false);
    });
    expect(result.current.flag).toEqual(true);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.flag).toEqual(false);

    jest.useRealTimers();
  });
});
