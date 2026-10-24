# Switching agents and laptops

## This repository is the event workspace

Use `https://github.com/Jaxonize/sasehacks-ou-2026` for SASEHacks work. It was created after the reported 9:00 a.m. hacking start and contains documentation only at setup. Project code must be written during the event.

The earlier `Jaxonize/sasehacks2026` repository was prepared before the event and includes a generic Next.js starter. Do not change its remote to this repository, copy files from it, merge it, cherry-pick from it, or use its application scaffold. Keep it separate. The agent instructions and collaboration procedure needed here have been recreated in this repo.

## Join from another laptop or agent

1. Clone this repository into a new folder:

   ```bash
   git clone https://github.com/Jaxonize/sasehacks-ou-2026.git
   cd sasehacks-ou-2026
   ```

2. Open this folder in Codex, Antigravity, Claude Code, or another coding harness.
3. Ask the agent to read `AGENTS.md`, `README.md`, `TEAM_COORDINATION.md`, this file, the exact prompt, and the newest coordination update before editing.
4. Confirm GitHub write access if the agent needs to push. Public visibility allows cloning, not pushing.
5. Connect Slack separately in that agent's own harness if available. Never copy login tokens from another device.

## Handoff between agents

1. Ask the current agent to stop editing and summarize the goal, decisions, files changed, unfinished work, and commands run.
2. Check `git status --short --branch`. If there are uncommitted changes, keep them and coordinate; do not reset or discard them.
3. Add a concise note under `coordination/updates/` describing the status and next owner/action.
4. Give the next agent this repository and tell it what to read. Only one agent should edit the same working copy at a time.

Organizer instructions relayed by Jaxon: submit through https://ou-sasehacks.devpost.com/ with the team's repository link, and be set up and ready at 5:15 p.m. in Gallogly Hall, Room 127. Judges circulate between tables. Have a presentation ready covering the idea, demo and technical work; evaluation includes theme alignment, technical depth/implementation, and creativity/originality.

Jaxon has placed final submission on hold: agents may prepare/review drafts, but must not finalize, publish or submit Devpost without his explicit go-ahead. Passing tests or an automation run do not grant that permission. Follow TEAM_COORDINATION.md and the latest organizer/submission coordination note; preserve the separate commit/push/deployment restrictions.
