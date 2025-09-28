# 🌍 Real World ID Setup Guide

This guide will help you set up **real World ID verification** instead of using dummy data.

## 🚀 Quick Setup Steps

### 1. Create World ID Developer Account

1. Go to [https://developer.worldcoin.org/](https://developer.worldcoin.org/)
2. Sign up or log in to your account
3. Create a new application

### 2. Get Your App ID

1. In the Developer Portal, go to your application settings
2. Copy your **App ID** (format: `app_staging_xxxxxxxxxxxx` or `app_xxxxxxxxxxxx`)
3. Create a `.env.local` file in your project root:

```env
# Replace with your actual World ID App ID
APP_ID=app_your_actual_app_id_here
```

**Example:**

```env
APP_ID=app_staging_1234567890abcdef
```

### 3. Create Incognito Action

1. In the Developer Portal, go to **Actions** section
2. Create a new **Incognito Action** with:
   - **Action ID**: `rizzler-verification`
   - **Name**: `Rizzler App Verification`
   - **Description**: `Identity verification for Rizzler app access`
   - **Verification Levels**: Accept both Orb and Device

### 4. Test Your Setup

1. Make sure World App is installed on your device
2. Run your app: `pnpm run dev`
3. Navigate to your app and click "Verify with World ID"
4. Complete verification in World App
5. Check browser console for verification data

## 🔧 Configuration Details

### Environment Variables

| Variable | Description          | Example                        |
| -------- | -------------------- | ------------------------------ |
| `APP_ID` | Your World ID App ID | `app_staging_1234567890abcdef` |

### Verification Flow

1. **User clicks "Verify with World ID"**
2. **World App opens** with verification options
3. **User completes verification** (Orb or Device)
4. **App receives proof** and verifies it on backend
5. **World ID is stored** in localStorage for session
6. **User proceeds** to NFC scanning

### World ID Storage

The app now stores the actual World ID from verification:

- **Source**: `nullifier_hash` from verification proof
- **Storage**: `localStorage.getItem("worldId")`
- **Usage**: Passed to API calls and NFC detection

## 🛠️ Development vs Production

### Development (Staging)

- Use staging App ID: `app_staging_xxxxxxxxxxxx`
- Test with staging World ID network
- Limited verification options

### Production

- Use production App ID: `app_xxxxxxxxxxxx`
- Full verification capabilities
- Higher rate limits

## 🐛 Troubleshooting

### Common Issues

1. **"World App not installed"**

   - Install World App from [worldapp.org](https://worldapp.org)
   - Make sure you're on a mobile device

2. **"Verification failed"**

   - Check your App ID in `.env.local`
   - Verify the incognito action exists
   - Check network connectivity

3. **"Backend verification failed"**
   - Check server logs
   - Verify `verifyCloudProof` is working
   - Check environment variables

### Debug Mode

Enable debug logging by checking browser console for:

- World ID verification data
- Stored World ID values
- API response details

## 📱 Testing Checklist

- [ ] World App installed on device
- [ ] App ID configured in `.env.local`
- [ ] Incognito action created in Developer Portal
- [ ] Verification flow works end-to-end
- [ ] World ID is stored after verification
- [ ] NFC detection uses real World ID
- [ ] Profile lookup works with real World ID

## 🔒 Security Notes

- **Never commit** `.env.local` to version control
- **Use staging** App ID for development
- **Verify proofs** on backend, never trust frontend
- **Store World IDs** securely for user sessions
- **Implement rate limiting** for verification attempts

## 🚀 Next Steps

1. Set up your World ID Developer Portal account
2. Create your application and get the App ID
3. Add the App ID to `.env.local`
4. Create the incognito action
5. Test the complete flow
6. Deploy with production App ID

Your app is now ready for real World ID verification! 🎉
