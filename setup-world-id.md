# World ID MiniKit Integration Setup

## 1. Install the Package

```bash
npm install @worldcoin/minikit-js
```

## 2. Environment Variables

Add to your `.env.local` file:

```env
APP_ID=app_your_app_id_here
```

You can get your App ID from the [World ID Developer Portal](https://developer.worldcoin.org/).

## 3. Replace Mock Files

Once the package is installed, replace the mock implementations:

1. Replace `hooks/use-world-verification.js` with `hooks/use-world-verification-real.js`
2. Replace `app/api/verify/route.js` with `app/api/verify/route-real.js`

## 4. Update Imports

In the real implementation files, uncomment the import statements:

```javascript
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
```

## 5. Create Incognito Action

1. Go to the [World ID Developer Portal](https://developer.worldcoin.org/)
2. Create a new incognito action with ID: `rizzler-verification`
3. Set the action name and description as needed
4. Configure any limits or restrictions
5. **Note**: The app accepts both Orb and Device verification levels for maximum accessibility

## 6. Test the Integration

1. Make sure World App is installed on your device
2. Run your Next.js app: `pnpm run dev`
3. Navigate to the app and try the verification flow
4. The World App should open a drawer for verification

## 7. Production Considerations

- Set up proper error handling for network issues
- Implement rate limiting for verification attempts
- Store verification status in your database
- Consider implementing verification caching
- Set up monitoring for verification success/failure rates

## Current Integration Points

The verification is integrated into:

- Main page (`app/page.js`) - NFC detection flow
- WorldVerification component (`components/world-verification.jsx`)
- API route (`app/api/verify/route.js`)

The flow is:

1. User clicks "Verify with World ID"
2. World App opens for verification
3. User completes verification in World App
4. Proof is verified on backend
5. User proceeds to NFC scanning
