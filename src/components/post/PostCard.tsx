import { useCallback, useRef, useState } from 'react'
import type { ContentResponse } from '../../types/post'
import { ApiError } from '../../api/ApiError'
import { toggleContentLike } from '../../api/postApi'
import { useAuth } from '../../context/AuthContext'
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

function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return `${Math.floor(n / 1000)}K`
}

export function PostCard({ post }: PostCardProps) {
  const { token } = useAuth()

  // 좋아요 상태의 단일 소스는 로컬 state. 초기값만 prop 에서 가져오고, 이후
  // 부모가 같은 post 객체로 재렌더 해도 낙관적 업데이트가 덮어써지지 않는다.
  // 페이지를 벗어났다가 돌아오면 PostListPage 가 unmount → remount 되며
  // PostCard 역시 새로 마운트 되어 서버의 likedByMe 값으로 자연스럽게 초기화된다.
  const [liked, setLiked] = useState(() => post.likedByMe ?? false)
  const [likeCount, setLikeCount] = useState(() => post.likeCount ?? 0)
  const [pending, setPending] = useState(false)

  // setState 는 비동기라 단순 `pending` state 만으로는 같은 tick 안에서의
  // 중복 클릭을 막을 수 없다. 동기적으로 즉시 반영되는 ref 로 in-flight 를 판정.
  const inFlightRef = useRef(false)
  // stale closure 방어: 이벤트 핸들러가 호출되는 시점의 최신 state 값을
  // 언제나 읽을 수 있도록 동기 refs 도 함께 유지.
  const likedRef = useRef(liked)
  const likeCountRef = useRef(likeCount)

  const updateLiked = useCallback((next: boolean) => {
    likedRef.current = next
    setLiked(next)
  }, [])

  const updateLikeCount = useCallback((next: number) => {
    likeCountRef.current = next
    setLikeCount(next)
  }, [])

  const handleLikeClick = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true

    const prevLiked = likedRef.current
    const prevCount = likeCountRef.current
    const nextLiked = !prevLiked
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1))

    updateLiked(nextLiked)
    updateLikeCount(nextCount)
    setPending(true)

    try {
      const res = await toggleContentLike(token, post.id)
      updateLiked(res.liked)
      updateLikeCount(res.likeCount)
    } catch (err) {
      updateLiked(prevLiked)
      updateLikeCount(prevCount)
      if (!(err instanceof ApiError)) {
        console.error('좋아요 처리 실패', err)
      }
    } finally {
      inFlightRef.current = false
      setPending(false)
    }
  }, [post.id, token, updateLiked, updateLikeCount])

  const commentCount = post.commentCount ?? 0

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

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${liked ? styles.liked : ''}`}
          onClick={handleLikeClick}
          disabled={pending}
          aria-label={liked ? '좋아요 취소' : '좋아요'}
          aria-pressed={liked}
        >
          <HeartIcon filled={liked} className={styles.icon} />
          <span className={styles.count}>{formatCount(likeCount)}</span>
        </button>

        <button
          type="button"
          className={styles.actionBtn}
          aria-label="댓글 보기"
        >
          <CommentIcon className={styles.icon} />
          <span className={styles.count}>{formatCount(commentCount)}</span>
        </button>
      </div>
    </article>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean
}

function HeartIcon({ filled = false, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      <path d="M12 20.5s-7.5-4.6-7.5-10a4.5 4.5 0 0 1 8-2.9 4.5 4.5 0 0 1 8 2.9c0 5.4-7.5 10-7.5 10h-1z" />
    </svg>
  )
}

function CommentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      <path d="M21 12a8 8 0 0 1-11.6 7.2L4 20l.9-4.2A8 8 0 1 1 21 12z" />
    </svg>
  )
}
