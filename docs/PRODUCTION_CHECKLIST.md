# Netlify / production checklist

- [- ] Rotate MongoDB Atlas password (credentials were exposed in chat)
- [ -] Atlas Network Access allows Netlify / your IPs
- [ -] Create database `marathi_classifieds` and run `npm run seed`
- [ ] Create Atlas Search index from `scripts/atlas-search-index.json` (name: `ads_search`)
- [ ] Set all env vars in Netlify (see `.env.example`)
- [ ] Configure Google OAuth redirect URI: `https://YOUR_DOMAIN/api/auth/callback/google`
- [ ] Configure Cloudinary upload preset / signed uploads
- [ ] Configure Resend domain for production email OTP
- [ ] Configure Twilio for SMS OTP (optional)
- [ ] Configure Pusher app for realtime chat
- [ ] Set `CSRF_DISABLED` unset/false in production
- [ ] Verify `/api/health` returns ok after deploy
- [ ] Create first admin via seed (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- [ ] Smoke test: register → OTP → sell draft → publish → admin approve → chat
