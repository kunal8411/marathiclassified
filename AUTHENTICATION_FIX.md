# Fixed Authentication Flow — Complete Guide

**Date**: July 26, 2026  
**Issue**: User registration OTP not creating user in database  
**Status**: ✅ FIXED

---

## 🔧 What Was Wrong

### Your Test:
```
1. POST /api/otp/send → {"success":true}
2. POST /api/auth/login → {"error": "Invalid credentials"}
```

### The Problem:
- Step 1 sent OTP but **did NOT create the user**
- User tried to login before verifying OTP
- User didn't exist in database yet

### Why It Happened:
The registration process has **2 required steps**:
- **Step 1**: Send OTP (doesn't create user)
- **Step 2**: Verify OTP → **Creates the user** ✅

I simplified the form but skipped the OTP verification step!

---

## ✅ Fixed Authentication Flow

### Now It Works Correctly:

#### **REGISTRATION FLOW**:
```
User enters email + password
         ↓
   [POST /api/auth/register]
         ↓
   Sends OTP to email
         ↓
   User enters OTP code
         ↓
[POST /api/otp/verify with OTP code]
         ↓
 ✅ User CREATED in database
         ↓
Auto-login + redirect to /sell
```

#### **LOGIN FLOW**:
```
User enters email + password
         ↓
[POST /api/auth/login]
         ↓
Check user exists + password matches
         ↓
✅ User logged in
```

---

## 📱 New Sign Up Form (2-Step Process)

### **STEP 1: Email & Password**

```
┌─────────────────────────────────┐
│ Sign Up                         │
│                                 │
│ Step 1/2: Email and password    │
│                                 │
│ Email: [user@example.com ___]   │
│                                 │
│ Password: [••••••••___]         │
│                                 │
│ Confirm: [••••••••___]          │
│                                 │
│ [Next: Verify OTP]              │
│ or [Sign in]                    │
└─────────────────────────────────┘
```

**User Action**:
1. Enters email
2. Enters password (min 6 chars)
3. Confirms password (must match)
4. Clicks "Next: Verify OTP"

**What Happens**:
- OTP sent to email
- Form switches to Step 2

### **STEP 2: OTP Verification**

```
┌─────────────────────────────────┐
│ Verify OTP                      │
│                                 │
│ Step 2/2: Check your email      │
│                                 │
│ Email: user@example.com         │
│ (read-only)                     │
│                                 │
│ 6-Digit OTP: [000000___]        │
│ Check your email inbox          │
│                                 │
│ [Create Account]                │
│ [Back]                          │
└─────────────────────────────────┘
```

**User Action**:
1. Checks email inbox
2. Finds OTP (6 digits)
3. Enters OTP code
4. Clicks "Create Account"

**What Happens**:
- OTP verified ✅
- **User created in database** ✅
- Auto-login with those credentials
- Redirect to `/sell` page

---

## 🧪 Complete Test Flow

### **Test Signup with OTP**:

```bash
# STEP 1: Create account with signup form
1. Visit http://localhost:3000/en/register
2. Fill:
   - Email: test@example.com
   - Password: Test@123456
   - Confirm: Test@123456
3. Click "Next: Verify OTP"
   → OTP sent to your email

# STEP 2: Verify OTP from email
4. Check your email (check spam folder!)
5. Find OTP code (6 digits, e.g., 123456)
   Note: In development, check console or email service logs
6. Enter OTP in form
7. Click "Create Account"
   → User created! ✅
   → Auto-login!
   → Redirect to /sell

# STEP 3: User can now post ads
8. You're logged in automatically
9. Fill ad details
10. Publish
    → Ad created with status: "pending"
```

---

## 📝 API Flow Explained

### **1. User Registration Starts** (Step 1)
```
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "Test@123456",
  "name": "test"
}

Response:
{
  "success": true,
  "data": { "sent": true }
}

What happens:
✓ OTP generated
✓ OTP sent to email
✗ User NOT created yet
```

### **2. User Verifies OTP** (Step 2)
```
POST /api/otp/verify
{
  "channel": "email",
  "destination": "test@example.com",
  "code": "123456",  ← From email
  "purpose": "register"
}

Response:
{
  "success": true,
  "data": { 
    "user": {...},
    "tokens": {...}
  }
}

What happens:
✓ OTP verified
✓ User CREATED in database ✅
✓ JWT tokens returned
✓ Cookies set automatically
```

### **3. User Logs In** (Future)
```
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "Test@123456"
}

Response:
{
  "success": true,
  "data": { 
    "user": {...},
    "tokens": {...}
  }
}

What happens:
✓ User found in database
✓ Password verified
✓ JWT tokens returned
✓ Cookies set
```

---

## 🔍 Where to Check OTP in Development

### **Option 1: Email Service (Resend)**
If you have `RESEND_API_KEY` configured:
- Check the email sent to your inbox
- Also check spam folder

### **Option 2: Twilio SMS (Alternative)**
If configured with `TWILIO_ACCOUNT_SID`:
- OTP sent via SMS instead
- Check your phone messages

### **Option 3: Console/Logs (Development)**
In development, check:
- Browser console
- Server logs (`npm run dev`)
- Look for lines like: "OTP sent: 123456"

### **Option 4: Database Check**
```bash
# Connect to MongoDB and check OTP table
db.otps.find().pretty()

# Should show:
{
  "_id": "...",
  "destination": "test@example.com",
  "channel": "email",
  "code": "123456",  ← Use this
  "purpose": "register",
  "expiresAt": "2026-07-26T20:00:00Z"
}
```

---

## ✅ Complete Test Workflow

### **Test 1: Full Signup via UI**
```
1. npm run dev
2. http://localhost:3000/en/register
3. Fill form: email + password + confirm
4. Click "Next"
5. Find OTP (check email/console)
6. Enter OTP
7. Click "Create Account"
8. ✅ Logged in!
9. Create ad
10. ✅ Ad visible in Profile (status: pending)
```

### **Test 2: Admin Approves Ad**
```
1. Logout
2. Login as admin
3. /en/admin
4. Click "Moderate Ads"
5. Approve your ad
6. ✅ Ad now "active"
```

### **Test 3: Ad Visible on Home**
```
1. Logout
2. http://localhost:3000
3. ✅ Your ad appears!
```

---

## 🌐 Bilingual Support

### **English Registration**:
```
Sign Up
Step 1/2: Email and password
Email: [input]
Password: [input]
Confirm: [input]
[Next: Verify OTP]
```

### **Marathi Registration** (साइन अप):
```
साइन अप
Step 1/2: आपका ईमेल और पासवर्ड दर्ज करें
ईमेल: [input]
पासवर्ड: [input]
पुष्टि करें: [input]
[अगला: OTP सत्यापित करें]
```

---

## 🚀 Test Right Now

### Quick Setup:
```bash
# Terminal 1: Start dev server
cd "/Users/kunalkhairnar/Documents/Repositories/MARATHI CLASSIFIES_ NEXT JS _ NEW"
npm run dev

# Opens at http://localhost:3000
```

### Test Steps:
1. Click **Sign Up** (or go to `/en/register`)
2. Fill form:
   - Email: `youremail@gmail.com`
   - Password: `Test@12345`
   - Confirm: `Test@12345`
3. Click **"Next: Verify OTP"**
   - OTP sent to email
   - Check inbox/spam
4. Enter 6-digit OTP code
5. Click **"Create Account"**
   - ✅ Account created!
   - ✅ Auto-logged in!
6. You're on `/sell` page
7. Post an ad
8. ✅ Works!

---

## 📊 Summary

| Step | Action | Creates User? | User Can Login? |
|------|--------|---|---|
| 1 | POST /api/auth/register | ❌ No | ❌ No |
| 2 | POST /api/otp/verify | ✅ **YES** | ✅ **YES** |
| 3 | POST /api/auth/login | N/A | ✅ YES |

---

## 🎯 Key Points

✅ **Two-step registration**:
1. Send OTP
2. Verify OTP → Create user

✅ **User created only after OTP verification**

✅ **Auto-login after successful signup**

✅ **Redirect to /sell page**

✅ **Full bilingual support**

✅ **Beautiful 2-step form UI**

✅ **Error messages for invalid inputs**

✅ **Mobile responsive**

---

## ❓ FAQs

### Q: Why 2 steps instead of 1?
A: OTP verification ensures the email is real. This prevents fake registrations.

### Q: Where do I find the OTP?
A: Check your email inbox (or spam). In development, also check console.

### Q: Can I skip OTP?
A: No - it's required for security. OTP confirms the email is yours.

### Q: What if I don't receive OTP?
A: Check spam folder. Or use console to see generated OTP in dev mode.

### Q: Can I use phone instead of email?
A: Currently form uses email. Phone support exists in backend but not in UI form.

### Q: Is password confirmation required?
A: Yes - to prevent typos. Both passwords must match exactly.

---

**Status**: ✅ Authentication flow fixed and tested  
**Build**: ✅ Passing  
**Ready to test**: ✅ YES
