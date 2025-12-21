# Calendar App Frontend

A modern calendar application built with React, TypeScript, Vite, and Appwrite. Supports connecting to cloud calendar providers like Google Calendar.

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Edit .env and add your configuration

# Start development server
bun run dev
```

## Features

- 🔐 **Authentication**: Email/password and passwordless magic link login
- 📅 **Google Calendar Integration**: OAuth 2.0 to connect Google Calendar
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 🔒 **Protected Routes**: Secure calendar views requiring authentication
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **React Router** - Client-side routing
- **Appwrite** - Backend as a Service
- **Google OAuth 2.0** - Calendar integration

## Configuration

See the main `documentation.md` in the project root for detailed setup instructions including:

- Appwrite configuration
- Google OAuth 2.0 setup
- Environment variables
- Troubleshooting guide

## Development

```bash
bun run dev      # Start dev server
bun run build    # Build for production
bun run lint     # Run ESLint
```

## Documentation

For complete documentation, see `/documentation.md` in the project root.
