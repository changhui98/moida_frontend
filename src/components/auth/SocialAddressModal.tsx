import { useState } from 'react'
import { KakaoAddressSearch } from '../common/KakaoAddressSearch'
import styles from './SocialAddressModal.module.css'

interface SocialAddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (address: string) => void
  loading?: boolean
}

export function SocialAddressModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: SocialAddressModalProps) {
  const [address, setAddress] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!address.trim()) return
    onSubmit(address.trim())
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-address-modal-title"
    >
      <div className={styles.modal}>
        <h2 id="social-address-modal-title" className={styles.title}>
          주소를 입력해주세요
        </h2>
        <p className={styles.description}>
          Moida 서비스 이용을 위해 거주 주소가 필요합니다.
        </p>

        <div className="input-group">
          <label className="input-label" htmlFor="social-address">
            주소
          </label>
          <KakaoAddressSearch
            id="social-address"
            address={address}
            onChange={setAddress}
            disabled={loading}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            나중에 입력
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !address.trim()}
          >
            {loading ? '저장 중…' : '확인'}
          </button>
        </div>
      </div>
    </div>
  )
}
