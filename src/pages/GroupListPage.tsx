import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGroups, getGroupLikeStatus, toggleGroupLike } from '../api/groupApi'
import { useAuth } from '../context/AuthContext'
import { useHandleUnauthorized } from '../hooks/useHandleUnauthorized'
import { Navbar } from '../components/Navbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { EmptyState } from '../components/common/EmptyState'
import type { GroupResponse } from '../types/group'
import { GROUP_CATEGORY_LABELS, GROUP_MEETING_TYPE_LABELS } from '../types/group'
import userAlt1Icon from '../assets/user-alt-1-svgrepo-com.svg'
import styles from './GroupListPage.module.css'

const PAGE_SIZE = 12

export function GroupListPage() {
  const navigate = useNavigate()
  const { token, logout, meRole } = useAuth()
  const handleUnauthorized = useHandleUnauthorized()

  const [groups, setGroups] = useState<GroupResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({})
  const [likeCountMap, setLikeCountMap] = useState<Record<number, number>>({})

  const loadGroups = useCallback(
    async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getGroups(token, 0, PAGE_SIZE)
        setGroups(response.content)

        const countMap: Record<number, number> = {}
        response.content.forEach((g) => { countMap[g.id] = g.likeCount ?? 0 })
        setLikeCountMap(countMap)

        // 각 모임의 좋아요 여부를 병렬로 조회해 likedMap 초기화
        const likeStatusResults = await Promise.allSettled(
          response.content.map((g) => getGroupLikeStatus(token, g.id)),
        )
        const likedMapInit: Record<number, boolean> = {}
        response.content.forEach((g, idx) => {
          const result = likeStatusResults[idx]
          likedMapInit[g.id] = result.status === 'fulfilled' ? result.value.liked : false
        })
        setLikedMap(likedMapInit)
      } catch (err) {
        const message = err instanceof Error ? err.message : '모임 목록 조회 실패'
        setError(message)
        handleUnauthorized(err)
      } finally {
        setLoading(false)
      }
    },
    [token, handleUnauthorized],
  )

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const handleLikeToggle = async (e: React.MouseEvent, groupId: number) => {
    e.stopPropagation()
    try {
      const res = await toggleGroupLike(token, groupId)
      setLikedMap((prev) => ({ ...prev, [groupId]: res.liked }))
      setLikeCountMap((prev) => ({ ...prev, [groupId]: res.likeCount }))
    } catch {
      // 조용히 실패
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const renderNewGroups = () => {
    const newGroups = groups.slice(0, 4)

    return (
      <section className={styles.newSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionTitle}>🐣 따끈따끈 신규 모임 &gt;</p>
            <p className={styles.sectionSubtitle}>새로 생긴 모임을 만나보세요</p>
          </div>
          <button type="button" className={styles.sectionViewAll}>
            전체 보기
          </button>
        </div>
        <div className={styles.horizontalScroll}>
          {newGroups.map((group) => (
            <div
              key={group.id}
              role="button"
              tabIndex={0}
              className={styles.newGroupCard}
              onClick={() => navigate(`/app/groups/${group.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/app/groups/${group.id}`) }}
            >
              <div className={styles.newGroupImageWrap}>
                {group.imageUrl ? (
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className={styles.newGroupImage}
                  />
                ) : (
                  <div className={styles.newGroupImagePlaceholder}>🏠</div>
                )}
                <div className={styles.imageBadges}>
                  <span className={styles.imageBadge}>
                    {GROUP_CATEGORY_LABELS[group.category]}
                  </span>
                  <span className={`${styles.imageBadge} ${group.meetingType === 'ONLINE' ? styles.imageBadgeOnline : styles.imageBadgeOffline}`}>
                    {GROUP_MEETING_TYPE_LABELS[group.meetingType]}
                  </span>
                </div>
              </div>
              <div className={styles.newGroupInfo}>
                <div className={styles.newGroupNameRow}>
                  <p className={styles.newGroupName}>{group.name}</p>
                  <div className={styles.cardMemberCount}>
                    <img src={userAlt1Icon} alt="" aria-hidden="true" className={styles.cardMemberCountIcon} />
                    <span>{group.currentMemberCount}/{group.maxMemberCount}</span>
                  </div>
                </div>
                <div className={styles.newGroupDescRow}>
                  <p className={styles.newGroupDesc}>{group.description ?? ''}</p>
                  <button
                    type="button"
                    className={`${styles.cardLikeButton} ${likedMap[group.id] ? styles.cardLikeButtonActive : ''}`}
                    onClick={(e) => handleLikeToggle(e, group.id)}
                    aria-label={likedMap[group.id] ? '좋아요 취소' : '좋아요'}
                  >
                    <span>{likedMap[group.id] ? '♥' : '♡'}</span>
                    <span>{likeCountMap[group.id] ?? 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingWrapper}>
          <LoadingSpinner />
        </div>
      )
    }

    if (error) {
      return (
        <div className="card">
          <EmptyState
            title="모임 목록을 불러올 수 없습니다."
            description={error}
            action={{ label: '다시 시도', onClick: () => loadGroups() }}
          />
        </div>
      )
    }

    if (groups.length === 0) {
      return (
        <div className={styles.emptyStateCenter}>
          <EmptyState title="등록된 모임이 없습니다." description="첫 번째 모임을 만들어보세요." />
        </div>
      )
    }

    return renderNewGroups()
  }

  return (
    <>
      <Navbar role={meRole} onLogout={handleLogout} />

      <main className={styles.main}>
        {renderContent()}
      </main>
    </>
  )
}
