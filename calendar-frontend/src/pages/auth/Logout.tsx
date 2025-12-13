import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function Logout() {
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    handleLogout()
  }, [])

  async function handleLogout() {
    try {
      await logout()
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout')
      setLoggingOut(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Logout Failed</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>

          <div className="bg-card rounded-lg border p-6 space-y-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {loggingOut ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            ) : (
              <span className="text-4xl">👋</span>
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {loggingOut ? 'Logging out...' : 'Logged out successfully'}
          </h1>
          <p className="text-muted-foreground">
            {loggingOut 
              ? 'Please wait while we sign you out' 
              : 'Redirecting to home page...'}
          </p>
        </div>
      </div>
    </div>
  )
}
