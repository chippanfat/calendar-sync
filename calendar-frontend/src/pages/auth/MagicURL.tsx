import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MagicURL() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { sendMagicURL, loginWithMagicURL } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if we're handling a magic URL callback
    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')

    if (userId && secret) {
      handleMagicURLCallback(userId, secret)
    }
  }, [searchParams])

  async function handleMagicURLCallback(userId: string, secret: string) {
    setLoading(true)
    try {
      await loginWithMagicURL(userId, secret)
      navigate('/calendar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with magic URL')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await sendMagicURL(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">📧</span>
            </div>
            <h1 className="text-3xl font-bold">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a magic link to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to sign in. The link will expire in 1 hour.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
            >
              Use a different email
            </Button>
          </div>

          <Link to="/auth/login">
            <Button variant="ghost">Back to login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Magic Link</h1>
          <p className="text-muted-foreground">
            Sign in without a password using a magic link
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/auth/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
