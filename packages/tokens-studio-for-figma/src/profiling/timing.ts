export type Timing = {
  start: number,
  end: number,
  time: number
};

export type TimeWrapper<T> = {
  result: T,
  timing: Timing
};
export const time = <U>(fn: () => U): TimeWrapper<U> => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  return {
    result,
    timing: {
      start,
      end,
      time: end - start,
    },

  };
};

export const timeAsync = async<U>(fn: () => U): Promise<TimeWrapper<U>> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    timing: {
      start,
      end,
      time: end - start,
    },
  };
};
