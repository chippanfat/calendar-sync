import { Button } from '@/components/ui/button'
import { CalendarProvider, createCalendarProviderHandler } from '@/lib/oauth'

interface CalendarProviderUI {
  id: CalendarProvider
  name: string
  icon: JSX.Element
  bgColor: string
  hoverBgColor: string
  textColor: string
  borderColor?: string
  description: string
}

const providers: CalendarProviderUI[] = [
  {
    id: CalendarProvider.GOOGLE,
    name: 'Google Calendar',
    description: 'Sync events from your Google Calendar',
    bgColor: 'bg-white',
    hoverBgColor: 'hover:bg-gray-50',
    textColor: 'text-gray-900',
    borderColor: 'border border-gray-300',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  {
    id: CalendarProvider.MICROSOFT,
    name: 'Microsoft Outlook',
    description: 'Connect your Outlook/Office 365 calendar',
    bgColor: 'bg-white',
    hoverBgColor: 'hover:bg-gray-50',
    textColor: 'text-gray-900',
    borderColor: 'border border-gray-300',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3Z"
          fill="white"
        />
        <path
          d="M12 12.5C12 14.433 10.433 16 8.5 16C6.567 16 5 14.433 5 12.5C5 10.567 6.567 9 8.5 9C10.433 9 12 10.567 12 12.5Z"
          fill="#0078D4"
        />
        <path
          d="M8.5 14C9.32843 14 10 13.3284 10 12.5C10 11.6716 9.32843 11 8.5 11C7.67157 11 7 11.6716 7 12.5C7 13.3284 7.67157 14 8.5 14Z"
          fill="white"
        />
        <path
          d="M13 6H19V10H13V6Z"
          fill="white"
        />
        <path
          d="M13 11H19V15H13V11Z"
          fill="white"
        />
        <path
          d="M13 16H19V19H13V16Z"
          fill="white"
        />
      </svg>
    ),
  },
  // Future calendar providers can be added here:
  // {
  //   id: 'apple',
  //   name: 'Apple Calendar',
  //   description: 'Sync with iCloud Calendar',
  //   bgColor: 'bg-black',
  //   hoverBgColor: 'hover:bg-gray-900',
  //   textColor: 'text-white',
  //   icon: <AppleIcon />
  // },
]

interface CalendarProvidersProps {
  onProviderClick?: (providerId: CalendarProvider) => void
}

export default function CalendarProviders({ 
  onProviderClick 
}: CalendarProvidersProps) {
  const handleProviderClick = (providerId: CalendarProvider) => {
    // Use factory to get provider handler
    const providerHandler = createCalendarProviderHandler(providerId)

    // Check if provider is configured
    if (!providerHandler.isConfigured()) {
      console.error(`${providerHandler.name} not configured`)
      alert(providerHandler.getConfigError())
      return
    }

    // Notify parent component (optional)
    if (onProviderClick) {
      onProviderClick(providerId)
    }

    // Initiate OAuth flow
    try {
      providerHandler.initiateOAuth()
    } catch (error) {
      console.error(`Error initiating OAuth for ${providerHandler.name}:`, error)
      alert(`Failed to connect to ${providerHandler.name}. Please try again.`)
    }
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className={`w-full h-auto ${provider.bgColor} ${provider.hoverBgColor} ${provider.textColor} ${provider.borderColor || ''} font-medium transition-colors`}
          onClick={() => handleProviderClick(provider.id)}
        >
          <div className="flex items-center gap-4 py-2">
            <div className="flex-shrink-0">
              {provider.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">{provider.name}</div>
              <div className="text-sm font-normal opacity-75">
                {provider.description}
              </div>
            </div>
            <div className="flex-shrink-0">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}
