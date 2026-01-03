import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseOAuthResponse } from '@/lib/oauth'
import { storeCalendarToken } from '@/lib/functions'
import { Loader2 } from 'lucide-react'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Parse OAuth response from URL hash fragment
        const params = parseOAuthResponse()

        if (!params) {
          setErrorMessage('No OAuth response found or state verification failed')
          setStatus('error')
          return
        }

        // Extract required parameters
        const {
          access_token: accessToken,
          token_type: tokenType,
          expires_in: expiresIn,
          scope,
          state,
        } = params

        // Validate required parameters
        if (!accessToken) {
          setErrorMessage('Access token not found in OAuth response')
          setStatus('error')
          return
        }

        // Get provider from localStorage (set during OAuth initiation)
        const provider = localStorage.getItem('oauth2-provider') || 'google'

        console.log('OAuth callback received:', {
          provider,
          tokenType,
          expiresIn,
          scope,
          state,
          hasAccessToken: !!accessToken,
        })

        // Call Appwrite function to store the token
        setStatus('loading')
        const response = await storeCalendarToken({
          provider,
          accessToken,
          scope: scope || '',
          expiresIn: expiresIn || '3600',
        })

        console.log('Token stored successfully:', response)

        // Clear provider from localStorage
        localStorage.removeItem('oauth2-provider')

        // Success - redirect to calendar page
        setStatus('success')
        
        // Wait a moment to show success state, then redirect
        setTimeout(() => {
          navigate('/calendar', { 
            replace: true,
            state: { message: 'Calendar connected successfully!' }
          })
        }, 1000)

      } catch (error: any) {
        console.error('OAuth callback error:', error)
        setErrorMessage(error.message || 'Failed to process OAuth callback')
        setStatus('error')
        
        // Redirect to calendar page after showing error
        setTimeout(() => {
          navigate('/calendar', { replace: true })
        }, 3000)
      }
    }

    handleOAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Connecting Calendar
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we securely store your calendar credentials...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Success!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your calendar has been connected. Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Connection Failed
              </h2>
              <p className="mt-2 text-sm text-red-600">
                {errorMessage}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Redirecting back to calendar...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}





