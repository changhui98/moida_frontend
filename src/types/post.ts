export interface PostResponse {
  id: string
  title: string
  content: string
  authorNickname: string
  authorUsername: string
  viewCount?: number
  createdAt: string
  category?: string
}

export interface PostDetailResponse extends PostResponse {
  modifiedAt: string
}
