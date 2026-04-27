export interface UserResponse {
  id: string
  username: string
  nickname: string
  userEmail: string
  address: string
  profileImageUrl?: string | null
  isDeleted?: boolean
  createdDate?: string | null
  modifiedDate?: string | null
}

export interface UserDetailResponse {
  id: string
  username: string
  nickname: string
  userEmail: string
  address: string
  role: string
  profileImageUrl?: string | null
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
  profileImageUrl?: string | null
}
