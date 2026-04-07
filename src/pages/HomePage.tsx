import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

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
    <main className="page page-center">
      <section className="card center home-card">
        <h1>Moida</h1>
        <div className="actions actions-col">
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
          <Link className="button-link" to="/sign-up">
            회원가입
          </Link>
          {error && <p className="error">{error}</p>}
        </div>
      </section>
    </main>
  )
}
