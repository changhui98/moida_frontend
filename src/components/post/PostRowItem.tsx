import type { ContentResponse } from '../../types/post'
import styles from './PostRowItem.module.css'

interface PostRowItemProps {
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
 * 1열(행) 형태의 글 목록 아이템.
 * - 제목 1줄, 본문 1줄 (말줄임), 우측에 작성일을 표시한다.
 * - MyPostsSection 에서 list 뷰 모드일 때 사용된다.
 */
export function PostRowItem({ post }: PostRowItemProps) {
  return (
    <article className={styles.row}>
      <div className={styles.main}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.snippet}>{post.body}</p>
      </div>
      <span className={styles.date}>{formatDate(post.createdAt)}</span>
    </article>
  )
}
