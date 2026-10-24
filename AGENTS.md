# Instructions for coding agents

## Event rules

- The team reports that OU SASEHacks hacking began at 9:00 a.m. on October 24, 2026. All project code must be written after that start time. Complete submission before judging at 5:15 p.m.; be set up and ready in Gallogly Hall, Room 127 by then. Official portal: https://ou-sasehacks.devpost.com/; include the team's repository link. Follow any official clarification from an organizer.
- Jaxon explicitly requires a final submission hold: prepare/review drafts freely, but do not finalize, publish or submit Devpost until he directly authorizes the final submission. This is separate from code readiness and from commit/push/deployment permission. Have a presentation ready covering the idea, demo and technical work; judging criteria are theme alignment, technical depth/implementation, and creativity/originality.
- This repository was created after hacking began and starts with documentation only. The older `Jaxonize/sasehacks2026` repository contains a generic Next.js starter created before hacking began. Do not copy, import, merge, cherry-pick, or otherwise reuse its app/source code or generated scaffold in this event repo.
- Do not invent product requirements. Read the exact event prompt and agree with the team on a small demo before implementing it.
- If the rules or use of any pre-existing material is unclear, stop and ask an event organizer before using it.

## Starting work

1. Check `git status --short --branch`. Never discard, reset, or overwrite existing work to make the tree clean.
2. Read `README.md`, `TEAM_COORDINATION.md`, `HANDOFF.md`, the exact event prompt supplied by the team, and the newest notes in `coordination/updates/`.
3. Check recent Slack messages if your harness has its own authorized Slack connection. Before substantial work, state your task and coordinate file ownership. Only one agent should edit the same working copy at a time.
4. For a direct Slack request or handoff, send the short ACK from `TEAM_COORDINATION.md` as its own message before sending any substantive reply.

## Code and project changes

- Write new project code in this repository after the hacking start. Keep changes focused and explain unfamiliar commands in beginner-friendly language.
- Do not commit or push unless the team lead authorizes it. Never put credentials in source files, chat prompts, screenshots, or commits; use local ignored environment files.
- Before changing application code, agree on the stack based on the prompt and team decision. If using Next.js, read the installed relevant guide under `node_modules/next/dist/docs/` first and follow its current conventions.
- Do not add services unless the agreed demo needs them.

## Handoff

Before handing off, save work and leave a short note in `coordination/updates/` with the date/time, agent/harness, status, changed files, decisions or blockers, and next action. Tell the next agent what to read. Preserve uncommitted work and coordinate before another agent edits the same files.
