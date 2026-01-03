/**
 * OAuth 2.0 utilities for calendar provider authentication
 * Based on Google's OAuth 2.0 implicit grant flow
 * https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
 */

/**
 * Supported calendar providers
 */
export enum CalendarProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

// Generate a cryptographically random state value for CSRF protection
function generateCryptoRandomState(): string {
  const randomValues = new Uint32Array(2)
  window.crypto.getRandomValues(randomValues)

  // Encode as UTF-8
  const utf8Encoder = new TextEncoder()
  const utf8Array = utf8Encoder.encode(
    String.fromCharCode.apply(null, Array.from(randomValues))
  )

  // Base64 encode the UTF-8 data
  return btoa(String.fromCharCode.apply(null, Array.from(utf8Array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

interface GoogleOAuthParams {
  clientId: string
  redirectUri: string
  scopes: string[]
}

interface MicrosoftOAuthParams {
  clientId: string
  redirectUri: string
  scopes: string[]
  tenant?: string // Optional: 'common', 'organizations', 'consumers', or specific tenant ID
}

/**
 * Initiates the Google OAuth 2.0 flow by redirecting to Google's authorization server
 */
export function initiateGoogleOAuth(params: GoogleOAuthParams): void {
  // Generate and store random state value for CSRF protection
  const state = generateCryptoRandomState()
  localStorage.setItem('oauth2-state', state)
  localStorage.setItem('oauth2-provider', 'google')

  // Google's OAuth 2.0 endpoint
  const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

  // Build URL with query parameters
  const urlParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'token', // Implicit grant flow
    scope: params.scopes.join(' '),
    state: state,
    include_granted_scopes: 'true', // Enable incremental authorization
  })

  // Redirect to Google's OAuth server
  window.location.href = `${oauth2Endpoint}?${urlParams.toString()}`
}

/**
 * Initiates the Microsoft OAuth 2.0 flow by redirecting to Microsoft's authorization server
 * Supports Azure AD, Microsoft Accounts, and Office 365
 */
export function initiateMicrosoftOAuth(params: MicrosoftOAuthParams): void {
  // Generate and store random state value for CSRF protection
  const state = generateCryptoRandomState()
  localStorage.setItem('oauth2-state', state)
  localStorage.setItem('oauth2-provider', 'microsoft')

  // Microsoft Identity Platform endpoint
  // Use 'common' to support both personal Microsoft accounts and work/school accounts
  const tenant = params.tenant || 'common'
  const oauth2Endpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`

  // Build URL with query parameters
  const urlParams = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: 'token', // Implicit grant flow (returns access_token directly)
    scope: params.scopes.join(' '),
    state: state,
    response_mode: 'fragment', // Return tokens in URL fragment (hash)
    nonce: generateCryptoRandomState(), // Additional security for token validation
  })

  // Redirect to Microsoft's OAuth server
  window.location.href = `${oauth2Endpoint}?${urlParams.toString()}`
}

/**
 * Google Calendar OAuth scopes
 */
export const GOOGLE_CALENDAR_SCOPES = {
  // Read-only access to calendars
  READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
  // Full access to calendars
  FULL: 'https://www.googleapis.com/auth/calendar',
  // Access to calendar events
  EVENTS: 'https://www.googleapis.com/auth/calendar.events',
  // Read-only access to calendar events
  EVENTS_READONLY: 'https://www.googleapis.com/auth/calendar.events.readonly',
}

/**
 * Microsoft Graph OAuth scopes for Calendar (Outlook/Office 365)
 * https://learn.microsoft.com/en-us/graph/permissions-reference
 */
export const MICROSOFT_CALENDAR_SCOPES = {
  // Read user's calendars
  CALENDARS_READ: 'Calendars.Read',
  // Read and write user's calendars
  CALENDARS_READWRITE: 'Calendars.ReadWrite',
  // Read user's and shared calendars
  CALENDARS_READ_SHARED: 'Calendars.Read.Shared',
  // Read and write user's and shared calendars
  CALENDARS_READWRITE_SHARED: 'Calendars.ReadWrite.Shared',
  // Offline access (refresh tokens)
  OFFLINE_ACCESS: 'offline_access',
  // Read user's profile
  USER_READ: 'User.Read',
}

/**
 * Parse OAuth 2.0 response from URL hash fragment
 */
export function parseOAuthResponse(): Record<string, string> | null {
  const fragmentString = window.location.hash.substring(1)
  
  if (!fragmentString) {
    return null
  }

  const params: Record<string, string> = {}
  const regex = /([^&=]+)=([^&]*)/g
  let match

  while ((match = regex.exec(fragmentString)) !== null) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2])
  }

  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem('oauth2-state')
  if (params['state'] && params['state'] === storedState) {
    // Clear state after use
    localStorage.removeItem('oauth2-state')
    return params
  } else if (params['state']) {
    console.error('State mismatch. Possible CSRF attack')
    return null
  }

  return Object.keys(params).length > 0 ? params : null
}

/**
 * Check if user granted access to specific scopes
 */
export function hasScope(grantedScopes: string, requiredScope: string): boolean {
  return grantedScopes.split(' ').includes(requiredScope)
}

/**
 * Provider configuration interface
 */
interface ProviderConfig {
  name: string
  initiateOAuth: () => void
  isConfigured: () => boolean
  getConfigError: () => string
}

/**
 * Factory function to create provider-specific OAuth handlers
 */
export function createCalendarProviderHandler(provider: CalendarProvider): ProviderConfig {
  switch (provider) {
    case CalendarProvider.GOOGLE:
      return {
        name: 'Google Calendar',
        isConfigured: () => {
          return !!import.meta.env.VITE_GOOGLE_CLIENT_ID
        },
        getConfigError: () => {
          return 'Google Calendar integration is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.'
        },
        initiateOAuth: () => {
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
          const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/oauth/google/callback'

          if (!clientId) {
            throw new Error('Google Client ID not configured')
          }

          initiateGoogleOAuth({
            clientId,
            redirectUri,
            scopes: [
              GOOGLE_CALENDAR_SCOPES.READONLY, // Read calendar events
              GOOGLE_CALENDAR_SCOPES.EVENTS,   // Create/edit/delete events
            ],
          })
        },
      }

    case CalendarProvider.MICROSOFT:
      return {
        name: 'Microsoft Outlook',
        isConfigured: () => {
          return !!import.meta.env.VITE_MICROSOFT_CLIENT_ID
        },
        getConfigError: () => {
          return 'Microsoft Outlook integration is not configured. Please set VITE_MICROSOFT_CLIENT_ID in your .env file.'
        },
        initiateOAuth: () => {
          const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID
          const redirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI || window.location.origin + '/oauth/microsoft/callback'
          const tenant = import.meta.env.VITE_MICROSOFT_TENANT || 'common'

          if (!clientId) {
            throw new Error('Microsoft Client ID not configured')
          }

          initiateMicrosoftOAuth({
            clientId,
            redirectUri,
            tenant,
            scopes: [
              MICROSOFT_CALENDAR_SCOPES.CALENDARS_READ,        // Read calendars
              MICROSOFT_CALENDAR_SCOPES.CALENDARS_READWRITE,   // Create/edit/delete events
              MICROSOFT_CALENDAR_SCOPES.USER_READ,             // Read user profile
              MICROSOFT_CALENDAR_SCOPES.OFFLINE_ACCESS,        // Refresh tokens
            ],
          })
        },
      }

    default:
      throw new Error(`Unknown calendar provider: ${provider}`)
  }
}
