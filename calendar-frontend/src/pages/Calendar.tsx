import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Navigation from '@/components/Navigation'

export default function Calendar() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 pt-20">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Calendar View 📆</h1>
          <p className="text-muted-foreground">
            This is where your calendar will be displayed
          </p>
        </div>
        
        <div className="flex flex-col gap-4 items-center">
          <p className="text-sm">Counter: <span className="font-bold text-2xl">{count}</span></p>
          <div className="flex gap-2">
            <Button onClick={() => setCount((count) => count + 1)}>
              Increment
            </Button>
            <Button variant="secondary" onClick={() => setCount((count) => count - 1)}>
              Decrement
            </Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </>
  )
}
