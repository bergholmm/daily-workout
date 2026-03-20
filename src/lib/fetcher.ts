export class APIError extends Error {
  code: number
  info: string

  constructor(message: string, code: number, info: string) {
    super(message)
    this.name = "APIError"
    this.code = code
    this.info = info
  }
}

export default async function fetcher<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const info = await res.text()
    throw new APIError(res.statusText, res.status, info)
  }

  return res.json() as Promise<T>
}
