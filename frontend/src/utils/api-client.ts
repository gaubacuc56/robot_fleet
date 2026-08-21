import { config } from '@/config/env'

export class ApiError extends Error {
  public status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface IRequestOptions {
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

function buildUrl(path: string, params: IRequestOptions['params']): string {
  const url = `${config.apiBaseUrl}${path}`
  if (!params) return url

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }

  const serialised = query.toString()
  return serialised ? `${url}?${serialised}` : url
}

export async function apiFetch<T>(
  path: string,
  options: IRequestOptions = {}
): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    signal: options.signal,
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new ApiError(
      `GET ${path} failed with ${response.status}`,
      response.status
    )
  }

  return (await response.json()) as T
}
