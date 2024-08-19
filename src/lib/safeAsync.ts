export const safeAsync = async <T, U>(
  asyncFunc: (...args: U[]) => Promise<T>,
  ...args: U[]
): Promise<[T | null, Error | null]> => {
  try {
    const result = await asyncFunc(...args)
    return [result, null]
  } catch (error) {
    return [null, error as Error]
  }
}
