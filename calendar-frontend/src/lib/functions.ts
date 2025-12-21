/**
 * Appwrite Functions client utilities
 */

import { client } from './appwrite'
import { Functions } from 'appwrite'

const functions = new Functions(client)

/**
 * Store calendar OAuth token via Appwrite Function
 * This function is automatically called with the user's session cookie
 */
export async function storeCalendarToken(data: {
  provider: string
  accessToken: string
  scope: string
  expiresIn: string
}) {
  try {
    // The Appwrite SDK automatically includes the session cookie
    // which adds x-appwrite-user-id and other auth headers
    const response = await functions.createExecution({
      functionId: '69487dbd00224e38d484',
      body: JSON.stringify(data),
    })

    return response
  } catch (error) {
    console.error('Failed to store calendar token:', error)
    throw error
  }
}

/**
 * Get user's connected calendars
 */
export async function getUserCalendars() {
  try {
    const response = await functions.createExecution(
      '69487dbd00224e38d484',
      JSON.stringify({ action: 'list' }),
      false
    )

    if (response.responseStatusCode !== 200) {
      throw new Error(`Function error: ${response.responseBody}`)
    }

    return JSON.parse(response.responseBody)
  } catch (error) {
    console.error('Failed to get calendars:', error)
    throw error
  }
}
