import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, updateMyProfile } from '../api/userApi'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import { PasswordInput } from '../components/PasswordInput'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { isPasswordValid } from '../utils/passwordRules'
import { getInitials } from '../utils/stringUtils'
import styles from './ProfilePage.module.css'
import type { UserDetailResponse } from '../types/user'

const ADMIN_ROLE = 'ADMIN'

export function ProfilePage() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [newPwValid, setNewPwValid] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    nickname: '',
    userEmail: '',
    address: '',
    currentPassword: '',
    newPassword: '',
  })

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
      setForm((prev) => ({
        ...prev,
        nickname: response.nickname ?? '',
        userEmail: response.userEmail ?? '',
        address: response.address ?? '',
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '내 프로필 조회 실패'
      setProfileError(message)
      handleUnauthorized(err)
    } finally {
      setProfileLoading(false)
    }
  }, [token, handleUnauthorized])

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setShowConfirm(true)
  }

  const handleUpdateProfile = async () => {
    try {
      setProfileLoading(true)
      setUpdateError('')
      setUpdateSuccess(false)
      const response = await updateMyProfile(token, form)
      setMyProfile(response)
      setUpdateSuccess(true)
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }))
      setShowConfirm(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : '프로필 수정 실패'
      setUpdateError(message)
      handleUnauthorized(err)
      setShowConfirm(false)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    setNewPwValid(isPasswordValid(form.newPassword))
  }, [form.newPassword])

  useEffect(() => {
    if (!updateSuccess) return
    const timer = setTimeout(() => setUpdateSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [updateSuccess])

  const roleBadge = myProfile?.role === ADMIN_ROLE
    ? { label: 'ADMIN', className: styles.badgeSuccess }
    : { label: 'USER', className: styles.badgeAccent }

  return (
    <>
      <Navbar
        nickname={myProfile?.nickname ?? null}
        role={myProfile?.role ?? null}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>마이페이지</h1>

        {profileError && (
          <p className="alert alert-error" role="alert">{profileError}</p>
        )}

        {/* 프로필 정보 */}
        <div className="card">
          <div className={`header-row ${styles.mb4}`}>
            <h2 className={styles.sectionTitle}>내 프로필</h2>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadProfile}
              disabled={profileLoading}
            >
              {profileLoading ? '조회 중...' : '새로고침'}
            </button>
          </div>

          {myProfile ? (
            <>
              <div className={styles.profileCard}>
                <span className="avatar avatar-lg">
                  {getInitials(myProfile.nickname)}
                </span>
                <div className={styles.profileInfo}>
                  <div className={styles.profileNameRow}>
                    <span className={styles.profileName}>{myProfile.nickname}</span>
                    <span className={roleBadge.className}>{roleBadge.label}</span>
                  </div>
                  <div className={styles.profileMeta}>
                    <span>@{myProfile.username}</span>
                    <span>{myProfile.userEmail}</span>
                  </div>
                  {myProfile.address && (
                    <span className="text-xs text-muted">{myProfile.address}</span>
                  )}
                </div>
              </div>

              <div className={styles.detailList}>
                <span className={styles.detailLabel}>아이디</span>
                <span className={styles.detailValue}>{myProfile.username}</span>
                <span className={styles.detailLabel}>이메일</span>
                <span className={styles.detailValue}>{myProfile.userEmail}</span>
                <span className={styles.detailLabel}>주소</span>
                <span className={styles.detailValue}>
                  {myProfile.address || '-'}
                </span>
                <span className={styles.detailLabel}>가입일</span>
                <span className={styles.detailValue}>
                  {new Date(myProfile.createdAt).toLocaleDateString('ko-KR')}
                </span>
                <span className={styles.detailLabel}>수정일</span>
                <span className={styles.detailValue}>
                  {new Date(myProfile.modifiedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </>
          ) : (
            !profileLoading && (
              <p className="text-muted text-sm" style={{ padding: 'var(--sp-4) 0' }}>
                프로필 정보를 불러올 수 없습니다.
              </p>
            )
          )}
        </div>

        {/* 프로필 수정 */}
        <div className="card">
          <h2 className={`${styles.sectionTitle} ${styles.mb6}`}>프로필 수정</h2>

          <form onSubmit={handleFormSubmit} className="form">
            <div className={styles.formGrid}>
              <div className="input-group">
                <label className="input-label" htmlFor="edit-nickname">닉네임</label>
                <input
                  id="edit-nickname"
                  className="input"
                  placeholder="새 닉네임"
                  value={form.nickname}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nickname: e.target.value }))
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="edit-email">이메일</label>
                <input
                  id="edit-email"
                  className="input"
                  type="email"
                  placeholder="name@example.com"
                  value={form.userEmail}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, userEmail: e.target.value }))
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="edit-address">주소</label>
                <input
                  id="edit-address"
                  className="input"
                  placeholder="주소"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>

              <div />

              <div className="input-group">
                <label className="input-label" htmlFor="edit-cur-pw">현재 비밀번호</label>
                <PasswordInput
                  id="edit-cur-pw"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="edit-new-pw">새 비밀번호</label>
                <PasswordInput
                  id="edit-new-pw"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className={
                    form.newPassword.length > 0
                      ? newPwValid ? styles.pwValid : styles.pwInvalid
                      : undefined
                  }
                />
              </div>
            </div>

            {form.newPassword.length > 0 && (
              <PasswordChecklist password={form.newPassword} />
            )}

            {updateError && (
              <p className="alert alert-error" role="alert">{updateError}</p>
            )}

            {updateSuccess && (
              <p className="alert alert-success" role="status">
                프로필이 수정되었습니다.
              </p>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">비밀번호 변경 시에만 입력하세요</span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showConfirm}
        title="프로필 수정"
        message="프로필 정보를 수정하시겠습니까?"
        confirmLabel="수정"
        confirmVariant="primary"
        isLoading={profileLoading}
        onConfirm={handleUpdateProfile}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
