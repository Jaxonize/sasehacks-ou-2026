# Google OAuth and HTTPS deployment checkpoint — October 24, 2026

Ivan / Codex. User authorized the demo deployments, OAuth setup, and publication of this status to GitHub and Slack.

## Current deployments

- Netlify demo: https://clever-puffpuff-2265f2.netlify.app/
- Existing public Sites demo: https://tactile-reminders-demo-2026.yvan314234.chatgpt.site/
- Both deployments use the integrated V30 build from GitHub commit 88acbfa8eb927a36124a71f20a2399020a08b4a9.
- Netlify ZIP was prepared locally; the user uploaded it after browser extension file permissions blocked automatic upload. This is a manual deployment, not an automatic GitHub deployment pipeline.
- Privacy notice is available at /privacy.html. Bundles contain no saved reminders, access tokens or client secrets.

## Google configuration confirmed in Console

- Google Tasks API enabled; read-only tasks scope declared.
- Existing web OAuth client now has these saved Authorized JavaScript origins:
  - http://localhost:5173
  - https://tactile-reminders-demo-2026.yvan314234.chatgpt.site
  - https://clever-puffpuff-2265f2.netlify.app
- Both HTTPS origins were verified by reopening the client after saving.
- The app is External / Testing. The requesting user's Google account was added and confirmed in the test-user table (1 approved tester). Account details are intentionally omitted from this public handoff.
- Public client ID remains in ignored .env.local for local builds. No client secret is used by the browser app, saved here, or committed.

## Verification limits and next steps

The user's later 403 explicitly identified the tester restriction, after the origin was registered. The tester list is now saved; successful end-to-end consent and Google Tasks import have not yet been confirmed. Retry with the approved account. Google warns configuration changes may take 5 minutes to a few hours to propagate.

Other accounts remain blocked unless approved as testers. Public OAuth publication is disabled pending complete Branding configuration; this is not an unrestricted or Google-verified app. The HTTP Wi-Fi IP preview remains unsupported for Google OAuth. Each browser/device/origin keeps separate local reminders.

No application code changed during these Console updates. V30's 21 tests and production build passed during integration. This documentation-only checkpoint does not claim a new live OAuth or iPhone test. Final Devpost submission remains on hold.
