import styles from './AdminPostListPage.module.css'

export function AdminPostListPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>게시글 관리</h1>

      <div className={styles.placeholderCard}>
        <span className={styles.placeholderIcon}>📝</span>
        <h2 className={styles.placeholderTitle}>
          관리자 게시글 관리 기능은 백엔드 API 확인 후 구현 예정입니다.
        </h2>
        <p className={styles.placeholderDescription}>
          게시글 조회, 수정, 삭제 등의 관리 기능이 이곳에 제공될 예정입니다.
          백엔드 API가 준비되면 자동으로 연동됩니다.
        </p>
      </div>
    </div>
  )
}
