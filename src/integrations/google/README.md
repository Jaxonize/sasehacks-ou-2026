# Google Tasks import

This imports incomplete Google Tasks due on today's local calendar date into
explicitly selected empty slots. It does not use Calendar, import undated tasks,
overwrite occupied reminders, or write completion/edit changes back to Google.

## Human setup

1. In your Google Cloud project, enable **Google Tasks API**.
2. Configure the OAuth app's Branding/Audience. While in testing, add the account
   that will sign in as a test user. Configure the narrow scope
   `https://www.googleapis.com/auth/tasks.readonly`.
3. Create a **Web application** OAuth client. Add the exact authorized JavaScript
   origin `http://localhost:5173`, without a trailing path. Use Google Identity
   Services' browser token SDK; no client secret belongs in this browser app.
4. Create ignored `.env.local` in the repository root:

   ```dotenv
   VITE_GOOGLE_CLIENT_ID=YOUR_PUBLIC_WEB_CLIENT_ID.apps.googleusercontent.com
   ```

5. Restart the development server if Vite has not automatically reloaded the
   environment. Run `npm run dev -- --port 5173` from this repository. For a
   production build, set the environment before `npm run build`.
6. Open `http://localhost:5173` on the host laptop, scroll below the four-row
   board, choose **Import Google Tasks**, then **Connect Google Tasks**. Choose
   the test account and grant read-only Tasks access. Select a task and an empty
   physical slot, adjust the local title if needed, and import. A Google title
   longer than200 characters must be shortened explicitly before import.

The current phone preview `http://10.204.80.94:5173` is not an eligible Google
OAuth web origin. An actual phone sign-in needs an explicitly approved HTTPS
hostname and matching OAuth configuration. This work does not deploy or change
the network. Local reminders still work on the phone. Missing configuration or
an unsupported origin shows an unavailable state, never a pretend connection.

## Data and behavior

- Access tokens exist only in this component's memory, expire, and are cleared
  on reload or **Clear connection**. That button forgets this tab's access; it
  does not revoke the account's app authorization in Google settings.
- API requests are GET-only with bearer headers, no token in URLs, no token or
  remote task list cached in localStorage. List/task pagination is followed;
  assigned tasks are requested. Partial fetch failure does not offer a partial
  list as a complete result. Closing cancels the current load.
- Google's `due` field carries a calendar date, not a time-of-day deadline. Its
  date portion is compared directly with the device's local year/month/day;
  it is not shifted as a UTC instant. Import rechecks the current local day.
- Optional saved provenance is `{provider:'google-tasks', taskListId, taskId,
  dueDate}`. Existing version1 saves without provenance load unchanged. Added
  metadata is validated, preserved through editing/completion/reload, and used
  to reject repeated imports by task-list ID + task ID, even after renaming or
  completing locally. Source IDs do not contain OAuth tokens.
- The existing controller rereads current storage before import. Stale-tab
  duplicate and occupied-slot imports reject; simultaneous whole-snapshot writes
  are still last-writer-wins and can lose an update. They are not transactional.
  A storage failure accepts in-memory changes but leaves the tab memory-only
  until reload, with a warning. Invalid saved data is preserved, not erased.
- The launcher is in normal document flow below the full-height board so it
  does not overlap the aligned reminder rows. The native modal blocks background
  controls, supports Escape and returns focus to the launcher.

## Verification and limits

`npm test` covers pagination/filtering/date semantics/API errors, source identity,
reload compatibility, stale-tab imports and whole-snapshot interleavings.
The parent workspace's `google-import-browser-check.cjs` uses explicitly isolated
SDK/API fixtures on a separate localhost test server. It verifies user selection,
scope, title limits, duplicate/occupied rejection, persistence, token absence,
read-only behavior, expired/denied access, popup cancellation and modal focus.
Those fixtures are not shipped as real account data and do not prove a live
Google connection. Real consent/API success remains unverified until human setup.

## Primary references

- [Tasks resource/date semantics](https://developers.google.com/workspace/tasks/reference/rest/v1/tasks)
- [Tasks list/pagination and scopes](https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/list)
- [Task lists pagination](https://developers.google.com/workspace/tasks/reference/rest/v1/tasklists/list)
- [Google Identity Services token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Google origin validation rules](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#origin-validation)

Use the supported GIS SDK, not a manually constructed legacy implicit OAuth URL.
