export interface ContentResponse {
  id: number
  title: string
  body: string
  createdBy: string
  createdAt: string
}

export interface AdminContentResponse {
  id: number
  title: string
  body: string
  createdBy: string
  createdAt: string
  lastModifiedBy: string | null
  lastModifiedDate: string | null
  deletedBy: string | null
  deletedDate: string | null
}

export interface CreateContentRequest {
  title: string
  body: string
}

// 하위 호환용 타입 alias
export type PostResponse = ContentResponse
