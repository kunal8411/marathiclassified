# Marathi Classifieds — Production Deployment Guide

## Pre-Launch Checklist

### 1. Environment & Configuration

- [ ] All required `.env.local` variables set (see `.env.example`)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] JWT secrets rotated (never use sample values)
- [ ] Admin credentials changed from defaults
- [ ] CSRF token secret updated
- [ ] Database password rotated (not exposed in code)

### 2. Database Setup

- [ ] MongoDB Atlas cluster created
- [ ] IP whitelist configured (allow Netlify IPs if deploying there)
- [ ] Database backups enabled
- [ ] Atlas Search index created: `ads_search` on ads collection
  ```json
  {
    "mappings": {
      "dynamic": true,
      "fields": {
        "title": { "type": "string", "analyzer": "standard" },
        "description": { "type": "string", "analyzer": "standard" },
        "category": { "type": "string" }
      }
    }
  }
  ```
- [ ] Connection string uses strong password (20+ chars, mixed case/numbers/symbols)

### 3. External Services

**Cloudinary (Image Storage)**
- [ ] Account created
- [ ] Upload preset configured for unsigned uploads
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` set
- [ ] Transformation settings: quality=auto, fetch_format=auto

**Resend (Email OTP)**
- [ ] Account created
- [ ] Domain verified
- [ ] `RESEND_API_KEY` set
- [ ] Email template tested

**Twilio (SMS OTP, Optional)**
- [ ] Account created
- [ ] Phone number verified
- [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` set

**Google OAuth (Optional)**
- [ ] OAuth 2.0 credentials created in Google Console
- [ ] Authorized redirect URIs include production domain + `/api/auth/[...nextauth]`
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` set

**Pusher (Real-time Chat)**
- [ ] Cluster created
- [ ] `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` set

### 4. Security Hardening

- [ ] HTTPS enforced (automatic on Netlify)
- [ ] CORS headers configured
- [ ] CSP headers in `middleware.ts` (already applied)
- [ ] Rate limiting active on auth endpoints (implemented)
- [ ] CSRF tokens validated (implemented)
- [ ] XSS sanitization active (implemented)
- [ ] MongoDB query injection protection active (implemented)
- [ ] Sensitive data not logged (audit logs)

### 5. Testing

**Functionality**
- [ ] User registration & email OTP flow
- [ ] User login with JWT tokens
- [ ] Posting an ad as seller
- [ ] Admin approval of pending ads
- [ ] Search returns live ads only
- [ ] Chat between buyer & seller
- [ ] File uploads work (Cloudinary)
- [ ] i18n switching (English/Marathi)

**Performance**
- [ ] Homepage loads < 2s
- [ ] Search returns results < 1s
- [ ] Ad detail page loads < 1s
- [ ] Database indexes created for common queries
- [ ] Images optimized (Next.js auto)

**Security**
- [ ] SQL/NoSQL injection tests passed
- [ ] XSS payload tests passed
- [ ] CSRF token validation working
- [ ] Rate limiting active (login max 5/min, OTP max 5/min)
- [ ] Admin endpoints require `role: admin`
- [ ] Users cannot delete others' ads
- [ ] Users cannot read chats they're not in

### 6. Monitoring & Logging

- [ ] Structured logs configured (see `lib/middleware/logging.ts`)
- [ ] Error tracking (optional: Sentry) set up
- [ ] Analytics (optional: PostHog) configured
- [ ] Database backups automated
- [ ] Uptime monitoring set up (Pingdom / UptimeRobot)

### 7. Deployment

**Netlify Setup**
- [ ] Node 20+ selected in build settings
- [ ] Build command: `npm run build`
- [ ] Deploy directory: `.next`
- [ ] Environment variables added to Netlify dashboard
- [ ] Redirect rules configured (see `netlify.toml`)

**DNS & Domain**
- [ ] Domain registered
- [ ] Netlify DNS configured or CNAME records set
- [ ] SSL certificate auto-provisioned

**Post-Deploy Verification**
- [ ] Health check: `GET /api/health` returns 200
- [ ] Home page loads
- [ ] Login redirects correctly
- [ ] Admin panel accessible only to admins
- [ ] Logs monitored for errors

## Initial Seed Data

After deployment:

```bash
npm run seed
```

This creates:
- 1 admin user: `admin@marathiclassifieds.com` / `Admin@12345`
- 50 sample users
- ~500 sample ads (all "active" for initial marketplace)
- 12 main categories with 50+ subcategories
- Sample ratings & reviews

## Production Fixes Applied (Jul 26, 2026)

### 1. Rate Limiting on Auth Endpoints
- **File**: `lib/middleware/rate-limit.ts`
- **Routes Protected**:
  - `POST /api/auth/login` → 5 attempts/min per IP
  - `POST /api/otp/send` → 5 attempts/min per destination
  - `POST /api/otp/verify` → 10 attempts/min per destination
- **Impact**: Prevents brute-force attacks

### 2. RBAC Already Verified
- All admin endpoints have `roles: ['admin']` enforcement
- Verified in: `/api/admin/ads`, `/api/admin/users`, `/api/admin/reports`, `/api/admin/analytics`

### 3. Delete Operation Protected
- `DELETE /api/ads/[id]` checks if user is owner or admin
- Prevents unauthorized ad deletion

### 4. Chat Security Verified
- `/api/chats/[id]/messages` validates user is a participant
- Uses `assertParticipant` helper

### 5. Search Input Validation
- **File**: `lib/security/input-validation.ts`
- **Validation**: Min 2 chars, max 200 chars, no dangerous characters
- Prevents NoSQL injection in Atlas Search

### 6. Environment Validation
- **File**: `lib/config/validate-env.ts`
- **Triggers On**: App startup (in `app/layout.tsx`)
- **Effect**: Fails fast if critical vars missing

### 7. Structured Logging
- **File**: `lib/middleware/logging.ts`
- **Fields**: timestamp, level, requestId, userId, duration, error, metadata
- **Use**: Audit trail for debugging & compliance

## Monitoring Queries

### Database Performance
```mongodb
// Check slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### Active Users Today
```mongodb
db.users.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } })
```

### Pending Ads Awaiting Moderation
```mongodb
db.ads.countDocuments({ status: "pending" })
```

### Top Categories
```mongodb
db.ads.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

## Rollback Plan

If critical issue found after deploy:

1. **Revert on Netlify**: Click "Deploys" → previous commit → "Deploy to production"
2. **Database Backup**: Restore from automatic daily backup in Atlas
3. **Status Page**: Post incident update on status page
4. **Notify Users**: Email alert if service down > 30 min

## On-Call Runbook

### Service Down
1. Check Netlify build status
2. Verify MongoDB connection: `db.adminCommand( { ping: 1 } )`
3. Review logs at `/api/health`
4. Rollback if necessary

### High Error Rate
1. Check error logs for pattern
2. If database issue: check Atlas dashboard for throttling
3. If search broken: verify Atlas Search index
4. If auth broken: verify JWT secrets in env

### Performance Degradation
1. Check database query profiles
2. Check for missing indexes
3. Check Netlify build size
4. Consider implementing caching on frequently accessed routes

## Contacts & Escalation

- **Database Issues**: MongoDB Atlas support
- **Email/SMS Issues**: Resend / Twilio support
- **File Upload Issues**: Cloudinary support
- **Chat Issues**: Pusher support
- **Deployment Issues**: Netlify support
