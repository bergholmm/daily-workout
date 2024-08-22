import { APIError } from './APIError'

export default async function fetcher<JSON>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const info = await res.text()
    throw new APIError(res.statusText, res.status, info)
  }

  return res.json() as Promise<JSON>
}
