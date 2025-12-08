# Itinerary System

A Next.js application with Google OAuth authentication.

## Setup Instructions

### 1. Install Dependencies

First, install the required packages:

```bash
npm install next-auth@beta
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already
6. Set the application type to **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
8. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Update the `.env.local` file with your credentials:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

To generate a secure `NEXTAUTH_SECRET`, run:

```bash
openssl rand -base64 32
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## Features

- ✅ Google OAuth authentication
- ✅ Protected routes
- ✅ User session management
- ✅ Sign in/Sign out functionality
- ✅ Responsive design with Tailwind CSS

## Project Structure

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # Auth API route handler
│   ├── components/
│   │   └── AuthProvider.tsx              # Session provider wrapper
│   ├── login/
│   │   └── page.tsx                      # Login page
│   ├── layout.tsx                        # Root layout with AuthProvider
│   └── page.tsx                          # Home page (protected)
├── auth.ts                               # NextAuth configuration
└── .env.local                            # Environment variables
```

## Authentication Flow

1. User visits the home page
2. If not authenticated, they see a sign-in prompt
3. Click "Sign In" to go to `/login`
4. Click "Sign in with Google" to authenticate
5. After successful authentication, redirected to home page
6. User info is displayed with sign-out option

## Next Steps

- Add database integration for user management
- Implement itinerary CRUD operations
- Add more OAuth providers (GitHub, Facebook, etc.)
- Set up protected API routes
- Add role-based access control
