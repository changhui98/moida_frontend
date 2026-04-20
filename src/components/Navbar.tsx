import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'
import { getInitials } from '../utils/stringUtils'

const ADMIN_ROLE = 'ADMIN'

interface NavbarProps {
  nickname: string | null
  role: string | null
  onLogout: () => void
}

export function Navbar({ nickname, role, onLogout }: NavbarProps) {
  const isAdmin = role === ADMIN_ROLE

  return (
    <nav className={styles.navbar}>
      <Link to="/app" className={styles.navBrand}>
        Moida
      </Link>

      <div className={styles.navRight}>
        {isAdmin && (
          <Link to="/app/admin" className={styles.navLink}>
            관리자
          </Link>
        )}

        <Link to="/app/users" className={styles.navLink}>
          사용자 목록
        </Link>

        <Link to="/app/profile" className={styles.navLink}>
          마이페이지
        </Link>

        {nickname && (
          <div className={styles.userInfo}>
            <span className="avatar avatar-md">{getInitials(nickname)}</span>
            <span className={styles.userName}>{nickname}</span>
          </div>
        )}

        <button
          type="button"
          className={styles.logoutButton}
          onClick={onLogout}
        >
          로그아웃
        </button>
      </div>
    </nav>
  )
}
