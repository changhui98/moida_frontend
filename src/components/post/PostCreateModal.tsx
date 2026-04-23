import { useEffect, useState, type FormEvent } from 'react'
import { createPost } from '../../api/postApi'
import { uploadContentImage } from '../../api/imageApi'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../context/AuthContext'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { SuccessDialog } from '../common/SuccessDialog'
import { ImageBoxPicker } from './ImageBoxPicker'
import styles from './PostCreateModal.module.css'

interface PostCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function PostCreateModal({ isOpen, onClose, onCreated }: PostCreateModalProps) {
  const { token } = useAuth()
  const [body, setBody] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setBody('')
    setImages([])
    setError(null)
    setSubmitting(false)
    setConfirmOpen(false)
    setSuccessOpen(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (submitting) return
      // 확인/성공 팝업이 떠 있을 때는 해당 팝업이 먼저 처리하도록 무시
      if (confirmOpen || successOpen) return
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

  const isValid = body.trim().length > 0

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
      const createdPost = await createPost(token, { title: '', body: body.trim() })
      if (images.length > 0) {
        await Promise.all(images.map((file) => uploadContentImage(token, file, createdPost.id)))
      }
      setConfirmOpen(false)
      setSuccessOpen(true)
    } catch (err) {
      setConfirmOpen(false)
      if (err instanceof ApiError) {
        setError(err.message || '게시글 등록에 실패했습니다. 다시 시도해 주세요.')
      } else {
        setError('게시글 등록에 실패했습니다. 다시 시도해 주세요.')
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
            <textarea
              className={styles.bodyTextarea}
              placeholder="내용을 입력하세요"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={submitting}
              autoFocus
            />
            <ImageBoxPicker images={images} onChange={setImages} disabled={submitting} />
            {error && <p className={styles.errorMessage}>{error}</p>}
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="게시글 작성"
        message="게시글 작성을 하시겠습니까?"
        confirmLabel="작성"
        cancelLabel="취소"
        isLoading={submitting}
        onConfirm={handleConfirmCreate}
        onCancel={() => {
          if (!submitting) setConfirmOpen(false)
        }}
      />

      <SuccessDialog
        isOpen={successOpen}
        title="게시글이 작성되었습니다"
        message="작성하신 게시글이 목록에 등록되었어요."
        onClose={handleSuccessClose}
      />
    </>
  )
}
