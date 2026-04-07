import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, getUsers, updateMyProfile } from '../api/userApi'
import { useAuth } from '../context/AuthContext'
import type { UserDetailResponse, UserResponse } from '../types/user'

export function DashboardPage() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  const handleLoadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getUsers(token, page, 10)
      setUsers(response.content)
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
      setLoading(true)
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
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      const response = await updateMyProfile(token, form)
      setMyProfile(response)
      alert('프로필 수정 완료')
    } catch (err) {
      const message = err instanceof Error ? err.message : '프로필 수정 실패'
      setError(message)
      handleUnauthorized(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <div className="header-row">
          <h1>로그인 사용자 페이지</h1>
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            로그아웃
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>사용자 API</h2>
        <div className="actions">
          <button onClick={handleLoadUsers} disabled={loading}>
            users 조회
          </button>
          <button onClick={handleLoadMyProfile} disabled={loading}>
            my profile 조회
          </button>
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={loading || page === 0}
          >
            이전 페이지
          </button>
          <button onClick={() => setPage((prev) => prev + 1)} disabled={loading}>
            다음 페이지
          </button>
        </div>
        <p className="meta">현재 페이지: {page}</p>

        <div className="grid">
          <div>
            <h3>Users</h3>
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  <strong>{user.nickname}</strong> ({user.username}) - {user.userEmail}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>My Profile</h3>
            {myProfile ? (
              <pre>{JSON.stringify(myProfile, null, 2)}</pre>
            ) : (
              <p>아직 조회된 프로필이 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>내 프로필 수정</h2>
        <form onSubmit={handleUpdateProfile} className="form">
          <input
            className="input"
            placeholder="nickname"
            value={form.nickname}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nickname: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="userEmail"
            value={form.userEmail}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, userEmail: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="address"
            value={form.address}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, address: event.target.value }))
            }
          />
          <input
            className="input"
            type="password"
            placeholder="currentPassword"
            value={form.currentPassword}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
          />
          <input
            className="input"
            type="password"
            placeholder="newPassword"
            value={form.newPassword}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, newPassword: event.target.value }))
            }
          />
          <button type="submit" disabled={loading}>
            프로필 수정 요청
          </button>
        </form>
      </section>
    </main>
  )
}
