# Production Readiness Audit Report

**Date:** 2024-12-19  
**Project:** Cariusb Site (Next.js + Supabase)  
**Status:** ⚠️ **NEEDS ATTENTION** - Several critical and important issues found

---

## Executive Summary

The project has a solid foundation with good architecture, but several **critical security issues** and **production readiness gaps** need to be addressed before deployment.

### Critical Issues (Must Fix):
1. ❌ **Service Role Key Fallback** - Using ANON_KEY as fallback for service operations
2. ❌ **RLS Policies Incomplete** - user_usage table missing UPDATE/INSERT policies
3. ❌ **Profile Data Missing** - full_name, country, city not collected on registration
4. ❌ **n8n Webhook Security** - No secret verification or IP whitelisting
5. ❌ **API Input Validation** - Missing request body validation

### Important Issues (Should Fix):
6. ⚠️ **Console Logging** - Error logs may expose sensitive data in production
7. ⚠️ **Error Status Codes** - Some APIs don't use proper HTTP status codes
8. ⚠️ **Profile Page Missing** - No UI to show plan and usage data to users

### Best Practices (Nice to Have):
9. 💡 **Environment Variable Validation** - No runtime validation
10. 💡 **Rate Limiting** - No API rate limiting
11. 💡 **Request Timeout** - Hardcoded timeout values

---

## Detailed Findings

### 1. ❌ CRITICAL: Service Role Key Fallback

**Location:** `app/api/chat/route.ts:11`

```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

**Issue:** Using ANON_KEY as fallback defeats RLS security. Service role key bypasses all RLS policies, which is necessary for server-side operations, but using ANON_KEY as fallback means:
- RLS policies will block operations
- Operations will fail silently or throw errors
- Security model is compromised

**Severity:** 🔴 **CRITICAL**

**Fix:**
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

**Action Required:**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (and production env)
- Never commit this key to repository
- Add validation at startup

---

### 2. ❌ CRITICAL: RLS Policies Incomplete

**Location:** `supabase-migrations/user_usage.sql:31-34`

**Issue:** Only SELECT policy exists. Server-side operations (UPDATE/INSERT) require service role key, but RLS should still be properly configured for:
- Client-side reads (should be scoped to user)
- Guest user operations (should be handled differently)

**Current Policy:**
```sql
create policy "Users can read own usage"
  on user_usage
  for select
  using (auth.uid() = user_id);
```

**Problems:**
1. Guest users can't read their own usage (no `guest_id` check)
2. No UPDATE/INSERT policies (relies on service role bypass)
3. No policy for guest_id-based operations

**Severity:** 🔴 **CRITICAL**

**Fix:**
```sql
-- Allow authenticated users to read their own usage
create policy "Users can read own usage"
  on user_usage
  for select
  using (auth.uid() = user_id);

-- Allow service role to manage all usage (for server-side)
-- Note: Service role bypasses RLS, so this is implicit

-- Guest users: handled server-side only (no client-side access)
-- Guest usage is managed via service role key in API route
```

**Better Approach:** Since guest users are managed server-side, current approach is acceptable IF service role key is properly set. However, consider adding:
- Policy for guest_id reads (if needed client-side)
- Explicit documentation that guest operations are server-only

**Action Required:**
- Document that guest operations are server-side only
- Ensure service role key is properly configured
- Consider adding guest_id read policy if client-side access needed

---

### 3. ❌ CRITICAL: Profile Data Missing

**Location:** `app/auth/register/page.tsx:57-62`

**Issue:** Registration only collects email and password. Profile insert only includes:
- `user_id`
- `email`
- `plan: 'free'`

**Missing Fields:**
- `full_name`
- `country`
- `city`

**Current Code:**
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .upsert(
    { user_id: user.id, email: user.email, plan: 'free' },
    { onConflict: 'user_id' }
  );
```

**Severity:** 🔴 **CRITICAL** (if these fields are required by business logic)

**Fix:**
1. Add form fields to registration page
2. Collect data and pass to upsert
3. Update Google OAuth callback to extract name from user metadata

**Action Required:**
- Add form fields for full_name, country, city
- Update profile upsert to include these fields
- Update Google OAuth callback to extract name from Google profile

---

### 4. ❌ CRITICAL: n8n Webhook Security

**Location:** `app/api/chat/route.ts:14, 50-55`

**Issue:** Webhook URL is hardcoded and no security measures:
- No secret verification
- No IP whitelisting
- No request signing
- Hardcoded URL (should be env variable)

**Current Code:**
```typescript
const N8N_WEBHOOK = "https://tahamertsen.app.n8n.cloud/webhook/cariusb_1";
// ...
const res = await fetch(N8N_WEBHOOK, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
  signal: controller.signal,
});
```

**Severity:** 🔴 **CRITICAL**

**Security Risks:**
1. Anyone who knows the webhook URL can call it
2. No authentication/authorization
3. No rate limiting
4. Potential for abuse/DDoS

**Fix:**
```typescript
// 1. Move to environment variable
const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL!;
const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET!;

// 2. Add secret verification
const payloadWithSecret = {
  ...payload,
  secret: N8N_SECRET, // Or use Authorization header
  timestamp: Date.now(),
};

// 3. Add HMAC signature (recommended)
import crypto from 'crypto';
const signature = crypto
  .createHmac('sha256', N8N_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

const res = await fetch(N8N_WEBHOOK, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "X-Webhook-Signature": signature,
    "X-Webhook-Timestamp": Date.now().toString(),
  },
  body: JSON.stringify(payload),
});
```

**n8n Side:** Configure webhook to verify signature/timestamp

**Action Required:**
- Move webhook URL to `N8N_WEBHOOK_URL` env variable
- Add `N8N_WEBHOOK_SECRET` env variable
- Implement HMAC signature verification
- Configure n8n webhook to verify signatures

---

### 5. ❌ CRITICAL: API Input Validation

**Location:** `app/api/chat/route.ts:72-87`

**Issue:** Request body is parsed without validation:
- No schema validation
- No type checking
- No required field validation
- Potential for injection/abuse

**Current Code:**
```typescript
export async function POST(req: NextRequest) {
  const body = await req.json(); // No validation!
  const {
    conversationId,
    mode,
    messages,
    message,
    user_id,
    session_id,
    lang,
    deepsearch,
    user_plan,
    is_guest,
    user_id_raw,
  } = body;
```

**Severity:** 🔴 **CRITICAL**

**Fix:**
```typescript
import { z } from 'zod'; // Add zod package

const ChatRequestSchema = z.object({
  conversationId: z.string().min(1),
  mode: z.enum(['BICYCLE', 'AUTO', 'MOTO', 'TECH']),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  message: z.string().min(1),
  user_id: z.string(),
  session_id: z.string(),
  lang: z.string().default('EN'),
  deepsearch: z.enum(['off', 'auto', 'on']).default('auto'),
  user_plan: z.enum(['guest', 'free', 'pro']),
  is_guest: z.boolean(),
  user_id_raw: z.string().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ChatRequestSchema.parse(body);
    // Use validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'validation_error', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

**Action Required:**
- Add `zod` package: `npm install zod`
- Create request schema
- Validate all API routes
- Return proper 400 errors for invalid requests

---

### 6. ⚠️ IMPORTANT: Console Logging in Production

**Location:** `app/api/chat/route.ts:176, 242`

**Issue:** `console.error` logs sensitive data:
- Error messages may contain stack traces
- May expose internal structure
- Should use structured logging service

**Current Code:**
```typescript
console.error('Usage check failed:', error);
console.error('Failed to increment usage:', error);
```

**Severity:** 🟡 **IMPORTANT**

**Fix:**
```typescript
// Use environment-aware logging
const logError = (message: string, error: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  } else {
    // Use structured logging service (e.g., Sentry, LogRocket)
    // logger.error(message, { error: error.message, stack: error.stack });
  }
};
```

**Action Required:**
- Set up structured logging (Sentry, LogRocket, etc.)
- Replace console.error with logger
- Never log sensitive data (tokens, keys, user data)

---

### 7. ⚠️ IMPORTANT: Error Status Codes

**Location:** `app/api/chat/route.ts` and other API routes

**Issue:** Some error cases don't use proper HTTP status codes:
- 402 is used for limit exceeded (non-standard, but acceptable)
- Missing 400 for validation errors
- Missing 401 for authentication errors
- Missing 429 for rate limiting

**Severity:** 🟡 **IMPORTANT**

**Current Status:**
- ✅ 402 for limit exceeded (acceptable)
- ✅ 500 for provider check errors
- ❌ No 400 for validation errors
- ❌ No 401 for auth errors
- ❌ No 429 for rate limiting

**Fix:** Add proper status codes:
```typescript
// Validation error
return NextResponse.json({ error: 'validation_error' }, { status: 400 });

// Authentication error
return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

// Rate limiting
return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429 });
```

**Action Required:**
- Review all API routes
- Add proper status codes
- Document error responses

---

### 8. ⚠️ IMPORTANT: Profile Page Missing

**Location:** No profile page exists

**Issue:** Users can't see:
- Current plan
- Usage statistics (messages_used, deepsearch_used)
- Plan limits
- Upgrade options

**Severity:** 🟡 **IMPORTANT** (UX issue)

**Fix:** Create `app/profile/page.tsx`:
```typescript
'use client';
import { useEffect, useState } from 'react';
import { getCurrentPlan, getUsageCount } from '@/lib/utils/usage';
import { getPlanLimits } from '@/lib/planConfig';
import Link from 'next/link';

export default function ProfilePage() {
  const [plan, setPlan] = useState('guest');
  const [usage, setUsage] = useState({ messagesUsed: 0, deepsearchUsed: 0 });
  const [limits, setLimits] = useState({ messages_per_day: 0, deepsearch_per_day: 0 });

  useEffect(() => {
    const load = async () => {
      const currentPlan = await getCurrentPlan();
      const { messagesUsed, deepsearchUsed } = await getUsageCount();
      const planLimits = getPlanLimits(currentPlan);
      setPlan(currentPlan);
      setUsage({ messagesUsed, deepsearchUsed });
      setLimits(planLimits);
    };
    load();
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      <div>Plan: {plan}</div>
      <div>Messages: {usage.messagesUsed} / {limits.messages_per_day}</div>
      <div>Deepsearch: {usage.deepsearchUsed} / {limits.deepsearch_per_day}</div>
      {plan !== 'pro' && <Link href="/billing">Upgrade</Link>}
    </div>
  );
}
```

**Action Required:**
- Create profile page
- Show plan and usage
- Add upgrade CTA

---

### 9. 💡 BEST PRACTICE: Environment Variable Validation

**Location:** Application startup

**Issue:** No runtime validation of required environment variables:
- Missing variables cause runtime errors
- Hard to debug in production

**Severity:** 🟢 **BEST PRACTICE**

**Fix:** Create `lib/env.ts`:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
});
```

**Action Required:**
- Add env validation
- Fail fast on startup if required vars missing

---

### 10. 💡 BEST PRACTICE: Rate Limiting

**Location:** API routes

**Issue:** No rate limiting on API endpoints:
- Potential for abuse
- No protection against DDoS
- Guest users can spam requests

**Severity:** 🟢 **BEST PRACTICE**

**Fix:** Implement rate limiting:
```typescript
// Using Upstash Redis or similar
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(req: NextRequest) {
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429 }
    );
  }
  // ... rest of handler
}
```

**Action Required:**
- Research rate limiting solution (Upstash, Vercel Edge Config, etc.)
- Implement per-user/IP rate limiting
- Add rate limit headers to responses

---

### 11. 💡 BEST PRACTICE: Request Timeout Configuration

**Location:** `app/api/chat/route.ts:15`

**Issue:** Hardcoded timeout value:
```typescript
const TIMEOUT_MS = 40_000; // 40 saniye
```

**Severity:** 🟢 **BEST PRACTICE**

**Fix:** Move to environment variable:
```typescript
const TIMEOUT_MS = parseInt(process.env.API_TIMEOUT_MS || '40000', 10);
```

**Action Required:**
- Move timeout to env variable
- Document recommended values

---

## ✅ What's Working Well

1. ✅ **Supabase Client Setup** - Single source of truth in `lib/supabaseClient.ts`
2. ✅ **Plan Limits System** - Well-structured with `planConfig.ts`
3. ✅ **Usage Tracking** - Proper separation of guest and authenticated users
4. ✅ **Deepsearch Toggle** - Good global state management with Zustand
5. ✅ **Error Handling in UI** - Limit banners show appropriate messages
6. ✅ **Google OAuth Flow** - Properly implemented with callback handler
7. ✅ **Database Schema** - Well-designed with proper constraints and indexes
8. ✅ **TypeScript Types** - Good type safety throughout

---

## Priority Action Items

### Before Production (Critical):

1. **Fix Service Role Key Fallback** (1 hour)
   - Add `SUPABASE_SERVICE_ROLE_KEY` to env
   - Remove ANON_KEY fallback
   - Add validation

2. **Add n8n Webhook Security** (2 hours)
   - Move URL to env variable
   - Add secret verification
   - Implement HMAC signing

3. **Add API Input Validation** (2 hours)
   - Install zod
   - Create schemas
   - Validate all routes

4. **Complete RLS Policies** (1 hour)
   - Document guest user handling
   - Verify service role operations

5. **Add Profile Data Collection** (3 hours)
   - Add form fields
   - Update registration
   - Update OAuth callback

### Before Production (Important):

6. **Replace Console Logging** (2 hours)
   - Set up Sentry/LogRocket
   - Replace console.error
   - Add structured logging

7. **Add Proper Status Codes** (1 hour)
   - Review all routes
   - Add 400/401/429 as needed

8. **Create Profile Page** (3 hours)
   - Show plan and usage
   - Add upgrade CTA

### Post-Launch (Best Practices):

9. **Environment Variable Validation** (1 hour)
10. **Rate Limiting** (4 hours)
11. **Request Timeout Config** (30 minutes)

---

## Testing Checklist

Before deploying to production, verify:

- [ ] Service role key is set in production environment
- [ ] n8n webhook has secret verification enabled
- [ ] All API routes validate input
- [ ] Console errors are replaced with structured logging
- [ ] Profile data collection works for email/password signup
- [ ] Profile data collection works for Google OAuth
- [ ] RLS policies allow proper access
- [ ] Guest users can't access other users' data
- [ ] Rate limiting is configured (if implemented)
- [ ] Environment variables are validated on startup

---

## Security Checklist

- [ ] No sensitive keys in client-side code
- [ ] Service role key only in server-side code
- [ ] Webhook endpoints have authentication
- [ ] Input validation on all API routes
- [ ] RLS policies properly configured
- [ ] Error messages don't expose sensitive data
- [ ] Rate limiting implemented
- [ ] CORS properly configured (if needed)

---

## Conclusion

The project has a solid foundation but requires **critical security fixes** before production deployment. The most urgent issues are:

1. Service role key fallback (security risk)
2. n8n webhook security (abuse risk)
3. API input validation (injection risk)
4. Profile data collection (business requirement)

Estimated time to production-ready: **12-16 hours** of focused development.

**Recommendation:** Address all critical issues before launch. Important and best practice issues can be addressed post-launch with proper monitoring.




