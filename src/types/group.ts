export type GroupCategory = 'CLUB' | 'STUDY' | 'SOCIAL'
export type GroupMemberRole = 'LEADER' | 'MEMBER'

export interface GroupResponse {
  id: number
  name: string
  description: string | null
  category: GroupCategory
  maxMemberCount: number
  currentMemberCount: number
  leaderNickname: string
  leaderUsername: string
  createdDate: string
  imageUrl: string | null
  likeCount: number
}

export interface GroupSearchParams {
  keyword?: string
  category?: GroupCategory | ''
}

export interface GroupMemberResponse {
  userId: string
  nickname: string
  username: string
  role: GroupMemberRole
  joinedAt: string
}

export interface GroupDetailResponse extends GroupResponse {
  members: GroupMemberResponse[]
}

export interface GroupCreateRequest {
  name: string
  description: string
  category: GroupCategory
  maxMemberCount: number
}

export const GROUP_CATEGORY_LABELS: Record<GroupCategory, string> = {
  CLUB: '동아리',
  STUDY: '스터디',
  SOCIAL: '소셜',
}

export interface ScheduleResponse {
  id: number
  title: string
  startAt: string
  endAt: string
  location: string | null
  description: string | null
  createdByUsername: string
  createdByNickname: string
}

export interface ScheduleCreateRequest {
  title: string
  startAt: string
  endAt: string
  location?: string
  description?: string
}

export interface PlaceSuggestionResponse {
  placeId: string
  primaryText: string
  secondaryText: string
  fullAddress: string
}
