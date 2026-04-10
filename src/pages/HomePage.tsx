import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      const token = await signIn(form)
      login(token)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.root}>
      <section className={`card animate-scale-in ${styles.card}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <h1 className={styles.brandName}>Moida</h1>
          <p className={styles.tagline}>함께 모이는 공간</p>
        </div>

        {/* Login form */}
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="home-username">
              아이디
            </label>
            <input
              id="home-username"
              className="input"
              placeholder="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="home-password">
              비밀번호
            </label>
            <input
              id="home-password"
              className="input"
              type="password"
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
