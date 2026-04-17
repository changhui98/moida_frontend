import type { SignInRequest, SignUpRequest } from '../types/auth'
import { ApiError } from './ApiError'
import { API_BASE_URL } from './config'

const toErrorMessage = async (response: Response): Promise<string> => {
  const text = await response.text()
  if (!text) {
    return `Request failed: ${response.status} ${response.statusText}`
  }

  try {
    const parsed = JSON.parse(text) as { message?: string }
    return parsed.message ?? text
  } catch {
    return text
  }
}

export const signIn = async (payload: SignInRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await toErrorMessage(response))
  }

  const token = response.headers.get('Authorization') ?? ''
  if (!token) {
    throw new ApiError(response.status, '로그인은 성공했지만 Authorization 토큰이 없습니다.')
  }
  return token
}

export const signUp = async (payload: SignUpRequest) => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await toErrorMessage(response))
  }

  return response.json()
}
