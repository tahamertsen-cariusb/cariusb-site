# orb-chat

Where intelligence operates.

## Tech
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Authentication + Database)
- Edge API route with mock/optional OpenAI streaming

## Getting Started
1. Install dependencies:
```bash
npm install
```
2. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xhbppxakbswgnriklwlm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
OPENAI_API_KEY=your_key_here
```

### Supabase Setup
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and set it as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon/public** key (under "Project API keys") and set it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Note: The anon key is safe to expose in client-side code (protected by RLS)

3. Run dev server:
```bash
npm run dev
```
Open http://localhost:3000

## Structure
- `app/(marketing)/page.tsx`: Landing (hero + orb + mode selector + input)
- `app/chat/page.tsx`: Chat screen with streaming
- `app/pricing/page.tsx`: Pricing grid (Freeminium, Pro, Expert, Enterprise)
- `app/billing/page.tsx`: Billing page with Stripe Payment Links
- `app/auth/login`, `app/auth/register`: Supabase auth (email/password + Google OAuth)
- `app/auth/callback`: OAuth callback handler
- `app/dashboard/page.tsx`: Recent conversations list (protected route)
- `app/api/chat/route.ts`: Streaming endpoint (mock without key; OpenAI if key)
- `components/*`: Navbars, ModeSelector, InputBar, MessageBubble, OrbPulse, GoogleLoginButton, DashboardGuard
- `lib/supabaseClient.ts`: Single Supabase client import point
- `lib/chat/*`, `lib/utils.ts`: Types, client helpers, utils
- `styles/globals.css`: Tailwind base + utilities

## Environment Variables

### Client-Side (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (required)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key (required)
- `NEXT_PUBLIC_APP_URL`: Base URL for OAuth redirects (defaults to localhost:3000)
- `OPENAI_API_KEY`: Optional - if set, responses stream from OpenAI (gpt-4o-mini). If not set, a 2–3 chunk mock stream is returned.

### Server-Side (Server-Only)
- `SUPABASE_URL`: Supabase project URL (same as NEXT_PUBLIC_SUPABASE_URL, for server usage)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (required, server-only, **no fallback to anon key**)
- `N8N_WEBHOOK_URL`: n8n webhook URL (required, e.g., `https://your-instance.app.n8n.cloud/webhook/chat`)
- `N8N_WEBHOOK_SECRET`: n8n webhook secret (required, must be a strong random string)
- `REQUEST_TIMEOUT_MS`: Request timeout in milliseconds (default: 40000, 40 seconds)

### Example `.env.local`
```env
# Client-side (public)
NEXT_PUBLIC_SUPABASE_URL=https://xhbppxakbswgnriklwlm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-side (private)
SUPABASE_URL=https://xhbppxakbswgnriklwlm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/chat
N8N_WEBHOOK_SECRET=change_this_to_strong_random
REQUEST_TIMEOUT_MS=40000

# Optional
OPENAI_API_KEY=your_key_here
```

## Security & Environment

### Service Role Key (SRK)
- **SRK fallback is removed** - The application will fail fast if `SUPABASE_SERVICE_ROLE_KEY` is not set
- Server-side code uses `lib/supabaseAdmin.ts` which requires the service role key
- Client-side code uses `lib/supabaseClient.ts` which only uses the anon key
- **No private keys are exposed to the client bundle**

### n8n Webhook Security
- **Secret is required** - All n8n webhook calls include the secret as a query parameter
- **Timeout is enforced** - Default 40 seconds, configurable via `REQUEST_TIMEOUT_MS`
- Webhook failures return HTTP 502 (Bad Gateway) with `upstream_failed` error

### Client vs Server Separation
- **Client**: Only uses `NEXT_PUBLIC_*` environment variables (anon key)
- **Server**: Uses server-only environment variables (service role key, webhook secrets)
- Environment validation runs on server boot to ensure required variables are present

### API Security
- `/api/chat` endpoint uses Zod validation for request body
- User authentication is verified from auth cookies (server-side)
- Guest users are identified by client-generated `guest_id` (stored in localStorage)
- Usage tracking is performed server-side using the admin client (bypasses RLS)

## Troubleshooting

### Google OAuth "Provider is not enabled" Error

If you see the error `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}` when clicking "Continue with Google":

1. **Check Provider Status**:
   - Visit `/auth/debug` page in your app
   - Click "Provider Check (Google)" button
   - Expected: `ok: true` and `location` contains `accounts.google.com`
   - If `ok: false` with `status: 400/422`, the provider is disabled or redirect URI is incorrect

2. **Enable Google Provider in Supabase**:
   - Go to Supabase Dashboard → **Authentication** → **Providers**
   - Enable **Google** provider
   - Add your Google OAuth Client ID and Secret
   - Save changes

3. **Configure Google OAuth Client**:
   - In Google Cloud Console → **APIs & Services** → **Credentials**
   - Add authorized redirect URI:
     ```
     https://xhbppxakbswgnriklwlm.supabase.co/auth/v1/callback
     ```
   - Note: Replace `xhbppxakbswgnriklwlm` with your actual Supabase project reference ID

4. **Configure Supabase Redirect URLs**:
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Set **Site URL** to: `http://localhost:3000` (or your production URL)
   - Add to **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (for production)

### Correct Project Reference
- **Current Project**: `xhbppxakbswgnriklwlm`
- If you see references to old projects (e.g., `wuadppqrfliazlqvpclq`), ensure `.env.local` uses the correct URL

### Testing OAuth Flow
1. Visit `/auth/debug` to verify provider status
2. Check `/api/auth/provider-check` endpoint response
3. If provider check fails, verify Supabase Dashboard settings

## Features

### Global Deepsearch Toggle
The application includes a global Deepsearch toggle (Off/Auto/On) available on both the **Landing** and **Chat** pages:

- **Off**: Disables deep search functionality
- **Auto**: Automatic deep search based on content (default)
- **On**: Enables deep search for all queries

**Global State Management:**
- Uses Zustand store (`store/useDeepsearch.ts`) for global state management
- Selection is persisted in `localStorage` with key `deepsearch_mode`
- State is synchronized across all pages (Landing → Chat)
- SSR-safe: defaults to `'auto'` during server-side rendering

**Component Usage:**
- Component: `components/deepsearch/DeepsearchToggle.tsx`
- Available sizes: `'sm'` (for Landing) and `'md'` (for Chat)
- Usage locations:
  - **Landing page**: Next to input bar (desktop) or below (mobile)
  - **Chat page**: Next to chat input bar

**API Integration:**
The selected deepsearch value is automatically included in `/api/chat` request payload sent to the n8n webhook via `useDeepsearchStore.getState().get()`.

**Payload Example:**
```json
{
  "message": "User's message",
  "user_id": "user@example.com",
  "session_id": "sess_abc123",
  "lang": "EN",
  "deepsearch": "auto",
  "user_plan": "free"
}
```

**Fallback Behavior:**
- If `deepsearch` is missing or invalid, the server defaults to `"auto"`
- Client-side validation ensures only valid values (`off`, `auto`, `on`) are sent
- Store validation prevents invalid values from being set

### Guest & Plan Limits System

The application supports guest users (non-authenticated) with limited chat access and automatic plan-based limits:

**Plan Types:**
- **Guest**: 5 messages per day, 1 deepsearch per day (automatic for non-authenticated users)
- **Free**: 100 messages per day, 10 deepsearch per day (default for new registrations)
- **Pro**: 2000 messages per day, 9999 deepsearch per day (effectively unlimited)

**Plan Configuration:**
- Defined in `lib/planConfig.ts` with `PLAN_LIMITS` object
- Access via `getPlanLimits(plan)` function
- Limits are checked server-side before processing each `/api/chat` request

**Usage Tracking:**
- Tracked in Supabase `user_usage` table (see `supabase-migrations/user_usage.sql`)
- Incremented after successful webhook call
- Automatically resets after 24 hours (period-based)
- Separate tracking for guest users (`guest_id`) and authenticated users (`user_id`)

**Guest User Flow:**
1. Non-authenticated users can access chat
2. `guest_id` generated and stored in `localStorage`
3. After 5 messages OR 1 deepsearch query, input is disabled and upgrade banner appears
4. User can register for free plan (100 messages/day, 10 deepsearch/day)

**Limit Types:**
- **Messages Limit**: Total number of chat messages per day
- **Deepsearch Limit**: Number of deepsearch-enabled queries per day (only counted when deepsearch is 'on')
- Both limits are checked before processing each request
- Limits reset automatically after 24 hours (based on `last_reset` timestamp)

**Limit Exceeded Handling:**
- Server returns HTTP 402 (Payment Required) with `limit_exceeded` error
- Frontend shows `LimitBanner` component with appropriate CTA
- Input bar is disabled when limit is reached
- Banner shows registration link for guests or billing link for free users

**Database Schema:**
```sql
-- See supabase-migrations/user_usage.sql for full schema
create table user_usage (
  id bigint primary key,
  user_id uuid,           -- For authenticated users
  guest_id text,          -- For guest users
  plan text,              -- 'guest', 'free', or 'pro'
  messages_used int,      -- Total messages sent today
  deepsearch_used int,    -- Deepsearch queries used today
  last_reset timestamptz  -- Last reset timestamp (24h window)
);
```

**New User Registration:**
- Automatically assigned `'free'` plan in `profiles` table
- Usage tracking starts fresh with free plan limits
- Guest usage history is not migrated (security/privacy)

## Design Notes
- Typography/spacing approximated via Tailwind; dark theme, glass surfaces.
- Mode selector is accessible segmented control.
- Deepsearch toggle is a compact 3-button group with glassmorphism styling.
- Input supports Enter to send, Shift+Enter for newline.

## Test
Run unit tests:
```bash
npm run test
```

## Figma Reference
- fileKey: `e2KUOgtEu6neF4184XgUTS`
- page: `landing (0:1)`




