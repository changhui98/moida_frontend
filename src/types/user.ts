export interface UserResponse {
  id: string
  username: string
  nickname: string
  userEmail: string
  address: string
  isDeleted?: boolean
}

export interface UserDetailResponse {
  id: string
  username: string
  nickname: string
  userEmail: string
  address: string
  createdAt: string
  modifiedAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export interface UserUpdateRequest {
  nickname: string
  userEmail: string
  address: string
  currentPassword: string
  newPassword: string
}
