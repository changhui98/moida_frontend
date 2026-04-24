import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGroup, joinGroup, leaveGroup, updateGroup, deleteGroup, kickGroupMember } from '../api/groupApi'
import { getMyProfile } from '../api/userApi'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import type { GroupCategory, GroupDetailResponse } from '../types/group'
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

  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState<GroupCategory>('CLUB')
  const [editMaxMemberCount, setEditMaxMemberCount] = useState(10)

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

  const handleEditOpen = () => {
    if (!group) return
    setEditName(group.name)
    setEditDescription(group.description ?? '')
    setEditCategory(group.category)
    setEditMaxMemberCount(group.maxMemberCount)
    setIsEditMode(true)
  }

  const handleEditSubmit = async () => {
    if (!groupId || !group) return
    if (!editName.trim()) {
      alert('모임 이름을 입력해주세요.')
      return
    }
    try {
      setActionLoading(true)
      await updateGroup(token, Number(groupId), {
        name: editName.trim(),
        description: editDescription,
        category: editCategory,
        maxMemberCount: editMaxMemberCount,
      })
      setIsEditMode(false)
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : '모임 수정 실패'
      alert(message)
      handleUnauthorized(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!groupId) return
    if (!window.confirm('모임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
      setActionLoading(true)
      await deleteGroup(token, Number(groupId))
      navigate('/app/groups', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : '모임 삭제 실패'
      alert(message)
      handleUnauthorized(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleKick = async (username: string, nickname: string) => {
    if (!groupId) return
    if (!window.confirm(`${nickname}님을 강퇴하시겠습니까?`)) return
    try {
      setActionLoading(true)
      await kickGroupMember(token, Number(groupId), username)
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : '강퇴 실패'
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

        {isLeader && !isEditMode && (
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.editButton}
              onClick={handleEditOpen}
              disabled={actionLoading}
            >
              모임 수정
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDeleteGroup}
              disabled={actionLoading}
            >
              모임 삭제
            </button>
          </div>
        )}

        {isLeader && isEditMode && (
          <div className={styles.editForm}>
            <input
              type="text"
              className={styles.editInput}
              placeholder="모임 이름 (최대 50자)"
              maxLength={50}
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <textarea
              className={styles.editTextarea}
              placeholder="모임 설명 (최대 1000자)"
              maxLength={1000}
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <select
              className={styles.editSelect}
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as GroupCategory)}
            >
              {(Object.keys(GROUP_CATEGORY_LABELS) as GroupCategory[]).map((key) => (
                <option key={key} value={key}>{GROUP_CATEGORY_LABELS[key]}</option>
              ))}
            </select>
            <input
              type="number"
              className={styles.editInput}
              min={group.currentMemberCount}
              max={100}
              value={editMaxMemberCount}
              onChange={(e) => setEditMaxMemberCount(Number(e.target.value))}
            />
            <div className={styles.editButtonRow}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsEditMode(false)}
                disabled={actionLoading}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleEditSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}

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
                {isLeader && member.role !== 'LEADER' && (
                  <button
                    type="button"
                    className={styles.kickButton}
                    onClick={() => handleKick(member.username, member.nickname)}
                    disabled={actionLoading}
                  >
                    강퇴
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
