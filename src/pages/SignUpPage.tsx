import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../api/authApi'

type SignUpField = 'username' | 'password' | 'nickname' | 'userEmail' | 'address'

const mapMessageToField = (message: string): SignUpField | null => {
  const normalized = message.toLowerCase()

  if (normalized.includes('username') || message.includes('회원이름')) return 'username'
  if (normalized.includes('password') || message.includes('비밀번호')) return 'password'
  if (normalized.includes('nickname') || message.includes('닉네임')) return 'nickname'
  if (normalized.includes('email') || message.includes('이메일')) return 'userEmail'
  if (normalized.includes('address') || message.includes('주소')) return 'address'

  return null
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SignUpField, string>>>({})
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
      setFieldErrors({})
      await signUp(form)
      alert('회원가입 완료. 로그인 페이지로 이동합니다.')
      navigate('/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원가입 실패'
      const field = mapMessageToField(message)

      if (field) {
        setFieldErrors({ [field]: message })
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page page-center">
      <section className="card auth-card">
        <h1>회원가입</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="username (영문)"
            value={form.username}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, username: event.target.value }))
              setFieldErrors((prev) => ({ ...prev, username: undefined }))
            }}
          />
          {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
          <input
            className="input"
            type="password"
            placeholder="password"
            value={form.password}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, password: event.target.value }))
              setFieldErrors((prev) => ({ ...prev, password: undefined }))
            }}
          />
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          <input
            className="input"
            placeholder="nickname"
            value={form.nickname}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, nickname: event.target.value }))
              setFieldErrors((prev) => ({ ...prev, nickname: undefined }))
            }}
          />
          {fieldErrors.nickname && <p className="field-error">{fieldErrors.nickname}</p>}
          <input
            className="input"
            placeholder="userEmail"
            value={form.userEmail}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, userEmail: event.target.value }))
              setFieldErrors((prev) => ({ ...prev, userEmail: undefined }))
            }}
          />
          {fieldErrors.userEmail && <p className="field-error">{fieldErrors.userEmail}</p>}
          <input
            className="input"
            placeholder="address"
            value={form.address}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, address: event.target.value }))
              setFieldErrors((prev) => ({ ...prev, address: undefined }))
            }}
          />
          {fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}
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
