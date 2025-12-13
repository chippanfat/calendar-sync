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
```

**Getting your Project ID:**
1. Start Appwrite with `docker-compose up -d` from the root directory
2. Access Appwrite Console at `http://localhost/console`
3. Create a new project or use an existing one
4. Copy the Project ID from the project settings
5. Make sure Email/Password and Magic URL authentication methods are enabled in Auth settings

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

The app uses Appwrite for authentication with two methods enabled:

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
- `/calendar` - Calendar view (protected, requires authentication)
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
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Navigation.tsx   # Main navigation bar
│   │   └── ProtectedRoute.tsx # Route protection wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── lib/
│   │   ├── appwrite.ts      # Appwrite client configuration
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx    # Email/password login
│   │   │   ├── Register.tsx # Account registration
│   │   │   ├── MagicURL.tsx # Magic link authentication
│   │   │   └── Logout.tsx   # Logout with session cleanup
│   │   ├── Home.tsx         # Landing page
│   │   ├── Calendar.tsx     # Calendar view (protected)
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
- Verify `VITE_APPWRITE_PROJECT_ID` is set correctly
- Restart dev server after changing `.env`

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
- Add OAuth providers (Google, GitHub, etc.)
- Set up user profile management
- Configure email templates
- Add role-based access control

### Calendar Features
- Calendar event creation and management
- Date picker and calendar UI
- Event reminders and notifications
- Calendar sharing and collaboration
- Integration with external calendar services
