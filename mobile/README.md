# Nextstep mobile

Expo app for iOS and Android with sign-in, account creation, and a light and dark workspace. The bottom tabs are Home, Resumes, Suggestions, and Profile.

## Open on your phone

Use Node.js 22.13 or later and Expo Go compatible with Expo SDK 58. From the repository root, run these commands in PowerShell.

```powershell
cd mobile
npm ci
npm start
```

Connect the phone and computer to the same Wi-Fi. Scan the Metro QR with your iPhone camera or with **Scan QR code** inside Expo Go on Android. On physical iOS, Expo may require the same Expo account in Expo Go and `npx expo login` on the computer. Keep the terminal running while previewing. See [Expo's device setup guide](https://docs.expo.dev/get-started/set-up-your-environment/).

When the API is unconfigured, **Preview sample workspace** opens Home with example applications. Applications added in this preview are cleared when you leave it. The theme button switches between the two palettes.

## Connect the account screens

Start the MERN API and MongoDB using the repository's backend setup. Copy `.env.example` to `.env.local` in `mobile` and set `EXPO_PUBLIC_API_URL` to the backend origin, such as `http://192.168.1.42:5000` for local development. Use the computer's Wi-Fi address on a physical phone and restart Metro after changing the URL. For a deployed API, use its HTTPS origin.

- Sign in uses `POST /api/auth/login`.
- Create an account uses `POST /api/users` and opens Home on success.
- Profile refresh and session restore use `GET /api/users/:userId` with the bearer token.
- Home lists and creates applications with `GET` and `POST /api/users/:userId/applications`. Point the app at a backend with these routes from `main`.

The device saves the token and user ID in Expo SecureStore. Sign-out clears the saved session. Passwords are sent to the configured API during authentication and are never saved by the mobile app. Use test credentials on a local HTTP development network.

### When a phone can load Expo but cannot reach port 5000

Keep Docker Compose running and use the Metro LAN address for both Expo and the API. In `mobile/.env.local`, set the following values, using the computer's current Wi-Fi address.

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.42:8081
NEXTSTEP_DEV_API_PROXY=1
```

Restart Metro with `npm start` and reopen Expo Go. Check `http://192.168.1.42:8081/api/ping` from the phone first. Metro forwards `/api/` requests on the configured LAN address to port 5000 on the same Wi-Fi address.


## Upload a resume

After signing in, open the **Resumes** tab and choose **Upload your first resume** or **Upload a PDF**. Each PDF can be up to 5 MB. Saved resumes appear in the account's list after upload and are available after signing in again. **Remove** deletes the file from the account after confirmation. Use a sample PDF when testing over local HTTP.

### Resume API

All requests use the same bearer token as the profile endpoint. Give each request the signed-in user's ID in the path. MongoDB stores the original PDF bytes and file metadata in the `resumes` collection.

| Method and path | Request or response |
| --- | --- |
| `GET /api/users/:userId/resumes` | Returns `{ resumes: [...] }`, newest first. |
| `POST /api/users/:userId/resumes` | Send the PDF bytes as the body, set `Content-Type: application/pdf`, and put `encodeURIComponent(file.name)` in `X-Resume-Filename`. Returns `{ resume: { _id, name, size, createdAt } }`. Repeating an upload of the same bytes returns the existing entry. |
| `GET /api/users/:userId/resumes/:resumeId` | Returns the original PDF with an attachment filename. |
| `DELETE /api/users/:userId/resumes/:resumeId` | Removes the resume and returns `204 No Content`. |

## Suggestions

In the **Suggestions** tab, choose a saved resume and one or more saved applications with job descriptions. The suggestions show project ideas and other ways to strengthen a candidacy, with practical next steps. The tab includes a labeled preview that uses sample data.

### Backend handoff

The application list uses the existing `GET /api/users/:userId/applications` endpoint from the application CRUD branch. It returns an array with `_id`, `jobTitle`, and `company`. Applications become eligible when the list also includes a nonempty `jobDescription` string or `hasJobDescription: true`. The API should use the saved job descriptions when generating suggestions.

The current mobile branch's backend still needs the application list and job-description changes. Live generation also depends on the teammate's AI endpoint. This is a proposed request and response for coordinating the integration.

| Request | Proposed contract |
| --- | --- |
| Path and method | `POST /api/users/:userId/suggestions` |
| Authentication | The signed-in user's existing bearer token |
| JSON body | `{ "resumeId": "...", "applicationIds": ["...", "..."] }` |
| JSON response | `{ "suggestions": [{ "category": "Project", "title": "...", "rationale": "...", "nextSteps": ["..."] }] }` |

The API resolves the IDs after checking that they belong to the authenticated user. The request references the stored PDF and saved applications by ID.

After agreeing on the contract and implementing the endpoint, set `EXPO_PUBLIC_SUGGESTIONS_PATH=/api/users/:userId/suggestions` in `mobile/.env.local` and restart Expo. The app uses the configured Nextstep API origin, replaces `:userId` with the signed-in user's ID, and allows up to 60 seconds for a response.
