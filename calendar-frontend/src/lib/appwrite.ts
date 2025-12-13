import { Client, Account, ID } from 'appwrite'

const client = new Client()

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '')

export const account = new Account(client)

export { client, ID }
