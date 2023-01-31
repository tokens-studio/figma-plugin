import { useEffect, useState } from 'react';

export default (callback: () => void, delay: number) => {
  const [intervalId, setIntervalId] = useState<number>();

  useEffect(() => {
    setIntervalId(setInterval(callback, delay));
    return () => clearInterval(intervalId);
  }, [callback, delay, intervalId]);
};
