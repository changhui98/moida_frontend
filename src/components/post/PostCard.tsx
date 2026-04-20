import type { PostResponse } from '../../types/post'
import { getInitials } from '../../utils/stringUtils'
import styles from './PostCard.module.css'

interface PostCardProps {
  post: PostResponse
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
      {post.category && (
        <span className={styles.categoryBadge}>{post.category}</span>
      )}
      <h3 className={styles.title}>{post.title}</h3>
      <p className={styles.content}>{post.content}</p>
      <div className={styles.divider} />
      <div className={styles.footer}>
        <div className={styles.author}>
          <span className="avatar avatar-md">
            {getInitials(post.authorNickname)}
          </span>
          <span className={styles.authorName}>{post.authorNickname}</span>
        </div>
        <div className={styles.meta}>
          <span>{formatDate(post.createdAt)}</span>
          {post.viewCount !== undefined && (
            <span>조회 {post.viewCount}</span>
          )}
        </div>
      </div>
    </article>
  )
}
