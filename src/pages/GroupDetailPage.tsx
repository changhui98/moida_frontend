import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGroup, joinGroup, leaveGroup } from '../api/groupApi'
import { getMyProfile } from '../api/userApi'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import type { GroupDetailResponse } from '../types/group'
import type { UserDetailResponse } from '../types/user'
import { GROUP_CATEGORY_LABELS } from '../types/group'
import styles from './GroupDetailPage.module.css'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  const [group, setGroup] = useState<GroupDetailResponse | null>(null)
  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true })
      }
    },
    [logout, navigate],
  )

  const loadData = useCallback(async () => {
    if (!groupId) return
    try {
      setLoading(true)
      setError('')
      const [groupData, profileData] = await Promise.all([
        getGroup(token, Number(groupId)),
        getMyProfile(token),
      ])
      setGroup(groupData)
      setMyProfile(profileData)
    } catch (err) {
      const message = err instanceof Error ? err.message : '모임 정보 조회 실패'
      setError(message)
      handleUnauthorized(err)
    } finally {
      setLoading(false)
    }
  }, [token, groupId, handleUnauthorized])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isMember = group?.members.some((m) => m.username === myProfile?.username) ?? false
  const isLeader = myProfile?.username === group?.leaderUsername

  const handleJoin = async () => {
    if (!groupId) return
    try {
      setActionLoading(true)
      await joinGroup(token, Number(groupId))
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : '모임 가입 실패'
      alert(message)
      handleUnauthorized(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!groupId) return
    if (!window.confirm('모임에서 탈퇴하시겠습니까?')) return
    try {
      setActionLoading(true)
      await leaveGroup(token, Number(groupId))
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : '모임 탈퇴 실패'
      alert(message)
      handleUnauthorized(err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar role={myProfile?.role ?? null} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.loadingWrapper}>
            <LoadingSpinner />
          </div>
        </main>
      </>
    )
  }

  if (error || !group) {
    return (
      <>
        <Navbar role={myProfile?.role ?? null} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.errorWrapper}>
            <p className={styles.errorText}>{error || '모임을 찾을 수 없습니다.'}</p>
            <button type="button" className={styles.backButton} onClick={() => navigate('/app/groups')}>
              목록으로 돌아가기
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar role={myProfile?.role ?? null} onLogout={handleLogout} />

      <main className={styles.main}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/app/groups')}
        >
          &larr; 모임 목록
        </button>

        <div className={styles.groupHeader}>
          <div className={styles.groupHeaderLeft}>
            <span className={styles.categoryBadge}>
              {GROUP_CATEGORY_LABELS[group.category]}
            </span>
            <h1 className={styles.groupName}>{group.name}</h1>
            {group.description && (
              <p className={styles.groupDescription}>{group.description}</p>
            )}
          </div>
          <div className={styles.groupHeaderRight}>
            <div className={styles.memberCountBox}>
              <span className={styles.memberCountLabel}>인원</span>
              <span className={styles.memberCountValue}>
                {group.currentMemberCount} / {group.maxMemberCount}
              </span>
            </div>
            <p className={styles.leaderName}>모임장: {group.leaderNickname}</p>
          </div>
        </div>

        {!isLeader && (
          <div className={styles.actionRow}>
            {isMember ? (
              <button
                type="button"
                className={styles.leaveButton}
                onClick={handleLeave}
                disabled={actionLoading}
              >
                {actionLoading ? '처리 중...' : '모임 탈퇴'}
              </button>
            ) : (
              <button
                type="button"
                className={styles.joinButton}
                onClick={handleJoin}
                disabled={actionLoading || group.currentMemberCount >= group.maxMemberCount}
              >
                {actionLoading
                  ? '처리 중...'
                  : group.currentMemberCount >= group.maxMemberCount
                    ? '정원 초과'
                    : '모임 가입'}
              </button>
            )}
          </div>
        )}

        <section className={styles.membersSection}>
          <h2 className={styles.sectionTitle}>멤버 ({group.members.length})</h2>
          <ul className={styles.memberList}>
            {group.members.map((member) => (
              <li key={member.userId} className={styles.memberItem}>
                <span className={`avatar ${styles.memberAvatar}`}>
                  {member.nickname.charAt(0).toUpperCase()}
                </span>
                <div className={styles.memberInfo}>
                  <span className={styles.memberNickname}>{member.nickname}</span>
                  <span className={styles.memberUsername}>@{member.username}</span>
                </div>
                {member.role === 'LEADER' && (
                  <span className={styles.leaderBadge}>모임장</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
