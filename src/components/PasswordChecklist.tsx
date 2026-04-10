import styles from './PasswordChecklist.module.css'

interface Rule {
  label: string
  test: (pw: string) => boolean
}

const RULES: Rule[] = [
  { label: '8자 이상', test: (pw) => pw.length >= 8 },
  { label: '소문자 포함', test: (pw) => /[a-z]/.test(pw) },
  { label: '대문자 포함', test: (pw) => /[A-Z]/.test(pw) },
  { label: '특수문자 포함', test: (pw) => /[!@#$%^&*()_+\-={}\[\]:;"'<>,.?/]/.test(pw) },
]

interface Props {
  password: string
}

export function PasswordChecklist({ password }: Props) {
  if (password.length === 0) return null

  return (
    <div className={styles.root} role="status" aria-live="polite">
      <ul className={styles.list}>
        {RULES.map(({ label, test }) => {
          const met = test(password)
          return (
            <li key={label} className={`${styles.rule} ${met ? styles.met : styles.unmet}`}>
              <span className={`${styles.icon} ${met ? styles.iconMet : styles.iconUnmet}`}>
                {met ? '✓' : '·'}
              </span>
              {label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Returns true only if all password rules pass */
export function isPasswordValid(password: string): boolean {
  return RULES.every(({ test }) => test(password))
}
