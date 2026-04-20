import styles from './EmptyState.module.css'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: EmptyStateAction
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <span className={styles.icon} aria-hidden="true">
        📭
      </span>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <button
          type="button"
          className={`btn btn-secondary btn-sm ${styles.actionButton}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
