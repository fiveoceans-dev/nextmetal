# Synthwave Interface Forge

This project is a React application built with [Vite](https://vitejs.dev/) and [Tailwind CSS](https://tailwindcss.com/). It uses **Supabase** edge functions to manage authentication, user profiles and a small points system.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-git-url>
   cd synthwave-interface-forge
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   Create an `.env` file in the project root and add the following values:
   ```env
   SUPABASE_URL=<your-supabase-project-url>
   SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   WALLETCONNECT_PROJECT_ID=<walletconnect-project-id>
   ```
   These values are used by the Supabase functions and the frontend.
4. **Start the development server**
   ```bash
   npm run dev
   ```

## Supabase Functions

The `supabase/functions` directory contains two edge functions:

- `auth` – handles user registration, login and magic link generation.
- `user-data` – returns profile information, manages referral codes and adds points.

To run them locally you need the [Supabase CLI](https://supabase.com/docs/guides/cli). Once installed, run:

```bash
supabase start
```

This will start a local Supabase instance and serve the functions from `http://localhost:54321/functions/v1`.

## Building for Production

To create a production build run:
```bash
npm run build
```
This will output static files to the `dist` directory.

## Technologies Used

- React + TypeScript
- Tailwind CSS and shadcn/ui components
- Supabase (database and edge functions)

