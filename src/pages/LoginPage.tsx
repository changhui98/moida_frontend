import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { PasswordInput } from '../components/PasswordInput'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      const token = await signIn(form)
      login(token)
      const nextPath = (location.state as { from?: string } | null)?.from ?? '/app'
      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.root}>
      <section className={`card animate-scale-in ${styles.card}`}>
        <Link to="/" className={styles.backLink}>
          ← 홈으로
        </Link>

        <h1 className={styles.heading}>다시 오셨군요</h1>
        <p className={styles.subheading}>계정에 로그인하세요</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-username">
              아이디
            </label>
            <input
              id="login-username"
              className="input"
              placeholder="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              비밀번호
            </label>
            <PasswordInput
              id="login-password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {error && <p className="alert alert-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '로그인 중…' : '로그인'}
          </button>
        </form>

        <p className={styles.footer}>
          아직 계정이 없으신가요?{' '}
          <Link to="/sign-up">회원가입</Link>
        </p>
      </section>
    </main>
  )
}
