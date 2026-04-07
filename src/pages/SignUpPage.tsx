import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../api/authApi'

export function SignUpPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '',
    password: '',
    nickname: '',
    userEmail: '',
    address: '',
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      await signUp(form)
      alert('회원가입 완료. 로그인 페이지로 이동합니다.')
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>회원가입</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="username (영문)"
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
          />
          <input
            className="input"
            type="password"
            placeholder="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="nickname"
            value={form.nickname}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nickname: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="userEmail"
            value={form.userEmail}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, userEmail: event.target.value }))
            }
          />
          <input
            className="input"
            placeholder="address"
            value={form.address}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, address: event.target.value }))
            }
          />
          <button type="submit" disabled={loading}>
            회원가입
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <p>
          이미 계정이 있다면 <Link to="/login">로그인</Link>
        </p>
      </section>
    </main>
  )
}
