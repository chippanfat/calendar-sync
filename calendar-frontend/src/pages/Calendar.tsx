import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import CalendarProviders from '@/components/OAuthProviders'
import { 
  CalendarProvider, 
  parseOAuthResponse, 
  hasScope, 
  GOOGLE_CALENDAR_SCOPES 
} from '@/lib/oauth'
import { storeCalendarToken } from '@/lib/functions'

export default function Calendar() {
  const [count, setCount] = useState(0)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [oauthMessage, setOauthMessage] = useState<string | null>(null)

  // Handle OAuth callback when Google redirects back
  useEffect(() => {
    const oauthParams = parseOAuthResponse()
    
    if (oauthParams) {
      const provider = localStorage.getItem('oauth2-provider')
      localStorage.removeItem('oauth2-provider')

      if (oauthParams.error) {
        // Handle OAuth error
        setOauthMessage(`Authentication failed: ${oauthParams.error}`)
        console.error('OAuth error:', oauthParams.error)
      } else if (oauthParams.access_token) {
        // Successfully received access token
        const { access_token, token_type, expires_in, scope } = oauthParams

        // Get provider-friendly name
        const providerName = provider === CalendarProvider.GOOGLE 
          ? 'Google Calendar' 
          : provider === CalendarProvider.MICROSOFT 
          ? 'Microsoft Outlook' 
          : provider

        // Check which scopes were granted (Google-specific for now)
        if (provider === CalendarProvider.GOOGLE) {
          const hasCalendarAccess = hasScope(scope, GOOGLE_CALENDAR_SCOPES.READONLY)
          const hasEventsAccess = hasScope(scope, GOOGLE_CALENDAR_SCOPES.EVENTS)

          console.log('OAuth Success:', {
            provider,
            token_type,
            expires_in,
            scopes_granted: scope,
            has_calendar_access: hasCalendarAccess,
            has_events_access: hasEventsAccess,
          })
        }

        // Store the access token securely via Appwrite Function
        try {
          const result = await storeCalendarToken({
            provider: provider || CalendarProvider.GOOGLE,
            accessToken: access_token,
            scope: scope,
            expiresIn: expires_in,
          })

          console.log('Calendar token stored successfully:', result)
          setOauthMessage(`Successfully connected to ${providerName}!`)
        } catch (storeError) {
          console.error('Failed to store calendar token:', storeError)
          setOauthMessage(`Connected to ${providerName}, but failed to save. Please try again.`)
        }

        // Clear the hash from the URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  const handleProviderClick = (providerId: CalendarProvider) => {
    // Close the sheet before redirecting
    setIsSheetOpen(false)
    
    // OAuth flow is handled in the OAuthProviders component
    console.log(`Initiating OAuth flow for ${providerId}`)
  }

  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 pt-20">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Calendar View 📆</h1>
          <p className="text-muted-foreground">
            This is where your calendar will be displayed
          </p>

          {oauthMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 max-w-md mx-auto">
              {oauthMessage}
            </div>
          )}
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="mt-4">
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                Add Calendar
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Connect Your Calendars</SheetTitle>
                <SheetDescription>
                  Choose a calendar provider to sync your events
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Available Providers</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to your cloud calendar to view and manage events in one place
                  </p>
                </div>

                <CalendarProviders onProviderClick={handleProviderClick} />

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">What happens next?</p>
                      <p className="text-muted-foreground">
                        You'll be redirected to sign in with your chosen provider. 
                        We'll only access your calendar data - nothing else.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
