export function inArray<T, U>(
  array: ReadonlyArray<T>,
  value: U,
): value is T extends U ? T : never {
  return array.includes(value as unknown as T);
}
