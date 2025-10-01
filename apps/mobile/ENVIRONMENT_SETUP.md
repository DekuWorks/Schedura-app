# Environment Setup for Mobile App

This document explains how to set up the environment variables for the Schedura mobile app.

## ✅ Environment Variables Status

**Current Status: CONFIGURED** ✅

The following environment variables are now set up and ready to use:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://ywwlxczxktoqhjehitds.supabase.co` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anonymous key |
| `EXPO_PUBLIC_APP_URL` | `schedura://` | App deep link scheme |

## 🚀 Quick Setup

The environment variables have been automatically configured using the values from your web app. To verify or update them:

```bash
# Check current environment variables
cat .env

# Re-run setup if needed
pnpm setup:env
```

## 📁 Files Created

- ✅ `.env` - Environment variables file
- ✅ `env.example` - Template for environment variables
- ✅ `app.config.js` - Expo configuration with environment variables
- ✅ `setup-env.sh` - Automated setup script

## 🔧 Configuration Details

### Supabase Integration
- **URL**: Connected to your existing Supabase project
- **Key**: Using the same anonymous key as your web app
- **Functions**: Ready to use existing Supabase functions for Stripe

### App Configuration
- **Scheme**: `schedura://` for deep linking
- **Bundle ID**: `com.schedura.app` for iOS
- **Package**: `com.schedura.app` for Android

## 🧪 Testing the Setup

To verify everything is working:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Check environment variables are loaded
echo $EXPO_PUBLIC_SUPABASE_URL
```

## 🔒 Security Notes

- ✅ Supabase keys are safe to use in mobile apps (public keys)
- ✅ Stripe secret keys remain in Supabase functions (secure)
- ✅ No sensitive data exposed in the mobile app
- ✅ Environment variables are properly scoped with `EXPO_PUBLIC_` prefix

## 🚨 Troubleshooting

### If environment variables are not loading:

1. **Check .env file exists**:
   ```bash
   ls -la .env
   ```

2. **Verify file format**:
   ```bash
   cat .env
   ```

3. **Re-run setup**:
   ```bash
   pnpm setup:env
   ```

4. **Restart development server**:
   ```bash
   pnpm dev
   ```

### If Supabase connection fails:

1. **Check network connectivity**
2. **Verify Supabase project is active**
3. **Confirm API keys are correct**
4. **Check Supabase function permissions**

## 📱 Next Steps

With environment variables configured, you can now:

1. **Test Stripe Integration**: Use the pricing and subscription screens
2. **Develop Features**: Build on top of the existing Stripe setup
3. **Deploy**: Environment variables will work in production builds
4. **Debug**: Use Expo's environment variable debugging tools

## 🔄 Updating Variables

To update environment variables:

1. Edit the `.env` file
2. Restart the development server
3. Test the changes

For production, update the variables in your deployment platform (EAS, App Store Connect, etc.).
