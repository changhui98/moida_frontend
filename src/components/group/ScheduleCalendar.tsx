import type { ScheduleResponse } from '../../types/group'
import styles from './ScheduleCalendar.module.css'

interface ScheduleCalendarProps {
  year: number
  month: number // 0-indexed (0 = January)
  schedules: ScheduleResponse[]
  selectedDate: string | null
  onDateSelect: (date: string) => void
  onMonthChange: (year: number, month: number) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function toDateString(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function getTodayString(): string {
  const today = new Date()
  return toDateString(today.getFullYear(), today.getMonth(), today.getDate())
}

export function ScheduleCalendar({
  year,
  month,
  schedules,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: ScheduleCalendarProps) {
  const today = getTodayString()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = getFirstDayOfWeek(year, month)

  // 일정이 있는 날짜 Set (YYYY-MM-DD)
  const scheduledDates = new Set<string>(
    schedules.map((s) => s.startAt.slice(0, 10)),
  )

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  // 앞쪽 빈 칸 (이전 달)
  const leadingBlanks = Array.from({ length: firstDayOfWeek })

  // 실제 날짜 셀
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className={styles.calendar}>
      {/* 헤더: 월 이동 */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={handlePrevMonth}
          aria-label="이전 달"
        >
          &#8249;
        </button>
        <span className={styles.monthLabel}>
          {year}년 {MONTH_NAMES[month]}
        </span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={handleNextMonth}
          aria-label="다음 달"
        >
          &#8250;
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className={styles.grid}>
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={`${styles.weekdayCell} ${idx === 0 ? styles.sunday : ''} ${idx === 6 ? styles.saturday : ''}`}
          >
            {day}
          </div>
        ))}

        {/* 이전 달 빈 칸 */}
        {leadingBlanks.map((_, idx) => (
          <div key={`blank-${idx}`} className={styles.emptyCell} />
        ))}

        {/* 날짜 셀 */}
        {dayCells.map((day) => {
          const dateStr = toDateString(year, month, day)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const hasSchedule = scheduledDates.has(dateStr)
          const dayOfWeek = (firstDayOfWeek + day - 1) % 7

          return (
            <button
              key={day}
              type="button"
              className={[
                styles.dayCell,
                isToday ? styles.today : '',
                isSelected ? styles.selected : '',
                dayOfWeek === 0 ? styles.sunday : '',
                dayOfWeek === 6 ? styles.saturday : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onDateSelect(dateStr)}
              aria-label={`${year}년 ${month + 1}월 ${day}일${hasSchedule ? ' (일정 있음)' : ''}`}
              aria-pressed={isSelected}
            >
              <span className={styles.dayNumber}>{day}</span>
              {hasSchedule && <span className={styles.dot} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
