import Navigation from '@/components/Navigation'

export default function About() {
  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 pt-20">
        <div className="space-y-4 text-center max-w-2xl">
          <h1 className="text-4xl font-bold">About This App ℹ️</h1>
          <p className="text-muted-foreground text-lg">
            This is a calendar application built with React, TypeScript, Tailwind CSS,
            shadcn/ui, and React Router.
          </p>
          <div className="text-left space-y-2 mt-6">
            <h2 className="text-2xl font-semibold">Features:</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>React Router for navigation</li>
              <li>shadcn/ui component library</li>
              <li>Tailwind CSS for styling</li>
              <li>TypeScript for type safety</li>
              <li>Vite for fast development</li>
              <li>Appwrite integration ready</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
