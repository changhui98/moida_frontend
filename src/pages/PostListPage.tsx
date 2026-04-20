import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts } from '../api/postApi'
import { getMyProfile } from '../api/userApi'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../context/AuthContext'
import { Navbar } from '../components/Navbar'
import { SearchBar } from '../components/post/SearchBar'
import { PostCard } from '../components/post/PostCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Skeleton } from '../components/common/Skeleton'
import { EmptyState } from '../components/common/EmptyState'
import type { ContentResponse } from '../types/post'
import type { UserDetailResponse } from '../types/user'
import styles from './PostListPage.module.css'

const PAGE_SIZE = 12
const MAX_VISIBLE_PAGES = 5
const SKELETON_COUNT = 8

export function PostListPage() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()

  const [posts, setPosts] = useState<ContentResponse[]>([])
  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchedKeyword, setSearchedKeyword] = useState('')
  const [searchType, setSearchType] = useState<'TITLE' | 'USERNAME'>('TITLE')
  const [serviceUnavailable, setServiceUnavailable] = useState(false)

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true })
      }
    },
    [logout, navigate],
  )

  const loadPosts = useCallback(
    async (targetPage: number, search: string, type: 'TITLE' | 'USERNAME' = 'TITLE') => {
      try {
        setLoading(true)
        setServiceUnavailable(false)
        const response = await getPosts(token, targetPage, PAGE_SIZE, search, type)
        setPosts(response.content)
        setTotalPages(response.totalPages)
      } catch (err) {
        handleUnauthorized(err)
        setServiceUnavailable(true)
        setPosts([])
        setTotalPages(0)
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    },
    [token, handleUnauthorized],
  )

  const loadProfile = useCallback(async () => {
    try {
      const response = await getMyProfile(token)
      setMyProfile(response)
    } catch (err) {
      handleUnauthorized(err)
    }
  }, [token, handleUnauthorized])

  useEffect(() => {
    loadProfile()
    loadPosts(0, '')
  }, [loadProfile, loadPosts])

  const handleSearch = () => {
    setPage(0)
    setSearchedKeyword(keyword)
    loadPosts(0, keyword, searchType)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    loadPosts(nextPage, searchedKeyword, searchType)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getPageNumbers = (): number[] => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }
    const half = Math.floor(MAX_VISIBLE_PAGES / 2)
    let start = Math.max(0, page - half)
    const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES)
    if (end - start < MAX_VISIBLE_PAGES) {
      start = Math.max(0, end - MAX_VISIBLE_PAGES)
    }
    return Array.from({ length: end - start }, (_, i) => start + i)
  }

  const renderContent = () => {
    if (initialLoad) {
      return (
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton width="60px" height="20px" borderRadius="var(--r-full)" />
              <Skeleton height="20px" />
              <Skeleton height="16px" count={3} />
              <Skeleton height="1px" />
              <Skeleton height="36px" borderRadius="var(--r-full)" />
            </div>
          ))}
        </div>
      )
    }

    if (serviceUnavailable) {
      return (
        <div className="card">
          <EmptyState
            title="게시글 서비스를 준비 중입니다."
            description="곧 게시글 기능이 제공될 예정입니다. 잠시만 기다려 주세요."
          />
        </div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="card">
          <EmptyState
            title={searchedKeyword ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
            description={
              searchedKeyword
                ? `"${searchedKeyword}"에 대한 검색 결과를 찾을 수 없습니다.`
                : '아직 작성된 게시글이 없습니다.'
            }
            action={
              searchedKeyword
                ? {
                    label: '전체 목록 보기',
                    onClick: () => {
                      setKeyword('')
                      setSearchedKeyword('')
                      setSearchType('TITLE')
                      setPage(0)
                      loadPosts(0, '', 'TITLE')
                    },
                  }
                : undefined
            }
          />
        </div>
      )
    }

    return (
      <>
        <div className={styles.grid} style={{ position: 'relative' }}>
          {loading && <LoadingSpinner overlay />}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationBar}>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handlePageChange(page - 1)}
              disabled={loading || page === 0}
            >
              이전
            </button>
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={
                  pageNum === page
                    ? styles.pageButtonActive
                    : styles.pageButton
                }
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
              >
                {pageNum + 1}
              </button>
            ))}
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handlePageChange(page + 1)}
              disabled={loading || page >= totalPages - 1}
            >
              다음
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Navbar
        nickname={myProfile?.nickname ?? null}
        role={myProfile?.role ?? null}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>게시글</h1>
          <div className={styles.searchArea}>
            <select
              className={styles.searchTypeSelect}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'TITLE' | 'USERNAME')}
              disabled={loading}
              aria-label="검색 유형"
            >
              <option value="TITLE">제목</option>
              <option value="USERNAME">작성자</option>
            </select>
            <SearchBar
              value={keyword}
              onChange={setKeyword}
              onSearch={handleSearch}
              placeholder="게시글 검색..."
              disabled={loading}
            />
          </div>
        </div>

        {renderContent()}
      </main>
    </>
  )
}
