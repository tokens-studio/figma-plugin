export type OptionalPartial<Incomplete extends boolean, T> = (
  Incomplete extends true
    ? Partial<T>
    : T
);
