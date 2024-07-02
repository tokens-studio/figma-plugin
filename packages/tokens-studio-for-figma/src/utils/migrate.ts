export function migrate<Input, Output>(
  input: Input | Output,
  check: (input: Input | Output) => input is Exclude<Input, Output>,
  migration: (input: Exclude<Input, Output>) => Output,
): Output {
  if (check(input)) {
    return migration(input);
  }
  return input as Output;
}
