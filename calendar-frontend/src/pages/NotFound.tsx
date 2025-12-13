import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import Navigation from '@/components/Navigation'

export default function NotFound() {
  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 pt-20">
        <div className="space-y-4 text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Sorry, the page you're looking for doesn't exist.
          </p>
        </div>

        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </>
  )
}
