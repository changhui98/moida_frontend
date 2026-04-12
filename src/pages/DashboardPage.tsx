import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, getUsers, updateMyProfile } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import styles from './DashboardPage.module.css'
import type { UserDetailResponse, UserResponse } from '../types/user'
import { PasswordInput } from '../components/PasswordInput'

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [form, setForm] = useState({
    nickname: '',
    userEmail: '',
    address: '',
    currentPassword: '',
    newPassword: '',
  })

  const handleUnauthorized = (message: string) => {
    if (message.includes('401') || message.includes('403')) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const handleLoadUsers = async (targetPage = page) => {
    try {
      setLoading(true)
      setError('')
      const response = await getUsers(token, targetPage, 10)
      setUsers(response.content)
      setTotalPages(response.totalPages)
    } catch (err) {
      const message = err instanceof Error ? err.message : '사용자 목록 조회 실패'
      setError(message)
      handleUnauthorized(message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMyProfile = async () => {
    try {
      setProfileLoading(true)
      setError('')
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
      setError(message)
      handleUnauthorized(message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setProfileLoading(true)
      setError('')
      setUpdateSuccess(false)
      const response = await updateMyProfile(token, form)
      setMyProfile(response)
      setUpdateSuccess(true)
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '프로필 수정 실패'
      setError(message)
      handleUnauthorized(message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePageChange = (next: number) => {
    setPage(next)
    handleLoadUsers(next)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <span className={styles.navBrand}>Moida</span>
        <div className={styles.navRight}>
          {myProfile && (
            <div className="flex items-center gap-2">
              <span className="avatar avatar-md">{getInitials(myProfile.nickname)}</span>
              <span className="text-sm font-semibold">{myProfile.nickname}</span>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.main}>
        {error && <p className="alert alert-error">{error}</p>}

        {/* ── Users + My Profile panel ── */}
        <div className={styles.panelGrid}>
          {/* Users section */}
          <div className="card">
            <div className="header-row" style={{ marginBottom: 'var(--sp-4)' }}>
              <h2 className={styles.sectionTitle}>
                사용자 목록
                {users.length > 0 && (
                  <span className={styles.countChip}>{users.length}</span>
                )}
              </h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleLoadUsers(page)}
                disabled={loading}
              >
                {loading ? '조회 중…' : '조회'}
              </button>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>닉네임</th>
                    <th>아이디</th>
                    <th>이메일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr className={styles.emptyRow}>
                      <td colSpan={4}>조회 버튼을 눌러 사용자를 불러오세요</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="avatar avatar-md">{getInitials(user.nickname)}</span>
                            <span className={styles.tableUsername}>{user.nickname}</span>
                          </div>
                        </td>
                        <td className={styles.tableSecondary}>{user.username}</td>
                        <td className={styles.tableSecondary}>{user.userEmail}</td>
                        <td>
                          {user.isDeleted ? (
                            <span className="badge" style={{ background: 'var(--clr-error-soft)', color: 'var(--clr-error)' }}>탈퇴</span>
                          ) : (
                            <span className="badge badge-success">활성</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {users.length > 0 && (
              <div className={styles.tableFooter}>
                <span className="text-xs text-muted">페이지 {page + 1} / {totalPages || '?'}</span>
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={loading || page === 0}
                  >
                    ← 이전
                  </button>
                  <span className="page-num">{page + 1}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={loading || (totalPages > 0 && page >= totalPages - 1)}
                  >
                    다음 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* My Profile */}
          <div className="card">
            <div className="header-row" style={{ marginBottom: 'var(--sp-4)' }}>
              <h2 className={styles.sectionTitle}>내 프로필</h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLoadMyProfile}
                disabled={profileLoading}
              >
                {profileLoading ? '조회 중…' : '조회'}
              </button>
            </div>

            {myProfile ? (
              <div className={styles.profileCard}>
                <span className="avatar avatar-lg">{getInitials(myProfile.nickname)}</span>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{myProfile.nickname}</span>
                  <div className={styles.profileMeta}>
                    <span>@{myProfile.username}</span>
                    <span>{myProfile.userEmail}</span>
                  </div>
                  {myProfile.address && (
                    <span className="text-xs text-muted">{myProfile.address}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: 'var(--sp-4) 0' }}>
                조회 버튼을 눌러 프로필을 불러오세요
              </p>
            )}
          </div>
        </div>

        {/* ── Profile Edit ── */}
        <div className="card">
          <h2 className={styles.sectionTitle} style={{ marginBottom: 'var(--sp-6)' }}>
            프로필 수정
          </h2>

          <form onSubmit={handleUpdateProfile} className="form">
            <div className={styles.formGrid}>
              <div className="input-group">
                <label className="input-label" htmlFor="edit-nickname">닉네임</label>
                <input
                  id="edit-nickname"
                  className="input"
                  placeholder="새 닉네임"
                  value={form.nickname}
                  onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
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
                  onChange={(e) => setForm((prev) => ({ ...prev, userEmail: e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="edit-address">주소</label>
                <input
                  id="edit-address"
                  className="input"
                  placeholder="주소"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
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
                  onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="edit-new-pw">새 비밀번호</label>
                <PasswordInput
                  id="edit-new-pw"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
            </div>

            {updateSuccess && (
              <p className="alert alert-success">프로필이 수정되었습니다.</p>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">비밀번호 변경 시에만 입력하세요</span>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? '저장 중…' : '변경사항 저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
