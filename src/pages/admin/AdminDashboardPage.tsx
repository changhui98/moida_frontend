import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminUsers } from '../../api/adminApi'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../context/AuthContext'
import { StatCard } from '../../components/admin/StatCard'
import { Skeleton } from '../../components/common/Skeleton'
import { getInitials } from '../../utils/stringUtils'
import type { UserResponse } from '../../types/user'
import styles from './AdminDashboardPage.module.css'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour12: false })
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const day = DAY_NAMES[date.getDay()]
  return `${y}년 ${m}월 ${d}일 (${day})`
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [recentUsers, setRecentUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true })
      }
    },
    [logout, navigate],
  )

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [countRes, recentRes] = await Promise.all([
          getAdminUsers(token, 0, 1),
          getAdminUsers(token, 0, 5),
        ])
        setTotalUsers(countRes.totalElements)
        setRecentUsers(recentRes.content)
      } catch (err) {
        handleUnauthorized(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, handleUnauthorized])

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.greeting}>관리자 대시보드</h1>
        <p className={styles.greetingSub}>Moida 서비스 현황을 한눈에 확인하세요.</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="현재 시간"
          value={formatTime(currentTime)}
          subtitle={formatDate(currentTime)}
          accent
        />
        <StatCard
          title="전체 사용자"
          value={totalUsers !== null ? `${totalUsers}명` : '-'}
          subtitle="등록된 전체 사용자 수"
          loading={loading}
          accent
        />
        <StatCard
          title="오늘의 게시글"
          value="준비 중"
          subtitle="게시글 API 연동 후 표시됩니다"
        />
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>처리해야 할 업무</h2>
        <div className={styles.taskList}>
          <Link to="/app/admin/users" className={styles.taskItem}>
            <span>신규 가입 사용자 검토</span>
            <span className={styles.taskArrow}>→</span>
          </Link>
          <Link to="/app/admin/posts" className={styles.taskItem}>
            <span>신규 게시글 검토</span>
            <span className={styles.taskArrow}>→</span>
          </Link>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>최근 가입 사용자</h2>
        {loading ? (
          <Skeleton height="200px" />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>닉네임</th>
                <th>이메일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                    사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="avatar avatar-md">
                          {getInitials(user.nickname)}
                        </span>
                        <span className="font-semibold">{user.nickname}</span>
                      </div>
                    </td>
                    <td>{user.userEmail}</td>
                    <td>
                      {user.isDeleted ? (
                        <span className={`badge ${styles.badgeDeleted}`}>탈퇴</span>
                      ) : (
                        <span className="badge badge-success">활성</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
