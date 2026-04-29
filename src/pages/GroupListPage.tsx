import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGroups } from '../api/groupApi'
import { useAuth } from '../context/AuthContext'
import { useHandleUnauthorized } from '../hooks/useHandleUnauthorized'
import { Navbar } from '../components/Navbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { EmptyState } from '../components/common/EmptyState'
import type { GroupResponse } from '../types/group'
import { GROUP_CATEGORY_LABELS } from '../types/group'
import styles from './GroupListPage.module.css'

const PAGE_SIZE = 12

export function GroupListPage() {
  const navigate = useNavigate()
  const { token, logout, meRole } = useAuth()
  const handleUnauthorized = useHandleUnauthorized()

  const [groups, setGroups] = useState<GroupResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadGroups = useCallback(
    async (targetPage: number) => {
      try {
        setLoading(true)
        setError('')
        const response = await getGroups(token, targetPage, PAGE_SIZE)
        setGroups(response.content)
        setTotalPages(response.totalPages)
        setPage(targetPage)
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
    loadGroups(0)
  }, [loadGroups])

  const handlePageChange = (nextPage: number) => {
    loadGroups(nextPage)
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
            <button
              key={group.id}
              type="button"
              className={styles.newGroupCard}
              onClick={() => navigate(`/app/groups/${group.id}`)}
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
                  <span className={styles.imageBadge}>
                    {group.currentMemberCount}/{group.maxMemberCount}명
                  </span>
                </div>
              </div>
              <div className={styles.newGroupInfo}>
                <p className={styles.newGroupName}>{group.name}</p>
                {group.description && (
                  <p className={styles.newGroupDesc}>{group.description}</p>
                )}
              </div>
            </button>
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
            action={{ label: '다시 시도', onClick: () => loadGroups(page) }}
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

    return (
      <>
        {renderNewGroups()}

        <div className={styles.grid}>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={styles.groupCard}
              onClick={() => navigate(`/app/groups/${group.id}`)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.categoryBadge}>
                  {GROUP_CATEGORY_LABELS[group.category]}
                </span>
              </div>
              <h3 className={styles.groupName}>{group.name}</h3>
              {group.description && (
                <p className={styles.groupDescription}>{group.description}</p>
              )}
              <div className={styles.cardFooter}>
                <span className={styles.memberCount}>
                  {group.currentMemberCount} / {group.maxMemberCount}명
                </span>
                <span className={styles.leaderName}>
                  모임장 {group.leaderNickname}
                </span>
              </div>
            </button>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationBar}>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handlePageChange(page - 1)}
              disabled={loading || page === 0}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={pageNum === page ? styles.pageButtonActive : styles.pageButton}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum + 1}
              </button>
            ))}
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handlePageChange(page + 1)}
              disabled={loading || page >= totalPages - 1}
            >
              다음
            </button>
          </div>
        )}
      </>
    )
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
