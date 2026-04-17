import styles from '../pages/DashboardPage.module.css'
import { getInitials } from '../utils/stringUtils'

interface NavbarProps {
  nickname: string | null
  onLogout: () => void
}

export function Navbar({ nickname, onLogout }: NavbarProps) {
  return (
    <nav className={styles.navbar}>
      <span className={styles.navBrand}>Moida</span>
      <div className={styles.navRight}>
        {nickname && (
          <div className="flex items-center gap-2">
            <span className="avatar avatar-md">{getInitials(nickname)}</span>
            <span className="text-sm font-semibold">{nickname}</span>
          </div>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </nav>
  )
}
