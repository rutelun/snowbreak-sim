export function inArray<T extends U, U>(
  array: ReadonlyArray<T>,
  value: U,
): value is T {
  return array.includes(value as unknown as T);
}
