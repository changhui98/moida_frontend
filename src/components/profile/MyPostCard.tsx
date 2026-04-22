import type { ContentResponse } from '../../types/post'
import styles from './MyPostCard.module.css'

interface MyPostCardProps {
  post: ContentResponse
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

/**
 * 프로필 "내 글" 섹션 전용 정사각형 카드.
 * - aspect-ratio 1:1 유지 (모바일 1열 레이아웃에서는 CSS 에서 해제)
 * - 제목(2줄) + 본문 요약(남은 공간) + 작성일 하단 고정
 */
export function MyPostCard({ post }: MyPostCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.snippet}>{post.body}</p>
      <span className={styles.date}>{formatDate(post.createdAt)}</span>
    </article>
  )
}
