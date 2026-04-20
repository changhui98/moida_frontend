import type { ContentResponse } from '../../types/post'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: ContentResponse
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.content}>{post.body}</p>
      <div className={styles.divider} />
      <div className={styles.footer}>
        <div className={styles.author}>
          <span className={styles.authorName}>@{post.createdBy}</span>
        </div>
        <div className={styles.meta}>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </article>
  )
}
