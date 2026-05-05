export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`
    try {
      const errorBody = (await response.json()) as { error?: string }
      if (errorBody.error) {
        message = errorBody.error
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<TResponse>
}
