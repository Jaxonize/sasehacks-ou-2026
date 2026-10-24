# Tactile Reminders

A local-first reminder switchboard for SASEHACKS FOR GOOD, exploring a more
approachable way to manage everyday tasks through clear visual feedback and
physical-control concepts. Four slots support add/edit, completion/Undo and
browser persistence. The phone represents a future integrated display; printed
dials and switches are demo props, not connected hardware. Optional Google Tasks
import requires OAuth setup. V22 adds a hideable roaming cat and completion
confetti; animations respect reduced motion. JetBrains Mono is bundled locally.
# OU SASEHacks 2026

This is the clean shared workspace for the OU SASEHacks team. It was created at approximately 9:21 a.m. CDT on October 24, 2026, after the 9:00 a.m. hacking start.

## Event rules supplied by the team

- Write all project code after hacking starts at 9:00 a.m. today.
- Submit by 5:15 p.m.; organizers will provide submission instructions.
- Return to Gallogly at 5:15 p.m. for judging.
- Ask an organizer if any rule or this repo's starting point is unclear.

This repository started with documentation only. Do not copy or import app code from the older `Jaxonize/sasehacks2026` repo: it contains a pre-event generic Next.js starter. Use this fresh repository for all event code.

## Join the project

Clone this repository into a new folder, then open that folder in Codex, Antigravity, Claude Code, or another harness:

```bash
git clone https://github.com/Jaxonize/sasehacks-ou-2026.git
cd sasehacks-ou-2026
```

Read `AGENTS.md`, `TEAM_COORDINATION.md`, and `HANDOFF.md` before making changes. Get the exact event prompt from the team, agree on a small demo, and coordinate file ownership first.

## Team collaboration

Use the team's Slack channel for live coordination if your agent has its own authorized Slack connection. Record decisions and handoffs in `coordination/updates/` so people on other laptops can catch up. Keep credentials in local ignored environment files, never in Git or Slack.

Anyone can read or clone this public repo. Pushing to it requires GitHub write access.

## Run the app

Requires Node.js 22.12+ (or Node.js 24) for the Vite toolchain and TypeScript type-stripping tests.

```sh
npm ci
npm run dev -- --port 5173
```

Open http://localhost:5173/. On the same Wi-Fi, use the network URL printed by
Vite. Four reminder slots persist in this browser. The on-screen circles and
simulated controls toggle completion/Undo; no physical hardware is connected.
The cat can be hidden and respects reduced motion.

```sh
npm test
npm run build
```

Google Tasks is optional and requires an OAuth web client configuration; see
src/integrations/google/README.md and .env.example. Without configuration the
app explains that import is unavailable. Never commit credentials. Live Google
sign-in/import and actual iPhone acceptance remain separate verification steps.
