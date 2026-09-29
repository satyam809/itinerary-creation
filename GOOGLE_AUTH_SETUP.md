# Itinerary System

The Next.js app is the UI. Sign-in, sign-up, itineraries, and third-party calls run in the NestJS API (`itinerary-creation-backend`).

## Setup

1. Install and start the API (see that project's README). It uses port `3001`.
2. In this project, set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env`.
3. Run `npm install` and `npm run dev`.

## Google OAuth

In Google Cloud Console, keep this authorized redirect URI:

`http://localhost:3000/api/auth/callback/google`

The Next.js app proxies that path to the API. Put the client id and secret in the API `.env`, not in this project.

## Sign-in

- Email and password: `POST /auth/register` and `POST /auth/login` on the API
- Google: the Sign in with Google button sends the browser to the API, which returns a token to `/auth/callback`
