import { useState } from 'react'
import type { GroupCategory, GroupDetailResponse } from '../../types/group'
import { GROUP_CATEGORY_LABELS } from '../../types/group'
import styles from '../../pages/GroupDetailPage.module.css'

interface GroupEditFormData {
  name: string
  description: string
  category: GroupCategory
  maxMemberCount: number
}

interface GroupEditFormProps {
  group: GroupDetailResponse
  actionLoading: boolean
  onSubmit: (data: GroupEditFormData) => void
  onCancel: () => void
}

export function GroupEditForm({ group, actionLoading, onSubmit, onCancel }: GroupEditFormProps) {
  const [editName, setEditName] = useState(group.name)
  const [editDescription, setEditDescription] = useState(group.description ?? '')
  const [editCategory, setEditCategory] = useState<GroupCategory>(group.category)
  const [editMaxMemberCount, setEditMaxMemberCount] = useState(group.maxMemberCount)

  const handleSubmit = () => {
    if (!editName.trim()) {
      alert('모임 이름을 입력해주세요.')
      return
    }
    onSubmit({
      name: editName.trim(),
      description: editDescription,
      category: editCategory,
      maxMemberCount: editMaxMemberCount,
    })
  }

  return (
    <div className={styles.editForm}>
      <input
        type="text"
        className={styles.editInput}
        placeholder="모임 이름 (최대 50자)"
        maxLength={50}
        required
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
      />
      <textarea
        className={styles.editTextarea}
        placeholder="모임 설명 (최대 1000자)"
        maxLength={1000}
        rows={4}
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
      />
      <select
        className={styles.editSelect}
        value={editCategory}
        onChange={(e) => setEditCategory(e.target.value as GroupCategory)}
      >
        {(Object.keys(GROUP_CATEGORY_LABELS) as GroupCategory[]).map((key) => (
          <option key={key} value={key}>{GROUP_CATEGORY_LABELS[key]}</option>
        ))}
      </select>
      <input
        type="number"
        className={styles.editInput}
        min={group.currentMemberCount}
        max={100}
        value={editMaxMemberCount}
        onChange={(e) => setEditMaxMemberCount(Number(e.target.value))}
      />
      <div className={styles.editButtonRow}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={actionLoading}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSubmit}
          disabled={actionLoading}
        >
          {actionLoading ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
