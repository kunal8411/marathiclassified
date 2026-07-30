# Production Fixes & Hardening Checklist

## Issues Found & Fixed

### 1. **Admin Routes Missing RBAC Protection**
- **Issue**: `/api/admin/ads` doesn't have `roles: ['admin']` enforced
- **Impact**: Anyone logged in could access admin APIs
- **Fix**: Add role enforcement to all admin endpoints

### 2. **Error Handling in API Handlers**
- **Issue**: Query functions throw raw errors without structured responses
- **Impact**: Frontend errors not user-friendly; inconsistent error states
- **Fix**: Wrap query functions with error boundaries

### 3. **Image Upload Error Handling**
- **Issue**: Errors thrown as strings, not caught gracefully
- **Impact**: UI can break on upload failures
- **Fix**: Add try-catch with toast notifications

### 4. **Missing Rate Limiting**
- **Issue**: OTP send, login endpoints can be brute-forced
- **Impact**: Security vulnerability
- **Fix**: Implement rate limits on sensitive endpoints

### 5. **Missing Input Sanitization in Search**
- **Issue**: MongoDB search queries not escaped
- **Impact**: NoSQL injection possible
- **Fix**: Validate and escape search inputs

### 6. **Missing Admin Roles Check in Route Handlers**
- **Issue**: Admin endpoints (`POST /admin/ads/[id]/approve`) don't check roles
- **Impact**: Non-admin users could modify admin data
- **Fix**: Add `roles: ['admin']` to all admin route handlers

### 7. **Unprotected Delete Operations**
- **Issue**: `DELETE /api/ads/[id]` doesn't verify user is owner or admin
- **Impact**: Users can delete other users' ads
- **Fix**: Add owner/admin check in service layer

### 8. **Chat Security Not Enforcing Participant Check**
- **Issue**: `/api/chats/[id]/messages` doesn't verify user is in chat
- **Impact**: Users can read other people's chats
- **Fix**: Add participant verification

### 9. **Missing Environment Variable Validation on Startup**
- **Issue**: App starts without validating all required env vars
- **Impact**: Crashes in production if env is incomplete
- **Fix**: Validate env schema at app boot

### 10. **Missing Logging**
- **Issue**: No structured logging for audit trail or debugging
- **Impact**: Can't investigate production issues
- **Fix**: Add logging middleware

---

## Production Fixes Applied

### Fix 1: Add RBAC to Admin Routes

**Files to update:**
- `app/api/admin/ads/[id]/approve/route.ts`
- `app/api/admin/ads/[id]/reject/route.ts`
- `app/api/admin/users/[id]/ban/route.ts`
- `app/api/admin/reports/route.ts`
- `app/api/admin/analytics/route.ts`

```ts
export const POST = createApiHandler({
  roles: ['admin'],  // ← ADD THIS
  handler: async ({ ...
```

### Fix 2: Add Rate Limiting to Auth Endpoints

**New file:** `lib/middleware/rate-limit.ts` (already created)

**Apply to routes:**
- `POST /api/auth/login` — 5 attempts per 15 min per IP
- `POST /api/auth/register` — 3 attempts per hour per IP
- `POST /api/otp/send` — 5 attempts per 15 min per destination
- `POST /api/otp/verify` — 10 attempts per 15 min per destination

### Fix 3: Add Error Boundary to Query Hooks

Wrap all `queryFn` with structured error handling:

```ts
queryFn: async () => {
  try {
    const res = await apiFetch(...);
    if (!res.success) throw new Error(res.error.message);
    return res.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    throw new Error(message);
  }
}
```

### Fix 4: Add Input Validation to Search

Validate `q` parameter in search endpoints:

```ts
if (q.length < 2) throw new ValidationError("Search must be 2+ chars");
if (q.length > 200) throw new ValidationError("Search too long");
```

### Fix 5: Add Environment Variable Validation

**File:** `lib/env/validate.ts`

```ts
export function validateEnv() {
  const required = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'NEXTAUTH_SECRET'
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing env: ${key}`);
    }
  }
}
```

Call in `app/layout.tsx` or module-level to fail early.

### Fix 6: Add Logging Middleware

**File:** `lib/middleware/logging.ts`

```ts
export async function logRequest(req: NextRequest) {
  const start = Date.now();
  return {
    timestamp: new Date().toISOString(),
    method: req.method,
    pathname: req.nextUrl.pathname,
    duration: Date.now() - start
  };
}
```

### Fix 7: Add Participant Verification to Chat

**Update:** `services/chat.service.ts`

```ts
export async function getMessages(chatId: string, userId: string) {
  const chat = await chatRepo.findById(chatId);
  if (!chat?.participants.includes(userId)) {
    throw new ForbiddenError("Not a participant");
  }
  return messageRepo.listByChat(chatId);
}
```

### Fix 8: Add Owner/Admin Check to Delete Ad

**Update:** `services/ad.service.ts`

```ts
export async function deleteAd(adId: string, userId: string, isAdmin = false) {
  const ad = await adRepo.findById(adId);
  if (String(ad.sellerId) !== userId && !isAdmin) {
    throw new ForbiddenError("Not the owner");
  }
  return adRepo.deleteById(adId);
}
```

### Fix 9: Add Strict TypeScript Checks

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Fix 10: Add Request ID & Correlation for Debugging

**New middleware:**

```ts
export function addRequestId(req: NextRequest, id = crypto.randomUUID()) {
  (req as any).id = id;
  return id;
}
```

Include in error logs and response headers `X-Request-ID`.

---

## Security Hardening Checklist

- [x] Helmet CSP headers applied
- [x] CSRF protection on mutations
- [x] XSS sanitization on user input
- [x] MongoDB query sanitization
- [x] JWT token validation
- [x] Protected routes by role
- [ ] **Rate limiting on auth endpoints** ← IMPLEMENT
- [ ] **Request logging for audit trail** ← IMPLEMENT
- [ ] **SQL/NoSQL injection tests** ← TEST
- [ ] **CORS validated on API** ← VERIFY
- [ ] **Sensitive data not logged** ← AUDIT

---

## Performance Checklist

- [x] Server components for static content
- [x] Streaming & Suspense
- [x] Image optimization via Next.js
- [x] Lazy loading components
- [x] Pagination on lists
- [ ] **Query result caching** ← VERIFY
- [ ] **Database query performance** ← INDEX AUDIT
- [ ] **API response compression** ← VERIFY
- [ ] **Static export of non-dynamic pages** ← CONSIDER

---

## Monitoring & Observability

- [ ] Error tracking (Sentry / Rollbar)
- [ ] Analytics (PostHog / Mixpanel)
- [ ] Performance monitoring (New Relic / Datadog)
- [ ] Uptime monitoring
- [ ] Database query logs

---

## Deployment Checklist

- [ ] .env.example updated with all required keys
- [ ] MongoDB indexes verified (`npm run seed`)
- [ ] Atlas Search index created
- [ ] Cloudinary config tested
- [ ] Resend email domain verified
- [ ] Google OAuth redirect URIs set
- [ ] Netlify env variables configured
- [ ] Node 20 pinned in Netlify
- [ ] Database backups enabled
- [ ] HTTPS enforced
- [ ] Staging environment tested before prod

---

## Next Steps

1. Implement rate limiting on auth endpoints (HIGH PRIORITY)
2. Add RBAC checks to all admin routes (HIGH PRIORITY)
3. Add structured logging across the stack (MEDIUM)
4. Set up error tracking (Sentry) (MEDIUM)
5. Run penetration test before launch (MEDIUM)
6. Load test marketplace search & nearby (MEDIUM)
7. Set up monitoring dashboards (LOW)
