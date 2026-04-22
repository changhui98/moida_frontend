import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile } from '../api/userApi'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../context/AuthContext'
import { usePostCreatedSubscription } from '../context/PostCreateModalContext'
import { Navbar } from '../components/Navbar'
import { ProfileEditModal } from '../components/profile/ProfileEditModal'
import {
  MyPostsSection,
  type MyPostsSectionHandle,
} from '../components/profile/MyPostsSection'
import { getInitials } from '../utils/stringUtils'
import styles from './ProfilePage.module.css'
import type { UserDetailResponse } from '../types/user'

const ADMIN_ROLE = 'ADMIN'

const formatJoinDate = (value: string | null | undefined): string => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const myPostsRef = useRef<MyPostsSectionHandle | null>(null)

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true })
      }
    },
    [logout, navigate],
  )

  const loadProfile = useCallback(async () => {
    try {
      setProfileLoading(true)
      setProfileError('')
      const response = await getMyProfile(token)
      setMyProfile(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : '내 프로필 조회 실패'
      setProfileError(message)
      handleUnauthorized(err)
    } finally {
      setProfileLoading(false)
    }
  }, [token, handleUnauthorized])

  const handleProfileSaved = (updated: UserDetailResponse) => {
    setMyProfile(updated)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // 새 글 작성 플로우가 완료되면 내 글 목록을 최신화한다.
  usePostCreatedSubscription(
    useCallback(() => {
      myPostsRef.current?.refresh()
    }, []),
  )

  const isAdmin = myProfile?.role === ADMIN_ROLE

  return (
    <>
      <Navbar role={myProfile?.role ?? null} onLogout={handleLogout} />

      <main className={styles.main}>
        {profileError && (
          <p className="alert alert-error" role="alert">{profileError}</p>
        )}

        {/* ── 공개 프로필 헤더 ── */}
        <section className={styles.profileHeader} aria-label="내 프로필">
          <div className={styles.avatarWrap}>
            <span className={`avatar ${styles.avatarLg}`}>
              {myProfile ? getInitials(myProfile.nickname) : '··'}
            </span>
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.displayName}>
                {myProfile?.nickname ?? '\u00A0'}
              </h1>
              {isAdmin && (
                <span className={styles.roleBadge}>ADMIN</span>
              )}
            </div>

            {myProfile && (
              <p className={styles.handle}>@{myProfile.username}</p>
            )}

            <p className={styles.meta}>
              {myProfile
                ? `${formatJoinDate(myProfile.createdAt)} 가입`
                : profileLoading
                  ? '불러오는 중…'
                  : ''}
            </p>
          </div>
        </section>

        {/* ── 액션 버튼 ── */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.editButton}
            onClick={() => setEditOpen(true)}
            disabled={!myProfile || profileLoading}
          >
            프로필 편집
          </button>
        </div>

        {/* ── 내가 작성한 글 ── */}
        <MyPostsSection ref={myPostsRef} onUnauthorized={handleUnauthorized} />
      </main>

      <ProfileEditModal
        isOpen={editOpen}
        profile={myProfile}
        onClose={() => setEditOpen(false)}
        onSaved={handleProfileSaved}
        onUnauthorized={handleUnauthorized}
      />
    </>
  )
}
