import { Link, useLocation } from 'react-router-dom'
import styles from './AdminSidebar.module.css'

interface MenuItem {
  path: string
  label: string
  icon: string
}

const MENU_ITEMS: readonly MenuItem[] = [
  { path: '/app/admin', label: '대시보드', icon: '📊' },
  { path: '/app/admin/users', label: '사용자 관리', icon: '👥' },
  { path: '/app/admin/posts', label: '게시글 관리', icon: '📝' },
] as const

export function AdminSidebar() {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    if (path === '/app/admin') {
      return location.pathname === '/app/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={styles.sidebar}>
      {MENU_ITEMS.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={
            isActive(item.path) ? styles.menuItemActive : styles.menuItem
          }
        >
          <span className={styles.menuIcon}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  )
}
