import type { ScheduleResponse } from '../../types/group'
import styles from './ScheduleEventCard.module.css'

interface ScheduleEventCardProps {
  schedule: ScheduleResponse
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function ScheduleEventCard({ schedule }: ScheduleEventCardProps) {
  const startTime = formatTime(schedule.startAt)
  const endTime = formatTime(schedule.endAt)

  return (
    <div className={styles.card}>
      <div className={styles.accentBar} />
      <div className={styles.content}>
        <p className={styles.title}>{schedule.title}</p>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>🕐</span>
            {startTime} ~ {endTime}
          </span>
          {schedule.location && (
            <span className={styles.metaItem}>
              <span className={styles.metaIcon}>📍</span>
              {schedule.location}
            </span>
          )}
        </div>
        {schedule.description && (
          <p className={styles.description}>{schedule.description}</p>
        )}
      </div>
    </div>
  )
}
