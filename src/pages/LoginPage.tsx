import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

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
    <main className="page">
      <section className="card">
        <h1>로그인</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="아이디(username)"
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
          />
          <input
            className="input"
            type="password"
            placeholder="비밀번호(password)"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
          />
          <button type="submit" disabled={loading}>
            로그인
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          계정이 없다면 <Link to="/sign-up">회원가입</Link>
        </p>
      </section>
    </main>
  )
}
