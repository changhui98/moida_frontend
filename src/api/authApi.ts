import type { SignInRequest, SignUpRequest } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

const toError = async (response: Response) => {
  const text = await response.text()
  return text || `Request failed: ${response.status} ${response.statusText}`
}

export const signIn = async (payload: SignInRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await toError(response))
  }

  const token = response.headers.get('Authorization') ?? ''
  if (!token) {
    throw new Error('로그인은 성공했지만 Authorization 토큰이 없습니다.')
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
    throw new Error(await toError(response))
  }

  return response.json()
}
