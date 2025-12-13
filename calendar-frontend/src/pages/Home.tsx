import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 pt-20">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">
            {user ? `Welcome back, ${user.name}! 👋` : 'Welcome to Calendar App 📅'}
          </h1>
          <p className="text-muted-foreground">
            {user 
              ? 'Your personal calendar is ready to help you stay organized'
              : 'Sign in to access your personal calendar and stay organized'}
          </p>
        </div>
        
        <div className="flex gap-4">
          {user ? (
            <>
              <Link to="/calendar">
                <Button size="lg">Go to Calendar</Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg">About</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="secondary" size="lg">Sign In</Button>
              </Link>
            </>
          )}
        </div>

        {!user && (
          <div className="mt-8 p-6 bg-card rounded-lg border max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span>✓</span> Email/Password Authentication
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> Magic Link Sign-in
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> Secure Appwrite Backend
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> Beautiful UI Components
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  )
}
