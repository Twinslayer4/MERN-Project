# Nextstep mobile

Expo app for iOS and Android using the Nextstep sage palette, serif headlines, and charcoal dark mode. The screens cover sign-in, account creation, and the signed-in user's profile.

## Open on your phone

Use Node.js 22.13 or later and Expo Go compatible with Expo SDK 58. From the repository root, run these commands in PowerShell.

```powershell
cd mobile
npm ci
npm start
```

Connect the phone and computer to the same Wi-Fi. Scan the Metro QR with your iPhone camera or with **Scan QR code** inside Expo Go on Android. On physical iOS, Expo may require the same Expo account in Expo Go and `npx expo login` on the computer. Keep the terminal running while previewing. See [Expo's device setup guide](https://docs.expo.dev/get-started/set-up-your-environment/).

When the API is unconfigured, **Preview sample profile** opens the user screen using example data. The theme button switches between the two palettes.

## Connect the account screens

Start the MERN API and MongoDB using the repository's backend setup. Copy `.env.example` to `.env.local` in `mobile` and set `EXPO_PUBLIC_API_URL` to the backend origin, such as `http://192.168.1.42:5000` for local development. Use the computer's Wi-Fi address on a physical phone and restart Metro after changing the URL. For a deployed API, use its HTTPS origin.

- Sign in uses `POST /api/auth/login`.
- Create an account uses `POST /api/users` and opens the new user's profile on success.
- Profile refresh and session restore use `GET /api/users/:userId` with the bearer token.

The device saves the token and user ID in Expo SecureStore. Sign-out clears the saved session. Passwords are sent to the configured API during authentication and are never saved by the mobile app. Use test credentials on a local HTTP development network.
