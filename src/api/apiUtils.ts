import { ApiError } from './ApiError'

/**
 * 인증이 필요한 API 요청에 공통으로 사용하는 헤더 생성 유틸리티.
 * postApi, userApi, groupApi, imageApi 등에서 중복 정의되던 함수를 단일 모듈로 통합.
 */
export const createAuthHeaders = (token: string): HeadersInit => {
  if (!token.trim()) {
    throw new ApiError(401, '로그인이 필요합니다.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: token.trim(),
  }
}

/**
 * fetch Response를 파싱하고, 오류 시 ApiError를 throw하는 공통 유틸리티.
 */
export const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text()
    throw new ApiError(
      response.status,
      text || `Request failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}
