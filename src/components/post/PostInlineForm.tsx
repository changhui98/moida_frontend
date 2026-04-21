import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { createPost } from '../../api/postApi'
import { useAuth } from '../../context/AuthContext'
import styles from './PostInlineForm.module.css'

interface PostInlineFormProps {
  myUsername: string | null
  onPostCreated: () => void
}

export interface PostInlineFormHandle {
  focusTitleInput: () => void
}

export const PostInlineForm = forwardRef<PostInlineFormHandle, PostInlineFormProps>(
  function PostInlineForm({ myUsername, onPostCreated }, ref) {
    const { token } = useAuth()
    const formRef = useRef<HTMLDivElement>(null)
    const titleInputRef = useRef<HTMLInputElement>(null)

    const [isExpanded, setIsExpanded] = useState(false)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isValid = title.trim().length > 0 && body.trim().length > 0

    useImperativeHandle(ref, () => ({
      focusTitleInput() {
        setIsExpanded(true)
        requestAnimationFrame(() => {
          titleInputRef.current?.focus()
        })
      },
    }))

    const resetForm = useCallback(() => {
      setTitle('')
      setBody('')
      setError(null)
      setIsExpanded(false)
    }, [])

    const handleSubmit = async () => {
      if (!isValid || submitting) return

      setSubmitting(true)
      setError(null)

      try {
        await createPost(token, { title: title.trim(), body: body.trim() })
        resetForm()
        onPostCreated()
      } catch {
        setError('게시글 등록에 실패했습니다. 다시 시도해 주세요.')
      } finally {
        setSubmitting(false)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      const relatedTarget = e.relatedTarget as Node | null
      if (relatedTarget && formRef.current?.contains(relatedTarget)) {
        return
      }

      if (!title.trim() && !body.trim()) {
        setIsExpanded(false)
        setError(null)
      }
    }

    const handleCollapsedClick = () => {
      setIsExpanded(true)
      requestAnimationFrame(() => {
        titleInputRef.current?.focus()
      })
    }

    const avatarInitial = myUsername ? myUsername.charAt(0).toUpperCase() : '?'

    if (!isExpanded) {
      return (
        <div className={styles.wrapper}>
          <div
            className={styles.collapsed}
            onClick={handleCollapsedClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCollapsedClick()
              }
            }}
          >
            <div className={styles.collapsedAvatar} aria-hidden="true">
              {avatarInitial}
            </div>
            <div className={styles.collapsedPlaceholder}>
              무슨 생각을 하고 계신가요?
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className={styles.wrapper}
        ref={formRef}
        onBlur={handleBlur}
      >
        <div className={styles.expandedForm}>
          <input
            ref={titleInputRef}
            className={styles.titleInput}
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            maxLength={200}
          />
          <textarea
            className={styles.bodyTextarea}
            placeholder="내용을 입력하세요..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={submitting}
          />
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={resetForm}
              disabled={submitting}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={!isValid || submitting}
            >
              {submitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </div>
      </div>
    )
  },
)
