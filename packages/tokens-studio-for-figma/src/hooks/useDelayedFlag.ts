import { useEffect, useState } from 'react';

export function useDelayedFlag(value = false, timeout = 500, delayedOn = false, delayedOff = true) {
  const [flag, setFlag] = useState(value);

  useEffect(() => {
    if (flag !== value) {
      if (value) {
        if (delayedOn) {
          const timeoutId = setTimeout(() => setFlag(true), timeout);
          return () => clearTimeout(timeoutId);
        }
        setFlag(true);
      } else if (!value) {
        if (delayedOff) {
          const timeoutId = setTimeout(() => setFlag(false), timeout);
          return () => clearTimeout(timeoutId);
        }
        setFlag(false);
      }
    }
    return () => {};
  }, [value, timeout, delayedOn, delayedOff]);

  return flag;
}
