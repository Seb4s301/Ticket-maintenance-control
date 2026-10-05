import { useEffect, useState } from 'react'
import { readStoredAuth, writeStoredAuth } from '../api/client.js'
import { me } from '../api/auth.js'

export function useAuth() {
  const [auth, setAuth] = useState(() => readStoredAuth())
  const token = auth?.token ?? null

  useEffect(() => {
    function onUnauthorized() {
      setAuth(null)
    }
    window.addEventListener('tm:unauthorized', onUnauthorized)
    return () => window.removeEventListener('tm:unauthorized', onUnauthorized)
  }, [])

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    me()
      .then((user) => {
        if (!cancelled) setAuth((prev) => (prev ? { ...prev, user } : prev))
      })
      .catch(() => {
        // 401 clears the session via tm:unauthorized; other errors keep it.
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function saveAuth(nextAuth) {
    writeStoredAuth(nextAuth)
    setAuth(nextAuth)
  }

  function logout() {
    writeStoredAuth(null)
    setAuth(null)
  }

  return { user: auth?.user ?? null, token, saveAuth, logout }
}
