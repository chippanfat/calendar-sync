import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Calendar App</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Link to="/">
              <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm">
                Home
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant={isActive('/calendar') ? 'default' : 'ghost'} size="sm">
                Calendar
              </Button>
            </Link>
            <Link to="/about">
              <Button variant={isActive('/about') ? 'default' : 'ghost'} size="sm">
                About
              </Button>
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user.name || user.email}
                </span>
                <Link to="/auth/logout">
                  <Button variant="ghost" size="sm">
                    Logout
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
