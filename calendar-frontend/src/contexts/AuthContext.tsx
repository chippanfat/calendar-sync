import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { account, ID } from '@/lib/appwrite'
import type { Models } from 'appwrite'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  sendMagicURL: (email: string) => Promise<void>
  loginWithMagicURL: (userId: string, secret: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    await account.createEmailPasswordSession({
      email,
      password,
    })
    const currentUser = await account.get()
    setUser(currentUser)
  }

  async function register(email: string, password: string, name: string) {
    await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    })
    await login(email, password)
  }

  async function logout() {
    await account.deleteSession({
      sessionId: 'current',
    })
    setUser(null)
  }

  async function sendMagicURL(email: string) {
    // The URL where users will be redirected after clicking the magic link
    const redirectUrl = `${window.location.origin}/auth/magic-url`
    await account.createMagicURLToken({
      userId: ID.unique(),
      email,
      url: redirectUrl,
    })
  }

  async function loginWithMagicURL(userId: string, secret: string) {
    await account.createSession({
      userId,
      secret,
    })
    const currentUser = await account.get()
    setUser(currentUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sendMagicURL,
        loginWithMagicURL,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
