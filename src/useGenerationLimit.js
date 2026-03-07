import { useState, useCallback } from 'react'

const STORAGE_KEY = 'siteforgeai_gen_count'
const FREE_LIMIT = 3

function getCount() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function setCount(n) {
  try {
    localStorage.setItem(STORAGE_KEY, String(n))
  } catch {}
}

export function useGenerationLimit(user) {
  const [count, setCountState] = useState(getCount)

  const remaining = Math.max(0, FREE_LIMIT - count)
  // Logged-in users on free tier still have the same limit
  // but we track server-side in prod. For MVP, localStorage is fine.
  const canGenerate = user ? true : count < FREE_LIMIT
  const needsAuth = !user && count >= FREE_LIMIT

  const increment = useCallback(() => {
    const next = count + 1
    setCount(next)
    setCountState(next)
  }, [count])

  return { count, remaining, canGenerate, needsAuth, increment, FREE_LIMIT }
}
