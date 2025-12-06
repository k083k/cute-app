# Deployment Guide

## Environment Variables Setup

Your app requires two environment variables to work properly:

### Required Variables

1. **`SECRET_CODE`** - The password for accessing the secret gallery section
   - Example: `justyouandme`
   - Change this to whatever password you want

2. **`SESSION_SECRET`** - Encryption key for session security
   - Must be a random 32+ character string
   - Generate with: `openssl rand -base64 32`
   - **Use a DIFFERENT secret for production than local development**

---

## Deployment Instructions

### For Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Go to **Settings → Environment Variables**
4. Add these variables:
   ```
   SECRET_CODE = your_secret_password_here
   SESSION_SECRET = [output from: openssl rand -base64 32]
   ```
5. Select all environments (Production, Preview, Development)
6. Deploy!

### For Netlify

1. Connect your GitHub repository
2. Go to **Site settings → Environment variables**
3. Click **Add a variable** and add:
   ```
   SECRET_CODE = your_secret_password_here
   SESSION_SECRET = [output from: openssl rand -base64 32]
   ```
4. Deploy!

### For Other Platforms

Look for "Environment Variables" or "Config Vars" section in your hosting platform and add both variables.

---

## Security Best Practices

✅ **DO:**
- Use a different `SESSION_SECRET` for production
- Keep your `.env.local` file private (already in `.gitignore`)
- Generate a strong random `SESSION_SECRET` with `openssl`
- Change `SECRET_CODE` to something personal

❌ **DON'T:**
- Commit `.env.local` to git (already protected)
- Share your `SESSION_SECRET` publicly
- Use the example/default session secret in production
- Reuse session secrets across different apps

---

## Testing Production Locally

To test with production-like environment variables:

1. Create `.env.production.local`:
   ```bash
   SECRET_CODE=your_production_password
   SESSION_SECRET=your_production_session_secret
   ```

2. Build and run:
   ```bash
   npm run build
   npm start
   ```

---

## Troubleshooting

**Secret section not working?**
- Check that `SECRET_CODE` is set in your hosting platform
- Verify the variable name is exactly `SECRET_CODE` (case-sensitive)

**Session errors?**
- Ensure `SESSION_SECRET` is at least 32 characters
- Generate a new one with: `openssl rand -base64 32`

**After deployment:**
- Clear your browser cookies if you have authentication issues
- Check your hosting platform's logs for any errors
