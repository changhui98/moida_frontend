import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGroup, joinGroup, leaveGroup, updateGroup, deleteGroup, kickGroupMember } from '../api/groupApi'
import { getMyProfile } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import { useHandleUnauthorized } from '../hooks/useHandleUnauthorized'
import { extractErrorMessage } from '../utils/errorUtils'
import { Navbar } from '../components/Navbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { GroupEditForm } from '../components/group/GroupEditForm'
import { GroupDetailTabs } from '../components/group/GroupDetailTabs'
import { TabMemberList } from '../components/group/TabMemberList'
import { TabPostList } from '../components/group/TabPostList'
import { TabSchedule } from '../components/group/TabSchedule'
import type { GroupTab } from '../components/group/GroupDetailTabs'
import type { GroupCategory, GroupDetailResponse } from '../types/group'
import type { UserDetailResponse } from '../types/user'
import { GROUP_CATEGORY_LABELS } from '../types/group'
import styles from './GroupDetailPage.module.css'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { token, logout } = useAuth()
  const handleUnauthorized = useHandleUnauthorized()

  const [group, setGroup] = useState<GroupDetailResponse | null>(null)
  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<GroupTab>('posts')

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
      setError(extractErrorMessage(err, '모임 정보 조회 실패'))
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
      alert(extractErrorMessage(err, '모임 가입 실패'))
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
      alert(extractErrorMessage(err, '모임 탈퇴 실패'))
      handleUnauthorized(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async (data: {
    name: string
    description: string
    category: GroupCategory
    maxMemberCount: number
  }) => {
    if (!groupId) return
    try {
      setActionLoading(true)
      await updateGroup(token, Number(groupId), data)
      setIsEditMode(false)
      await loadData()
    } catch (err) {
      alert(extractErrorMessage(err, '모임 수정 실패'))
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
      alert(extractErrorMessage(err, '모임 삭제 실패'))
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
      alert(extractErrorMessage(err, '강퇴 실패'))
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
              onClick={() => setIsEditMode(true)}
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
          <GroupEditForm
            group={group}
            actionLoading={actionLoading}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditMode(false)}
          />
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

        {/* 탭 네비게이션 */}
        <div className={styles.tabSection}>
          <GroupDetailTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'posts' && (
            <TabPostList groupId={Number(groupId)} isMember={isMember} />
          )}
          {activeTab === 'members' && (
            <TabMemberList
              members={group.members}
              isLeader={isLeader}
              actionLoading={actionLoading}
              onKick={handleKick}
            />
          )}
          {activeTab === 'schedule' && (
            <TabSchedule groupId={Number(groupId)} isLeader={isLeader} />
          )}
        </div>
      </main>
    </>
  )
}
