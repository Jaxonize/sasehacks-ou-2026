# Tactile Reminders

A desk companion that gives everyday reminders a physical place: four tasks, two dials, two switches, and a small black pixel-art cat.

Built for **OU SASEHacks 2026 — SASEHACKS FOR GOOD**.

## The product idea

Long reminder lists can be easy to ignore. We want a few important tasks to stay in sight and within reach, with a satisfying physical action to mark each one complete.

Our prototype places a portrait phone on the left of a 3D-printed switchboard, with two dials and two stick switches on the right. Each control belongs to one fixed reminder. The phone demonstrates the display we would eventually build into the product.

We are exploring tactile routines for people who find conventional reminders difficult, including people with ADHD and people with vision-accessibility needs. Connected controls and a refreshable Braille display are future directions. These benefits need testing with intended users; this prototype does not establish a medical benefit or complete nonvisual accessibility.

## What you can do today

- Add and edit a reminder in each of four fixed slots.
- Complete a reminder or undo its completion using the phone interface.
- Keep reminders after reload in the same browser through localStorage.
- See a roaming pixel-art cat and brief completion feedback, including confetti. The cat can be hidden; animations respect reduced-motion settings.
- Import incomplete **Google Tasks due today** into explicitly selected empty slots after configuring Google sign-in.

The printed switches and dials are **mechanical demo props**. They do not send electronic signals to the app. During the demonstration, we openly mirror a physical action using its on-screen control. The current on-screen controls toggle Complete/Undo; the core command intended for future hardware only completes its assigned task and repeated activation is a no-op.

| Reminder slot | Physical control |
|---|---|
| 1 | Dial 1 |
| 2 | Dial 2 |
| 3 | Switch 1 |
| 4 | Switch 2 |

## Try the app

Use **Node.js 22.12+ or Node.js 24**, with npm.

```sh
git clone https://github.com/Jaxonize/sasehacks-ou-2026.git
cd sasehacks-ou-2026
npm ci
npm run dev -- --port 5173
```

Open **http://localhost:5173/**. To try the phone layout, open the network URL printed by Vite on a phone connected to the same Wi-Fi.

1. Add a short task to an empty row.
2. Tap its completion circle or simulated control.
3. Use Undo or tap the completed control again to reopen it.
4. Edit a task, then reload to see local saving.

For Google import, leave a slot empty and scroll below the board to the import launcher.

```sh
npm test
npm run build
```

The tests cover reminder state/storage, import behavior and cat completion transitions. A passing build does not establish live Google authentication or physical-phone accessibility.

## Google Tasks setup

The importer uses Google Identity Services and the read-only Google Tasks API. It needs your own OAuth web client and test-account configuration:

1. Enable the Google Tasks API and configure OAuth consent/test users.
2. Authorize the exact JavaScript origin, such as `http://localhost:5173`.
3. Put the public web client ID in an ignored `.env.local` file:

```dotenv
VITE_GOOGLE_CLIENT_ID=YOUR_PUBLIC_WEB_CLIENT_ID.apps.googleusercontent.com
```

Restart the dev server, connect Google Tasks, select a task due today and choose an empty slot. See the [Google integration guide](src/integrations/google/README.md) for full setup and verification details.

Local reminders work without Google configuration. Live consent/import requires separate verification. Phone sign-in needs a valid HTTPS origin; the HTTP LAN preview is for local reminder testing.

Import does not overwrite occupied slots or import the same Google task twice. Completing or editing an imported reminder changes the local copy only. Tokens stay in memory; never put a client secret or token in source or Slack.

## How it works and current limits

React, TypeScript and Vite power the web app. Reminder state and storage live in `src/core`, the interface in `src/ui`, Google import in `src/integrations/google`, and the cat companion in `src/companion`. JetBrains Mono is bundled locally. Cat artwork provenance is in [assets/companion/README.md](assets/companion/README.md).

There is no backend or cross-device synchronization. Each browser/device/origin has its own reminders: importing on laptop localhost does not populate the phone. Simultaneous localStorage writes are not transactional. Connected hardware and Braille output are not implemented; actual phone and screen-reader testing remain separate acceptance work.

## Event and team notes

All project code must be written after the reported **9:00 a.m. CDT, October 24, 2026** hacking start. This repository was created afterward; do not reuse the older pre-event `Jaxonize/sasehacks2026` starter.

Submit the repository link through [OU SASEHacks Devpost](https://ou-sasehacks.devpost.com/) before judging. Be set up and ready with a presentation at **5:15 p.m. in Gallogly Hall, Room 127**. Criteria: theme alignment, technical depth/implementation, and creativity/originality.

**Final submission is on hold until Jaxon explicitly authorizes it.** Commit, push and deployment permissions are separate.

Contributors and coding agents: read [AGENTS.md](AGENTS.md), [TEAM_COORDINATION.md](TEAM_COORDINATION.md), [HANDOFF.md](HANDOFF.md) and the newest [coordination updates](coordination/updates/) before editing. Coordinate ownership, preserve uncommitted work, and keep credentials out of Git.
