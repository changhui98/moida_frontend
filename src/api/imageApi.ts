import { ApiError } from './ApiError'
import { API_BASE_URL } from './config'

interface ImageUploadResponse {
  id: number
  targetType: 'USER' | 'CONTENT' | 'GROUP'
  targetId: string
  originalFilename: string
  fileUrl: string
  fileSize: number
  contentType: string
  sortOrder: number
  createdDate: string
}

export interface ImageResponse {
  id: number
  targetType: 'USER' | 'CONTENT' | 'GROUP'
  targetId: string
  originalFilename: string
  fileUrl: string
  fileSize: number
  contentType: string
  sortOrder: number
  createdDate: string
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text()
    throw new ApiError(
      response.status,
      text || `Request failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}

export const uploadContentImage = (
  token: string,
  file: File,
  contentId: number,
): Promise<ImageUploadResponse> => {
  if (!token.trim()) {
    throw new ApiError(401, '로그인이 필요합니다.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('targetType', 'CONTENT')
  formData.append('targetId', String(contentId))

  return fetch(`${API_BASE_URL}/images`, {
    method: 'POST',
    headers: {
      Authorization: token.trim(),
    },
    body: formData,
  }).then((response) => parseResponse<ImageUploadResponse>(response))
}

export const uploadUserProfileImage = (
  token: string,
  file: File,
  userId: string,
): Promise<ImageUploadResponse> => {
  if (!token.trim()) {
    throw new ApiError(401, '로그인이 필요합니다.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('targetType', 'USER')
  formData.append('targetId', userId)

  return fetch(`${API_BASE_URL}/images`, {
    method: 'POST',
    headers: {
      Authorization: token.trim(),
    },
    body: formData,
  }).then((response) => parseResponse<ImageUploadResponse>(response))
}

export const getContentImages = (token: string, contentId: number): Promise<ImageResponse[]> => {
  if (!token.trim()) {
    throw new ApiError(401, '로그인이 필요합니다.')
  }

  const params = new URLSearchParams({
    targetType: 'CONTENT',
    targetId: String(contentId),
  })

  return fetch(`${API_BASE_URL}/images?${params.toString()}`, {
    headers: {
      Authorization: token.trim(),
    },
  }).then((response) => parseResponse<ImageResponse[]>(response))
}
