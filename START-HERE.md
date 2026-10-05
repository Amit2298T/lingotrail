# Start LingoTrail on Windows

This is a Next.js portfolio web app. It runs in desktop and mobile browsers. It is not an Android APK.

## 1. Open the sample first

Install Node.js 22.12+ or Node.js 24 LTS. Extract the ZIP, open the `lingotrail` folder in VS Code, and open its terminal. Make sure `package.json` is in this folder.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000 and choose **Try a lesson**. The landing page and sample work without a database. If PowerShell blocks npm.ps1, use `npm.cmd` instead of `npm` in each command.

## 2. Enable accounts and saved lessons

Stop the server with Ctrl+C. Create a Neon PostgreSQL project in your own account. Copy its pooled connection string and its direct (unpooled) connection string. Then run:

```powershell
npm run setup:env
notepad .env
```

The script creates a local `.env` and generates a random auth secret. Add the pooled string to `DATABASE_URL`, the direct string to `DIRECT_URL`, keeping Neon's TLS parameters such as `sslmode=require`. Keep `BETTER_AUTH_URL=http://localhost:3000`. Never share or commit `.env`.

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000/signup, create a test account, and choose a goal. The seed command is repeatable and preserves learner progress. Account email verification and password recovery are not included; use a test account for this portfolio version.

## 3. Check the project

```powershell
npm run typecheck
npm test
npm run build
npm start
```

Run `npm start` only after a build, with the development server stopped. To regenerate the Prisma client manually, use `npm run db:generate`.

Try: an incorrect answer and retry, a complete lesson, refreshing the dashboard, replaying the lesson (0 additional XP), a locked lesson URL, signing out and back in, and your phone's browser. Audio depends on the voices your browser/device has installed.

## 4. Deploy to Vercel when ready

Push the extracted source folder to your own GitHub repository. Do not commit `.env`. Import the repository into Vercel as a Next.js project. Add DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL in its environment settings. Use your final HTTPS site origin for BETTER_AUTH_URL, without a trailing slash. Run migrations and the seed against that database once before using accounts; the build intentionally does not mutate your database. Redeploy after changing environment values.

Use a separate database for preview deployments. Free hosting/database plans have limits and may change; check the provider dashboards before deploying. This app needs no paid AI service or API key.

## Troubleshooting

- Missing package.json: enter the extracted `lingotrail` folder first.
- Database connection error: confirm both Neon URLs, password, TLS settings, and network access.
- Empty learning path: run `npm run db:seed` against the same database used by the app.
- Request origin error: visit the exact origin in BETTER_AUTH_URL. If you use a different port, update that variable and restart.
- Invalid auth session after changing secret: sign out, clear site cookies, and sign in again.
- No voice playback: use the on-screen text fallback. This app does not record or score speech.

Read README.md for architecture and limitations, and VERIFICATION.md for checks actually performed.
