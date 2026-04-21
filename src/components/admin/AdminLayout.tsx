import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { getMyProfile } from '../../api/userApi'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { AdminSidebar } from './AdminSidebar'
import type { UserDetailResponse } from '../../types/user'
import styles from './AdminLayout.module.css'

const ADMIN_ROLE = 'ADMIN'

export function AdminLayout() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  const [profile, setProfile] = useState<UserDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

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
    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await getMyProfile(token)
        if (response.role !== ADMIN_ROLE) {
          setUnauthorized(true)
          return
        }
        setProfile(response)
      } catch (err) {
        handleUnauthorized(err)
        setUnauthorized(true)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token, handleUnauthorized])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (unauthorized) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className={styles.wrapper}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <nav className={styles.navbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/app/admin" className={styles.navBrand}>
              Moida
            </Link>
            <span className={styles.navBrandSuffix}>Admin</span>
          </div>

          <div className={styles.navRight}>
            <Link to="/app" className={styles.backLink}>
              사이트로 돌아가기
            </Link>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        </nav>

        <div className={styles.body}>
          <AdminSidebar profile={profile} />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
