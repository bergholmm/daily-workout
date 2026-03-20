export const safeAsync = async <T>(
  asyncFunc: Promise<T>,
): Promise<[T | null, Error | null]> => {
  try {
    const result = await asyncFunc
    return [result, null]
  } catch (error) {
    return [null, error as Error]
  }
}
