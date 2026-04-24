export interface ContentResponse {
  id: number
  title: string
  body: string
  createdBy: string
  nickname?: string | null
  createdAt: string
  likeCount?: number
  commentCount?: number
  likedByMe?: boolean
  tags?: string[]
}

export interface LikeToggleResponse {
  liked: boolean
  likeCount: number
}

export interface AdminContentResponse {
  id: number
  title: string
  body: string
  createdBy: string
  createdDate: string
  lastModifiedBy: string | null
  lastModifiedDate: string | null
  deletedBy: string | null
  deletedDate: string | null
}

export interface CreateContentRequest {
  title: string
  body: string
  tags?: string[]
}

// 하위 호환용 타입 alias
export type PostResponse = ContentResponse
