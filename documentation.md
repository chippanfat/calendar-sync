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

VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/calendar
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
   - Add authorized redirect URIs: `http://localhost:5173/calendar`
   - Click "Create"
5. Copy the Client ID and paste it into your `.env` file as `VITE_GOOGLE_CLIENT_ID`
6. Note: For production, use your production domain instead of localhost

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
  - Access tokens stored locally (should be moved to backend in production)
  - Token validation and refresh to be implemented
- **Microsoft Outlook** - OAuth integration coming soon
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
- `CalendarProvider` enum defines supported providers
- `createCalendarProviderHandler()` factory returns provider-specific config
- Each provider handler includes:
  - `isConfigured()` - Checks if env variables are set
  - `getConfigError()` - Returns user-friendly error message
  - `initiateOAuth()` - Starts the OAuth flow
- View components use the factory, keeping OAuth logic separate


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
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx    # Email/password login
│   │   │   ├── Register.tsx # Account registration
│   │   │   ├── MagicURL.tsx # Magic link authentication
│   │   │   └── Logout.tsx   # Logout with session cleanup
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
- Ensure the redirect URI in Google Cloud Console matches exactly
- Should be: `http://localhost:5173/calendar` (for development)
- Check that authorized JavaScript origins includes: `http://localhost:5173`
- For production, use your production domain

### "State mismatch" error
- This indicates a potential CSRF attack
- Clear browser localStorage and try again
- Make sure you're not opening multiple OAuth flows simultaneously

## Testing Google Calendar Integration

### Prerequisites
1. Complete the Google OAuth setup (see Environment Configuration above)
2. Have a Google account with at least one calendar

### Steps to Test
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
10. You'll be redirected back to the Calendar page
11. A success message should appear: "Successfully connected to Google Calendar!"
12. Open browser console (F12) to see OAuth details logged

### What Happens Behind the Scenes
1. **State Generation**: A random CSRF token is generated and stored
2. **URL Construction**: OAuth URL is built with query parameters (client ID, scopes, state, etc.)
3. **Redirect**: Browser navigates to Google's OAuth endpoint
4. **Google Authorization**: User grants/denies permissions on Google's consent screen
5. **Callback**: Google redirects back with access token in URL hash fragment
6. **Validation**: App validates state parameter matches (CSRF protection)
7. **Token Storage**: Access token is stored in localStorage (temporary)
8. **Scope Check**: App verifies which permissions were granted

### Viewing the Access Token
Open browser console and run:
```javascript
localStorage.getItem('google-access-token')
```

### Token Information
- **Expiry**: Check `google-token-expiry` in localStorage
- **Scopes**: Check `google-scopes` in localStorage
- **Lifetime**: Typically 1 hour (3600 seconds)

### Next Steps for Production
⚠️ **Important**: Current implementation stores tokens in localStorage for demonstration. In production:
1. Send access token to your backend immediately
2. Store tokens encrypted in your database
3. Never expose tokens in client-side code
4. Implement token refresh mechanism
5. Use backend to make Calendar API calls
6. Add proper error handling and retry logic

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

## Next Steps

### Authentication Enhancements
- Implement password reset functionality
- Set up user profile management
- Configure email templates
- Add role-based access control

### Calendar Provider Integration
- **Google Calendar OAuth** ✅ Implemented (Frontend)
  - OAuth 2.0 implicit grant flow
  - CSRF protection with state parameter
  - Scope validation
  - Access token storage in localStorage
- **Backend Integration** - Next Steps
  - Move token storage from localStorage to secure backend
  - Implement token refresh mechanism
  - Validate tokens server-side
  - Encrypt stored tokens
  - Handle token expiration gracefully
- **Fetch and Display Events**
  - Use Google Calendar API to fetch events
  - Parse and normalize event data
  - Display events in calendar UI
  - Handle timezone conversions
- **Additional Providers**
  - Implement Microsoft OAuth (Outlook/Office 365)
  - Add Apple Calendar support
  - Support multiple connected calendars per user
- **Event Operations**
  - Support for read/write operations on connected calendars
  - Create, update, delete events
  - Sync bidirectionally

### Calendar Features
- Calendar event creation and management
- Date picker and calendar UI
- Event reminders and notifications
- Calendar sharing and collaboration
- Multi-calendar view with provider filtering
