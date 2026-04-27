import styles from './KakaoAddressSearch.module.css'

interface KakaoAddressSearchProps {
  address: string
  onChange: (address: string) => void
  disabled?: boolean
  id?: string
}

export function KakaoAddressSearch({
  address,
  onChange,
  disabled = false,
  id,
}: KakaoAddressSearchProps) {
  const handleSearchClick = () => {
    if (typeof window.daum === 'undefined' || !window.daum.Postcode) {
      // 카카오 스크립트 미로드 시 fallback: 직접 입력 허용 (아무 동작 없음)
      return
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        onChange(data.roadAddress || data.address)
      },
    }).open()
  }

  const isDaumAvailable =
    typeof window !== 'undefined' &&
    typeof window.daum !== 'undefined' &&
    Boolean(window.daum?.Postcode)

  return (
    <div className={styles.wrapper}>
      <input
        id={id}
        className={`input ${styles.input}`}
        placeholder="주소 검색 후 선택하세요"
        value={address}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={isDaumAvailable}
      />
      <button
        type="button"
        className={`btn btn-secondary ${styles.searchBtn}`}
        disabled={disabled}
        onClick={handleSearchClick}
      >
        주소 검색
      </button>
    </div>
  )
}
