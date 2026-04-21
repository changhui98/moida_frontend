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

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden="true">
          {getInitial(post.createdBy)}
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.authorName}>@{post.createdBy}</span>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
        </div>
      </div>
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.content}>{post.body}</p>
    </article>
  )
}
