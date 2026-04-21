import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

interface UseIntersectionObserverResult {
  ref: React.RefObject<HTMLDivElement | null>
  isIntersecting: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverResult {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px',
        threshold: options.threshold ?? 0,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options.root, options.rootMargin, options.threshold])

  return { ref, isIntersecting }
}
