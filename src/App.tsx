import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import { useAuth } from './context/AuthContext'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'
import { PostListPage } from './pages/PostListPage'
import { UserGridPage } from './pages/UserGridPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminUserListPage } from './pages/admin/AdminUserListPage'
import { AdminPostListPage } from './pages/admin/AdminPostListPage'
import { PostCreatePage } from './pages/PostCreatePage'

type ThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'moida_theme_mode'

function App() {
  const { isAuthenticated } = useAuth()
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />}
        />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<PostListPage />} />
          <Route path="/app/posts/new" element={<PostCreatePage />} />
          <Route path="/app/users" element={<UserGridPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUserListPage />} />
            <Route path="posts" element={<AdminPostListPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Theme toggle */}
      <div className="theme-switcher" aria-label="theme switcher">
        <button
          type="button"
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label="테마 전환"
          className={`theme-toggle ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
          onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        >
          <span className="theme-track">
            <span className="theme-thumb">{theme === 'dark' ? '🌙' : '☀️'}</span>
          </span>
        </button>
      </div>
    </>
  )
}

export default App
