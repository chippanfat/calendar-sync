# Calendar App Documentation

## Overview

This is a calendar application built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, and Appwrite for backend authentication and data management.

## Project Setup

### Prerequisites

- Bun runtime installed (used instead of npm/node)
- Docker and Docker Compose (for running Appwrite)

### Environment Configuration

Create a `.env` file in the `calendar-frontend` directory with the following variables:

```env
VITE_APPWRITE_ENDPOINT=http://localhost/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here

# Google Calendar OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/google/callback

# Microsoft OAuth (Outlook/Office 365)
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
VITE_MICROSOFT_REDIRECT_URI=http://localhost:5173/oauth/microsoft/callback
VITE_MICROSOFT_TENANT=common
```

**Getting your Appwrite Project ID:**
1. Start Appwrite with `docker-compose up -d` from the root directory
2. Access Appwrite Console at `http://localhost/console`
3. Create a new project or use an existing one
4. Copy the Project ID from the project settings
5. Make sure Email/Password and Magic URL authentication methods are enabled in Auth settings

**Setting up Google OAuth 2.0:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized JavaScript origins: `http://localhost:5173`
   - Add authorized redirect URIs: `http://localhost:5173/oauth/google/callback`
   - Click "Create"
5. Copy the Client ID and paste it into your `.env` file as `VITE_GOOGLE_CLIENT_ID`
6. Note: For production, use your production domain instead of localhost

**Setting up Microsoft OAuth 2.0 (Outlook/Office 365):**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Microsoft Entra ID" (formerly Azure Active Directory)
3. Click "App registrations" in the left sidebar
4. Click "New registration"
5. Configure the application:
   - **Name**: Your app name (e.g., "Calendar App")
   - **Supported account types**: Choose one:
     - "Accounts in any organizational directory and personal Microsoft accounts" (most common - supports both work/school and personal accounts)
     - "Accounts in this organizational directory only" (single tenant - work/school only)
     - "Personal Microsoft accounts only" (consumers only)
   - **Redirect URI**: Select "Single-page application (SPA)" and enter `http://localhost:5173/oauth/microsoft/callback`
   - Click "Register"
6. Copy the **Application (client) ID** from the Overview page
7. Paste it into your `.env` file as `VITE_MICROSOFT_CLIENT_ID`
8. Configure API permissions:
   - Click "API permissions" in the left sidebar
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Add the following permissions:
     - `Calendars.Read` - Read user's calendars
     - `Calendars.ReadWrite` - Read and write user's calendars
     - `User.Read` - Read user's profile
     - `offline_access` - Maintain access to data (refresh tokens)
   - Click "Add permissions"
   - (Optional) Click "Grant admin consent" if you have admin rights
9. Configure authentication settings:
   - Click "Authentication" in the left sidebar
   - Under "Implicit grant and hybrid flows", **MUST BE ENABLED**:
     - ✅ **Access tokens** (REQUIRED for implicit flow)
     - ✅ **ID tokens** (REQUIRED for implicit flow)
   - Under "Advanced settings", set "Allow public client flows" to "No"
   - Click "Save"
   - **Important**: Without enabling these settings, you'll get a PKCE error!
10. Note the tenant configuration:
    - If you selected "any organizational directory and personal accounts", use `VITE_MICROSOFT_TENANT=common` (default)
    - If single tenant, you can use your tenant ID or keep it as `common`
11. For production, add your production domain as an additional redirect URI

**Important Notes:**
- Microsoft OAuth uses the Microsoft Identity Platform (v2.0 endpoints)
- The implementation uses the OAuth 2.0 implicit grant flow (suitable for SPAs)
- Tokens are returned in the URL fragment for security
- The `common` tenant supports both personal Microsoft accounts (Outlook.com, Hotmail, Live) and work/school accounts (Office 365, Azure AD)

### Installation

```bash
cd calendar-frontend
bun install
bun run dev
```

## Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **React Router 7.10.1** - Client-side routing
- **Appwrite 21.5.0** - Backend as a Service (authentication, database)

## Authentication

The app uses Appwrite for authentication with multiple methods:

### 1. Email/Password Authentication
- Traditional username/password login
- Register new accounts with name, email, and password
- Automatic login after registration
- Password must be at least 8 characters
- Password validation (minimum 8 characters)

### 2. Magic URL (Passwordless)
- Sign in without a password
- Enter email address to receive a magic link
- Click the link to automatically sign in
- No password required
- Links expire in 1 hour

## Calendar Providers

The app supports connecting to cloud calendar providers to sync events. This is separate from app authentication.

### Connecting Cloud Calendars

Users can connect their cloud calendars to view and manage events:

- **Google Calendar** - OAuth 2.0 integration to sync Google Calendar events
  - Uses OAuth 2.0 implicit grant flow
  - Requests calendar read and event management permissions
  - Access tokens stored securely via Appwrite function
  - Token validation and refresh to be implemented
- **Microsoft Outlook** - OAuth 2.0 integration for Office 365 and Outlook.com calendars
  - Uses Microsoft Identity Platform (v2.0)
  - OAuth 2.0 implicit grant flow for SPAs
  - Supports both personal Microsoft accounts and work/school accounts
  - Requests calendar read/write and user profile permissions
  - Access tokens stored securely via Appwrite function
- Additional providers coming soon (Apple Calendar)
- Access via "Add Calendar" button on the Calendar page
- Secure OAuth flow with CSRF protection using state parameter

### Add Calendar Flow

1. User must be logged into the app first
2. Navigate to Calendar page (`/calendar`)
3. Click "Add Calendar" button (opens a side panel)
4. Choose a calendar provider from the sheet (Google, Microsoft, etc.)
5. User is redirected to the provider's OAuth consent screen
6. User grants permissions to access their calendar
7. Provider redirects back to the Calendar page with access token
8. App stores the token and displays success message
9. Calendar events can now be fetched using the access token

The "Add Calendar" interface uses a shadcn Sheet component that slides in from the right side of the screen, providing a seamless UX without leaving the calendar page.

**OAuth Flow Details (Google Calendar):**
- Uses OAuth 2.0 implicit grant flow
- Factory pattern for provider-specific OAuth handlers
- Provider enum (`CalendarProvider.GOOGLE`, `CalendarProvider.MICROSOFT`) for type safety
- Generates cryptographically random state parameter for CSRF protection
- Requests scopes: `calendar.readonly` and `calendar.events`
- Access token returned in URL hash fragment
- Token validated against stored state parameter
- Scopes verified to ensure user granted required permissions

**Code Architecture:**
- `CalendarProvider` enum defines supported providers (`GOOGLE`, `MICROSOFT`)
- `createCalendarProviderHandler()` factory returns provider-specific config
- Each provider handler includes:
  - `isConfigured()` - Checks if env variables are set
  - `getConfigError()` - Returns user-friendly error message
  - `initiateOAuth()` - Starts the OAuth flow
- View components use the factory, keeping OAuth logic separate
- Unified callback handler (`OAuthCallback.tsx`) processes responses from all providers
- Provider-specific OAuth functions:
  - `initiateGoogleOAuth()` - Google OAuth 2.0 flow
  - `initiateMicrosoftOAuth()` - Microsoft Identity Platform flow


### Auth Pages

- `/auth/login` - Sign in with email/password or magic link
- `/auth/register` - Create a new account
- `/auth/magic-url` - Request and handle magic link authentication
- `/auth/logout` - Logout page (properly clears Appwrite session)

### User Session

- Persistent sessions across page reloads
- User info displayed in navigation
- Logout functionality that clears both local state and Appwrite session
- Auth state accessible via `useAuth()` hook

### Using Authentication in Components

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, login, logout, register, sendMagicURL } = useAuth()
  
  // user is null when not logged in
  // user contains name, email, etc. when logged in
  
  // Check if user is authenticated
  if (!user) {
    return <div>Please log in</div>
  }
  
  // Access user data
  return <div>Welcome {user.name}!</div>
}
```

### API Methods

All authentication methods use the latest Appwrite SDK syntax with object parameters:

```tsx
// Login with email and password
await login('user@example.com', 'password123')

// Register new user
await register('user@example.com', 'password123', 'John Doe')

// Send magic URL link
await sendMagicURL('user@example.com')

// Logout (clears Appwrite session)
await logout()
```

### Protected Routes

The Calendar page is protected and requires authentication. Users who aren't logged in will be redirected to the login page.

- `/calendar` requires authentication
- Unauthenticated users redirect to `/auth/login`
- Loading state while checking authentication

To protect additional routes:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute'

<Route 
  path="/my-page" 
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  } 
/>
```

## Routing

### Available Routes

- `/` - Home page (shows different content for logged-in vs logged-out users)
- `/calendar` - Calendar view with "Add Calendar" sheet (protected, requires authentication)
- `/about` - About page with app information
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/magic-url` - Magic URL authentication page
- `/auth/logout` - Logout page (properly clears Appwrite session)
- `/oauth/google/callback` - OAuth callback handler for Google Calendar (protected, requires authentication)
- `/oauth/microsoft/callback` - OAuth callback handler for Microsoft Outlook (protected, requires authentication)
- `*` - 404 Not Found page

### Navigation

The app includes a responsive navigation bar that:
- Shows on all pages
- Highlights the current active route
- Displays user name/email when logged in
- Shows Login/Sign Up buttons when logged out
- Includes a Logout button for authenticated users

### Adding New Routes

1. Create a page component in `src/pages/`
2. Import it in `src/App.tsx`
3. Add a `<Route>` element:

```tsx
<Route path="/your-path" element={<YourComponent />} />
```

4. Optionally update `src/components/Navigation.tsx` to add a nav link

### Routing Examples

```tsx
// Navigation with Link
import { Link } from 'react-router-dom'
<Link to="/calendar">Go to Calendar</Link>

// Programmatic navigation
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/calendar')

// Get current location
import { useLocation } from 'react-router-dom'
const location = useLocation()
console.log(location.pathname)
```

## Project Structure

```
calendar-frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (button, input, label, sheet)
│   │   ├── Navigation.tsx   # Main navigation bar
│   │   ├── ProtectedRoute.tsx # Route protection wrapper
│   │   └── OAuthProviders.tsx # Calendar provider buttons (Google Calendar, etc.)
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── lib/
│   │   ├── appwrite.ts      # Appwrite client configuration
│   │   ├── oauth.ts         # OAuth 2.0 utilities (enums, factory, handlers)
│   │   ├── functions.ts     # Appwrite Functions client utilities
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx       # Email/password login
│   │   │   ├── Register.tsx    # Account registration
│   │   │   ├── MagicURL.tsx    # Magic link authentication
│   │   │   ├── Logout.tsx      # Logout with session cleanup
│   │   │   └── OAuthCallback.tsx # OAuth callback handler with loading state
│   │   ├── Home.tsx         # Landing page
│   │   ├── Calendar.tsx     # Calendar view with sheet for adding calendars (protected)
│   │   ├── About.tsx        # About page
│   │   └── NotFound.tsx     # 404 page
│   ├── App.tsx              # Route configuration
│   └── main.tsx             # App entry point
└── .env                     # Environment variables (not in git)
```

## Development

### Running the App

```bash
cd calendar-frontend
bun run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
bun run build
```

### Linting

```bash
bun run lint
```

## Appwrite Backend

The app connects to an Appwrite instance running locally via Docker. The Appwrite setup includes:

- MariaDB for database
- Redis for caching
- Full authentication system
- Email services for magic URLs
- Functions for server-side operations

### Appwrite Functions

The project includes serverless functions for secure operations:

**`oauth-login` Function:**
- Securely stores OAuth tokens for calendar providers
- Automatically authenticates users via session cookies
- Validates user permissions before storing data
- Runtime: PHP 8.0
- Permissions: Requires authenticated user with API key
- Language: PHP
- Function ID: `694db192003ae6592d13`
- Scopes: `users.read`, `databases.read`, `databases.write`
- Database Operations:
  - Database ID: `6939e81e00122e88459e`
  - Database Name: `calendar-db`
  - Collection: `user_token`
  - Inserts OAuth tokens and user data into the database
  - Includes error handling and logging for database operations
- Endpoint Configuration:
  - Uses internal Docker endpoint `http://appwrite/v1` for container communication
  - Automatically falls back to `APPWRITE_FUNCTION_API_ENDPOINT` if set
  - API key retrieved from environment variables for security

**How Authentication Works in Functions:**

When a logged-in user calls a function, Appwrite automatically includes:
- `x-appwrite-user-id` - Current user's ID
- `x-appwrite-user-jwt` - User's JWT token
- `x-appwrite-session-id` - Active session ID

The function validates these headers to ensure the user is authenticated before processing requests.

**TypeScript Support in Functions:**

Appwrite functions support TypeScript through the Node.js runtime. Here's how it works:

1. **Write in TypeScript**: Create your function in `src/main.ts`
2. **Build Command**: Configure build command in `appwrite.config.json`:
   ```json
   "commands": "npm install && npm run build"
   ```
3. **Entrypoint**: Point to compiled JavaScript file:
   ```json
   "entrypoint": "dist/main.js"
   ```
4. **Compilation**: TypeScript is compiled to JavaScript during deployment
5. **Type Safety**: Get full IDE autocomplete and type checking during development

**Example TypeScript Function Structure:**
```typescript
// src/main.ts
import { Client, Databases } from 'node-appwrite';

interface AppwriteFunctionContext {
  req: {
    body: string | object;
    headers: Record<string, string>;
  };
  res: {
    json: (data: any, statusCode?: number) => void;
  };
  log: (message: string) => void;
  error: (message: string) => void;
}

export default async ({ req, res, log, error }: AppwriteFunctionContext) => {
  // Your typed function code here
};
```

**Configuration Files:**
- `tsconfig.json` - TypeScript compiler configuration
- `package.json` - Must include `typescript` and `@types/node` in devDependencies
- Build script: `"build": "tsc"`

**Deploying Functions:**
```bash
# Deploy the function (build happens automatically)
appwrite deploy function

# Or deploy with CLI
cd functions/oauth-login
appwrite functions createDeployment \
  --functionId=YOUR_FUNCTION_ID \
  --entrypoint=src/index.php \
  --code=.
```

**Database Operations in Functions:**

The `oauth-login` function interacts with the Appwrite database to store user tokens:

```php
// Initialize Appwrite client with function credentials
// Use internal Docker endpoint when running in containers
$endpoint = getenv('APPWRITE_FUNCTION_API_ENDPOINT') ?: 'http://appwrite/v1';

// Get API key from environment variables
$apiKey = getenv('APPWRITE_API_KEY') ?: getenv('APPWRITE_FUNCTION_API_KEY');

$client = new Client();
$client
    ->setEndpoint($endpoint)
    ->setProject(getenv('APPWRITE_FUNCTION_PROJECT_ID'))
    ->setKey($apiKey);

// Create database service instance
$databases = new Databases($client);

// Insert document into collection
$document = $databases->createDocument(
    databaseId: '6939e81e00122e88459e',     // calendar-db
    collectionId: 'user_token',              // collection name
    documentId: 'unique()',                  // auto-generate unique ID
    data: [
        'user_token' => 'value'              // data to insert
    ]
);
```

**Important Notes:**
- When running in Docker, functions must use `http://appwrite/v1` as the internal endpoint (not `localhost`)
- The API key must come from environment variables, not request headers
- Functions require the appropriate scopes: `databases.read` and `databases.write` for database operations

**Database Schema:**
- Database ID: `6939e81e00122e88459e`
- Database Name: `calendar-db`
- Collection: `user_token`
- Attributes:
  - `user_token` - String field to store OAuth tokens and user data

**Error Handling:**
The function includes try-catch blocks to handle database errors gracefully:
- Logs successful document creation with document ID
- Returns error response with 500 status code on failure
- Includes error message in response for debugging

### Starting Appwrite

From the root directory:

```bash
docker-compose up -d
```

Access the Appwrite Console at `http://localhost/console`

## Troubleshooting

### "Project ID not found"
- Ensure `.env` file exists in `calendar-frontend/`
- Copy `.env.example` to `.env` and fill in your values
- Verify `VITE_APPWRITE_PROJECT_ID` is set correctly
- Restart dev server after changing `.env`

### "Google Client ID not configured"
- Ensure `VITE_GOOGLE_CLIENT_ID` is set in your `.env` file
- Follow the Google OAuth setup instructions above
- The client ID should end with `.apps.googleusercontent.com`
- Restart dev server after adding the client ID

### OAuth "redirect_uri_mismatch" error

**For Google:**
- Ensure the redirect URI in Google Cloud Console matches exactly
- Should be: `http://localhost:5173/oauth/google/callback` (for development)
- Check that authorized JavaScript origins includes: `http://localhost:5173`
- For production, use your production domain

**For Microsoft:**
- Ensure the redirect URI in Azure Portal matches exactly
- Should be: `http://localhost:5173/oauth/microsoft/callback` (for development)
- Platform type must be "Single-page application (SPA)"
- Check that implicit grant flow is enabled (Access tokens and ID tokens)
- For production, add your production domain as an additional redirect URI

### "Proof Key for Code Exchange is required" error (Microsoft)
This error occurs when Microsoft requires PKCE but implicit flow isn't enabled in Azure:

**Solution:**
1. Go to Azure Portal → Your App → **Authentication**
2. Under "Implicit grant and hybrid flows", enable:
   - ✅ **Access tokens**
   - ✅ **ID tokens**
3. Click **Save**
4. Try the OAuth flow again

**Why this happens:**
- Microsoft enforces stricter security than Google
- Without implicit flow enabled, Microsoft requires PKCE (authorization code flow)
- Our implementation uses implicit flow for simplicity (returns token directly in URL)
- Enabling implicit flow in Azure allows this flow to work

**Alternative (More Secure but Complex):**
- Implement authorization code flow with PKCE
- Requires code_challenge, code_verifier, and token exchange
- Better security but more complex implementation
- Future enhancement for production apps

### "State mismatch" error
- This indicates a potential CSRF attack
- Clear browser localStorage and try again
- Make sure you're not opening multiple OAuth flows simultaneously

## Testing Calendar Provider Integration

### Testing Google Calendar

**Prerequisites:**
1. Complete the Google OAuth setup (see Environment Configuration above)
2. Have a Google account with at least one calendar

**Steps to Test:**
1. Start the development server: `bun run dev`
2. Log into the app with your credentials
3. Navigate to the Calendar page (`/calendar`)
4. Click "Add Calendar" button
5. Click "Google Calendar" from the provider list
6. You'll be redirected to Google's consent screen
7. Sign in with your Google account (if not already signed in)
8. Review the permissions requested:
   - "See, edit, share, and permanently delete all the calendars you can access using Google Calendar"
   - "View and edit events on all your calendars"
9. Click "Allow" to grant permissions
10. You'll be redirected to `/oauth/google/callback` which shows a loading state
11. The callback page automatically:
    - Extracts OAuth tokens from URL hash
    - Validates the state parameter (CSRF protection)
    - Calls Appwrite function to securely store the token
    - Redirects back to the Calendar page
12. A success message should appear: "Calendar connected successfully!"
13. Open browser console (F12) to see OAuth details logged

### Testing Microsoft Outlook

**Prerequisites:**
1. Complete the Microsoft OAuth setup (see Environment Configuration above)
2. Have a Microsoft account (personal Outlook.com/Hotmail/Live OR work/school Office 365)

**Steps to Test:**
1. Start the development server: `bun run dev`
2. Log into the app with your credentials
3. Navigate to the Calendar page (`/calendar`)
4. Click "Add Calendar" button
5. Click "Microsoft Outlook" from the provider list
6. You'll be redirected to Microsoft's consent screen
7. Sign in with your Microsoft account (if not already signed in)
8. Review the permissions requested:
   - "Read your calendars"
   - "Have full access to your calendars"
   - "Read your profile"
   - "Maintain access to data you have given it access to"
9. Click "Accept" to grant permissions
10. You'll be redirected to `/oauth/microsoft/callback` which shows a loading state
11. The callback page automatically:
    - Extracts OAuth tokens from URL hash (includes access_token and id_token)
    - Validates the state parameter (CSRF protection)
    - Calls Appwrite function to securely store the token
    - Redirects back to the Calendar page
12. A success message should appear: "Calendar connected successfully!"
13. Open browser console (F12) to see OAuth details logged

**Account Types Supported:**
- ✅ Personal Microsoft accounts (Outlook.com, Hotmail.com, Live.com)
- ✅ Work or school accounts (Office 365, Azure AD)
- ✅ Both types when using `VITE_MICROSOFT_TENANT=common` (default)

### What Happens Behind the Scenes
1. **State Generation**: A random CSRF token is generated and stored in localStorage
2. **URL Construction**: OAuth URL is built with query parameters (client ID, scopes, state, etc.)
3. **Redirect**: Browser navigates to Google's OAuth endpoint
4. **Google Authorization**: User grants/denies permissions on Google's consent screen
5. **Callback Redirect**: Google redirects to `/oauth/google/callback` with access token in URL hash fragment
6. **Callback Page Processing**:
   - Displays loading state while processing
   - Extracts `access_token`, `token_type`, `expires_in`, `scope`, and `state` from URL hash
   - Validates state parameter matches stored value (CSRF protection)
   - Calls `storeCalendarToken()` Appwrite function to securely save the token
   - Shows success/error state
   - Redirects back to Calendar page
7. **Token Storage**: Access token is securely stored in Appwrite database via function
8. **Scope Verification**: App verifies which permissions were granted

### Viewing the Access Token
Open browser console and run:
```javascript
localStorage.getItem('google-access-token')
```

### Token Information
- **Expiry**: Check `google-token-expiry` in localStorage
- **Scopes**: Check `google-scopes` in localStorage
- **Lifetime**: Typically 1 hour (3600 seconds)

### OAuth Callback Flow Implementation

The `/oauth/google/callback` route provides a seamless OAuth callback experience:

**Features:**
- ✅ Protected route (requires authentication)
- ✅ Loading state while processing OAuth response
- ✅ Automatic extraction of OAuth parameters from URL hash
- ✅ CSRF protection via state validation
- ✅ Calls Appwrite function to securely store tokens
- ✅ Success/error states with visual feedback
- ✅ Automatic redirect back to Calendar page
- ✅ Error handling with user-friendly messages

**Parameters Extracted:**
- `access_token` - OAuth access token for API calls
- `token_type` - Token type (usually "Bearer")
- `expires_in` - Token expiration time in seconds
- `scope` - Granted permissions/scopes
- `state` - CSRF protection token

**User Experience:**
1. User sees loading spinner: "Connecting Calendar..."
2. Backend processes and stores token securely
3. Success checkmark: "Success! Your calendar has been connected"
4. Auto-redirect to Calendar page (1 second delay)
5. On error: Shows error message and redirects after 3 seconds

### Next Steps for Production
⚠️ **Important**: OAuth tokens are now stored via Appwrite Function. Additional security steps:
1. ✅ Tokens sent to backend function (implemented)
2. ✅ OAuth callback page with loading states (implemented)
3. ✅ User authentication verified via session cookies (implemented)
4. 🔒 Encrypt tokens before storing in database (TODO - use crypto library)
5. 🔄 Implement token refresh mechanism
6. 📊 Fetch calendar events via backend function (TODO)
7. 🛡️ Add rate limiting and error handling

## Appwrite Functions & Authentication

### How Session Authentication Works

**Client Side (Frontend):**
1. User logs in via `account.createEmailPasswordSession()`
2. Appwrite creates a JWT token stored in HTTP-only cookie
3. Cookie is automatically sent with all requests (including function calls)

**Server Side (Functions):**
1. Function receives request with authentication headers
2. Headers include: `x-appwrite-user-id`, `x-appwrite-user-jwt`, `x-appwrite-session-id`
3. Function validates user is authenticated
4. Function performs authorized operations

### Function Authentication Example

```typescript
// TypeScript version with types
interface AppwriteFunctionContext {
  req: {
    body: string | object;
    headers: Record<string, string>;
  };
  res: {
    json: (data: any, statusCode?: number) => void;
  };
  log: (message: string) => void;
  error: (message: string) => void;
}

export default async ({ req, res, log, error }: AppwriteFunctionContext) => {
  // 1. Extract user ID from headers (automatically added by Appwrite)
  const userId = req.headers['x-appwrite-user-id']
  
  // 2. Check authentication
  if (!userId) {
    return res.json({
      success: false,
      message: 'Unauthorized - Please log in'
    }, 401)
  }
  
  // 3. User is authenticated - safe to proceed
  log(`Processing request for user: ${userId}`)
  
  // 4. Perform user-specific operations
  // The userId ensures data is isolated per user
}
```

### Calling Functions from Frontend

```typescript
import { functions } from './lib/functions'

// Automatically includes session cookie
const result = await storeCalendarToken({
  provider: 'google',
  accessToken: token,
  scope: 'calendar.readonly',
  expiresIn: '3600'
})
```

### Security Benefits

✅ **Automatic Authentication** - No need to manually pass tokens
✅ **HTTP-Only Cookies** - Protected from XSS attacks
✅ **CSRF Protection** - Built-in security measures
✅ **JWT Validation** - Appwrite validates all tokens
✅ **User Isolation** - Each user can only access their own data
✅ **Session Management** - Automatic expiration and refresh

### "Failed to connect to Appwrite"
- Check Appwrite is running: `docker-compose ps`
- Verify endpoint: `http://localhost/v1`
- Check Docker containers are healthy

### "user_session_already_exists"
- Use the logout page (`/auth/logout`) to properly clear sessions
- This clears both local state and Appwrite session
- Prevents duplicate session errors

### Magic URL emails not sending
- Configure SMTP in Appwrite `.env` file (root directory)
- Or use Appwrite console to view sent emails
- Check spam folder

### CORS errors
- Appwrite automatically handles CORS for localhost
- For production, add your domain in Appwrite console

### "Connection refused" error in functions
- This occurs when functions try to connect to `localhost` from inside Docker containers
- **Solution**: Use the internal Docker service name `http://appwrite/v1` as the endpoint
- Ensure the function has the correct scopes in `appwrite.config.json`:
  - `databases.read` for reading from database
  - `databases.write` for writing to database
  - `users.read` for accessing user information
- Verify the API key is set in environment variables (not from request headers)
- Redeploy the function after configuration changes: `appwrite push functions`

## Next Steps

### Authentication Enhancements
- Implement password reset functionality
- Set up user profile management
- Configure email templates
- Add role-based access control

### Calendar Provider Integration
- **Google Calendar OAuth** ✅ Implemented
  - OAuth 2.0 implicit grant flow
  - CSRF protection with state parameter
  - Scope validation
  - Access token storage via Appwrite function
  - Secure backend token storage
- **Microsoft Outlook OAuth** ✅ Implemented
  - Microsoft Identity Platform v2.0
  - OAuth 2.0 implicit grant flow
  - Supports personal and work/school accounts
  - CSRF protection with state parameter
  - Scope validation (Calendars.Read, Calendars.ReadWrite, User.Read, offline_access)
  - Access token storage via Appwrite function
  - Secure backend token storage
- **Backend Integration** - Next Steps
  - ✅ Token storage via Appwrite function (implemented)
  - 🔒 Implement token encryption before database storage
  - 🔄 Implement token refresh mechanism
  - ✅ Validate tokens server-side (implemented)
  - ⏱️ Handle token expiration gracefully
- **Fetch and Display Events**
  - Use Google Calendar API to fetch events
  - Use Microsoft Graph API to fetch events
  - Parse and normalize event data from different providers
  - Display events in calendar UI
  - Handle timezone conversions
- **Additional Providers**
  - Add Apple Calendar support
  - Support multiple connected calendars per user
  - Allow users to disconnect/reconnect providers
- **Event Operations**
  - Support for read/write operations on connected calendars
  - Create, update, delete events
  - Sync bidirectionally
  - Handle conflicts and duplicate events

### Calendar Features
- Calendar event creation and management
- Date picker and calendar UI
- Event reminders and notifications
- Calendar sharing and collaboration
- Multi-calendar view with provider filtering
