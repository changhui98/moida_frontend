import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { authStorage } from '../lib/authStorage'

interface AuthContextValue {
  token: string
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState(authStorage.getToken())

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: token.length > 0,
      login: (nextToken: string) => {
        authStorage.setToken(nextToken)
        setToken(nextToken)
      },
      logout: () => {
        authStorage.clearToken()
        setToken('')
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
