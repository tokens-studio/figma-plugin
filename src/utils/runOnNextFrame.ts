export function runOnNextFrame(fn: () => Promise<void>) {
  return new Promise<void>((res) => {
    setTimeout(async () => {
      await fn();
      res();
    }, 0);
  });
}
