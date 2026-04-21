import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile } from '../api/userApi'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../context/AuthContext'
import { useInfinitePostList } from '../hooks/useInfinitePostList'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import { Navbar } from '../components/Navbar'
import { SearchBar } from '../components/post/SearchBar'
import { PostCard } from '../components/post/PostCard'
import {
  PostInlineForm,
  type PostInlineFormHandle,
} from '../components/post/PostInlineForm'
import { InfiniteScrollLoader } from '../components/post/InfiniteScrollLoader'
import { EndOfList } from '../components/post/EndOfList'
import { Skeleton } from '../components/common/Skeleton'
import { EmptyState } from '../components/common/EmptyState'
import type { UserDetailResponse } from '../types/user'
import styles from './PostListPage.module.css'

const SKELETON_COUNT = 8

export function PostListPage() {
  const navigate = useNavigate()
  const { token, logout } = useAuth()
  const inlineFormRef = useRef<PostInlineFormHandle>(null)

  const [myProfile, setMyProfile] = useState<UserDetailResponse | null>(null)
  const [keyword, setKeyword] = useState('')
  const [searchedKeyword, setSearchedKeyword] = useState('')
  const [searchType, setSearchType] = useState<'TITLE' | 'USERNAME'>('TITLE')

  const {
    posts,
    loading,
    isFetchingMore,
    hasMore,
    serviceUnavailable,
    error,
    search,
    retry,
    loadMore,
    resetAndRefresh,
  } = useInfinitePostList()

  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '0px 0px 200px 0px',
  })

  useEffect(() => {
    if (isIntersecting && hasMore && !isFetchingMore && !loading) {
      loadMore()
    }
  }, [isIntersecting, hasMore, isFetchingMore, loading, loadMore])

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout()
        navigate('/login', { replace: true })
      }
    },
    [logout, navigate],
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
  }, [loadProfile])

  const handleSearch = () => {
    setSearchedKeyword(keyword)
    search(keyword, searchType)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handlePostCreated = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setKeyword('')
    setSearchedKeyword('')
    setSearchType('TITLE')
    resetAndRefresh()
  }

  const renderContent = () => {
    if (loading && posts.length === 0) {
      return (
        <div className={styles.feed}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton width="60px" height="20px" borderRadius="var(--r-full)" />
              <Skeleton height="20px" />
              <Skeleton height="16px" count={3} />
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
                : '아직 작성된 게시글이 없습니다. 첫 번째 게시글을 작성해 보세요!'
            }
            action={
              searchedKeyword
                ? {
                    label: '전체 목록 보기',
                    onClick: () => {
                      setKeyword('')
                      setSearchedKeyword('')
                      setSearchType('TITLE')
                      search('', 'TITLE')
                    },
                  }
                : {
                    label: '게시글 작성',
                    onClick: () => inlineFormRef.current?.focusTitleInput(),
                  }
            }
          />
        </div>
      )
    }

    return (
      <>
        <div className={styles.feed}>
          <PostInlineForm
            ref={inlineFormRef}
            myUsername={myProfile?.username ?? null}
            onPostCreated={handlePostCreated}
          />
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {error && (
          <div className={styles.retryBanner}>
            <p className={styles.retryText}>{error}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
              다시 시도
            </button>
          </div>
        )}

        {isFetchingMore && <InfiniteScrollLoader />}

        {!hasMore && posts.length > 0 && !error && <EndOfList />}

        <div ref={sentinelRef} className={styles.sentinel} />
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
          <div className={styles.headerActions}>
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
        </div>

        {renderContent()}
      </main>
    </>
  )
}
