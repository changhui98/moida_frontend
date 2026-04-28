import type { ScheduleResponse } from '../../types/group'
import { ScheduleEventCard } from './ScheduleEventCard'
import styles from './ScheduleEventList.module.css'

interface ScheduleEventListProps {
  selectedDate: string | null
  schedules: ScheduleResponse[]
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

export function ScheduleEventList({ selectedDate, schedules }: ScheduleEventListProps) {
  if (!selectedDate) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>날짜를 선택하면 일정을 확인할 수 있습니다.</p>
      </div>
    )
  }

  const daySchedules = schedules.filter((s) => s.startAt.startsWith(selectedDate))

  return (
    <div className={styles.listWrapper}>
      <h3 className={styles.dateTitle}>{formatDisplayDate(selectedDate)}</h3>
      {daySchedules.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>이 날의 일정이 없습니다.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {daySchedules.map((schedule) => (
            <li key={schedule.id}>
              <ScheduleEventCard schedule={schedule} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
