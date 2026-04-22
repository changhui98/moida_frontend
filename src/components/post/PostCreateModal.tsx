import { useEffect, useState, type FormEvent } from 'react'
import { createPost } from '../../api/postApi'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../context/AuthContext'
import styles from './PostCreateModal.module.css'

interface PostCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function PostCreateModal({ isOpen, onClose, onCreated }: PostCreateModalProps) {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setTitle('')
    setBody('')
    setError(null)
    setSubmitting(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, submitting, onClose])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const isValid = title.trim().length > 0 && body.trim().length > 0

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await createPost(token, { title: title.trim(), body: body.trim() })
      onCreated()
      onClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || '게시글 등록에 실패했습니다. 다시 시도해 주세요.')
      } else {
        setError('게시글 등록에 실패했습니다. 다시 시도해 주세요.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        if (!submitting) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-create-modal-title"
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
          <h2 id="post-create-modal-title" className={styles.title}>
            새 게시글
          </h2>
          <button
            type="submit"
            form="post-create-modal-form"
            className={`${styles.headerBtn} ${styles.headerBtnPrimary}`}
            disabled={!isValid || submitting}
          >
            {submitting ? '게시 중…' : '게시'}
          </button>
        </header>

        <form
          id="post-create-modal-form"
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <input
            className={styles.titleInput}
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            maxLength={200}
            autoFocus
          />
          <textarea
            className={styles.bodyTextarea}
            placeholder="내용을 입력하세요"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={submitting}
          />
          {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
      </div>
    </div>
  )
}
