import { useEffect, useState, type FormEvent } from 'react'
import { createGroupSchedule } from '../../api/groupApi'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../context/AuthContext'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { SuccessDialog } from '../common/SuccessDialog'
import styles from './ScheduleCreateModal.module.css'

interface ScheduleCreateModalProps {
  isOpen: boolean
  groupId: number
  onClose: () => void
  onCreated: () => void
}

interface ScheduleFormState {
  title: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  description: string
}

const INITIAL_FORM: ScheduleFormState = {
  title: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  location: '',
  description: '',
}

export function ScheduleCreateModal({ isOpen, groupId, onClose, onCreated }: ScheduleCreateModalProps) {
  const { token } = useAuth()
  const [form, setForm] = useState<ScheduleFormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setForm(INITIAL_FORM)
    setError(null)
    setSubmitting(false)
    setConfirmOpen(false)
    setSuccessOpen(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (submitting || confirmOpen || successOpen) return
      onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, submitting, confirmOpen, successOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const isValid =
    form.title.trim().length > 0 &&
    form.startDate !== '' &&
    form.startTime !== '' &&
    form.endDate !== '' &&
    form.endTime !== '' &&
    new Date(`${form.endDate}T${form.endTime}`) > new Date(`${form.startDate}T${form.startTime}`)

  const handleChange = (field: keyof ScheduleFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setError(null)
    setConfirmOpen(true)
  }

  const handleConfirmCreate = async () => {
    if (!isValid || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await createGroupSchedule(token, groupId, {
        title: form.title.trim(),
        startAt: `${form.startDate}T${form.startTime}:00`,
        endAt: `${form.endDate}T${form.endTime}:00`,
        location: form.location.trim() || undefined,
        description: form.description.trim() || undefined,
      })
      setConfirmOpen(false)
      setSuccessOpen(true)
    } catch (err) {
      setConfirmOpen(false)
      if (err instanceof ApiError) {
        setError(err.message || '일정 등록에 실패했습니다. 다시 시도해 주세요.')
      } else {
        setError('일정 등록에 실패했습니다. 다시 시도해 주세요.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setSuccessOpen(false)
    onCreated()
    onClose()
  }

  return (
    <>
      <div
        className={styles.overlay}
        onClick={() => {
          if (submitting || confirmOpen || successOpen) return
          onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-create-modal-title"
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <header className={styles.header}>
            <button
              type="button"
              className={styles.headerBtn}
              onClick={onClose}
              disabled={submitting}
            >
              취소
            </button>
            <h2 id="schedule-create-modal-title" className={styles.title}>
              일정 등록
            </h2>
            <button
              type="submit"
              form="schedule-create-modal-form"
              className={`${styles.headerBtn} ${styles.headerBtnPrimary}`}
              disabled={!isValid || submitting}
            >
              {submitting ? '등록 중…' : '등록'}
            </button>
          </header>

          <form
            id="schedule-create-modal-form"
            className={styles.form}
            onSubmit={handleSubmit}
          >
            {/* 제목 */}
            <div className={styles.fieldGroup}>
              <label htmlFor="schedule-title" className={styles.label}>
                제목 <span className={styles.required}>*</span>
              </label>
              <input
                id="schedule-title"
                type="text"
                className={styles.input}
                placeholder="일정 제목을 입력하세요"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={submitting}
                autoFocus
                maxLength={100}
              />
            </div>

            {/* 시작 일시 */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label htmlFor="schedule-start-date" className={styles.label}>
                  시작 날짜 <span className={styles.required}>*</span>
                </label>
                <input
                  id="schedule-start-date"
                  type="date"
                  className={styles.input}
                  value={form.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="schedule-start-time" className={styles.label}>
                  시작 시간 <span className={styles.required}>*</span>
                </label>
                <input
                  id="schedule-start-time"
                  type="time"
                  className={styles.input}
                  value={form.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* 종료 일시 */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label htmlFor="schedule-end-date" className={styles.label}>
                  종료 날짜 <span className={styles.required}>*</span>
                </label>
                <input
                  id="schedule-end-date"
                  type="date"
                  className={styles.input}
                  value={form.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="schedule-end-time" className={styles.label}>
                  종료 시간 <span className={styles.required}>*</span>
                </label>
                <input
                  id="schedule-end-time"
                  type="time"
                  className={styles.input}
                  value={form.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* 시간 유효성 경고 */}
            {form.startDate && form.startTime && form.endDate && form.endTime &&
              new Date(`${form.endDate}T${form.endTime}`) <= new Date(`${form.startDate}T${form.startTime}`) && (
                <p className={styles.validationError}>종료 시간은 시작 시간보다 늦어야 합니다.</p>
              )}

            {/* 장소 */}
            <div className={styles.fieldGroup}>
              <label htmlFor="schedule-location" className={styles.label}>
                장소
              </label>
              <input
                id="schedule-location"
                type="text"
                className={styles.input}
                placeholder="장소를 입력하세요 (선택)"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={submitting}
                maxLength={200}
              />
            </div>

            {/* 설명 */}
            <div className={styles.fieldGroup}>
              <label htmlFor="schedule-description" className={styles.label}>
                설명
              </label>
              <textarea
                id="schedule-description"
                className={styles.textarea}
                placeholder="일정 설명을 입력하세요 (선택)"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={submitting}
                rows={3}
                maxLength={500}
              />
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="일정 등록"
        message="일정을 등록하시겠습니까?"
        confirmLabel="등록"
        cancelLabel="취소"
        isLoading={submitting}
        onConfirm={handleConfirmCreate}
        onCancel={() => {
          if (!submitting) setConfirmOpen(false)
        }}
      />

      <SuccessDialog
        isOpen={successOpen}
        title="일정이 등록되었습니다"
        message="새 일정이 캘린더에 추가되었어요."
        onClose={handleSuccessClose}
      />
    </>
  )
}
