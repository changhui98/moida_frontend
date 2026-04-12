import { RULES } from '../utils/passwordRules'
import styles from './PasswordChecklist.module.css'

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
