import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../api/authApi'
import { PasswordInput } from '../components/PasswordInput'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { isPasswordValid, isConfirmPasswordValid } from '../utils/passwordRules'
import styles from './SignUpPage.module.css'

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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [form, setForm] = useState({
    username: '',
    password: '',
    nickname: '',
    userEmail: '',
    address: '',
  })

  const setField =
    (key: SignUpField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      setFieldErrors({})
      await signUp(form)
      navigate('/login', { state: { signedUp: true } })
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

  const pwValid = isPasswordValid(form.password)
  const confirmValid = isConfirmPasswordValid(form.password, confirmPassword)

  // 비밀번호를 입력했을 때 → 복잡도 조건 + (확인 입력했으면) 일치 조건 모두 충족해야 제출 가능
  const canSubmit =
    form.password.length === 0 ||
    (pwValid && (confirmPassword.length === 0 || confirmValid))

  // 비밀번호 확인 입력창 테두리 색상
  const confirmBorderClass =
    confirmPassword.length === 0
      ? ''
      : confirmValid
        ? styles.pwValid
        : styles.pwInvalid

  return (
    <main className={styles.root}>
      <section className={`card animate-scale-in ${styles.card}`}>
        <Link to="/" className={styles.backLink}>
          ← 홈으로
        </Link>

        <h1 className={styles.heading}>계정 만들기</h1>
        <p className={styles.subheading}>Moida에 합류하세요</p>

        <form className="form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="input-group">
            <label className="input-label" htmlFor="su-username">
              아이디
            </label>
            <input
              id="su-username"
              className="input"
              placeholder="영문만 입력 가능"
              autoComplete="username"
              value={form.username}
              onChange={setField('username')}
            />
            {fieldErrors.username && (
              <p className="field-error">{fieldErrors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label" htmlFor="su-password">
              비밀번호
            </label>
            <PasswordInput
              id="su-password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.password}
              onChange={setField('password')}
              className={
                form.password.length > 0
                  ? pwValid
                    ? styles.pwValid
                    : styles.pwInvalid
                  : ''
              }
            />
            {fieldErrors.password && (
              <p className="field-error">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password — 비밀번호 입력 시에만 노출 */}
          {form.password.length > 0 && (
            <div className="input-group">
              <label className="input-label" htmlFor="su-confirm-password">
                비밀번호 확인
              </label>
              <PasswordInput
                id="su-confirm-password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={confirmBorderClass}
              />
            </div>
          )}

          {/* Checklist — 비밀번호 입력 시에만 노출 */}
          <PasswordChecklist password={form.password} confirmPassword={confirmPassword} />

          {/* Nickname + Email */}
          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="su-nickname">
                닉네임
              </label>
              <input
                id="su-nickname"
                className="input"
                placeholder="4~10자, 한글·영문·숫자"
                value={form.nickname}
                onChange={setField('nickname')}
              />
              {fieldErrors.nickname && (
                <p className="field-error">{fieldErrors.nickname}</p>
              )}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="su-email">
                이메일
              </label>
              <input
                id="su-email"
                className="input"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={form.userEmail}
                onChange={setField('userEmail')}
              />
              {fieldErrors.userEmail && (
                <p className="field-error">{fieldErrors.userEmail}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="input-group">
            <label className="input-label" htmlFor="su-address">
              주소
            </label>
            <input
              id="su-address"
              className="input"
              placeholder="서울시 강남구 …"
              value={form.address}
              onChange={setField('address')}
            />
            {fieldErrors.address && (
              <p className="field-error">{fieldErrors.address}</p>
            )}
          </div>

          {error && <p className="alert alert-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || !canSubmit}
          >
            {loading ? '가입 처리 중…' : '회원가입'}
          </button>
        </form>

        <p className={styles.footer}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login">로그인</Link>
        </p>
      </section>
    </main>
  )
}
