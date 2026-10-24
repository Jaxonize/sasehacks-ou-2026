# Team coordination

Use the team's shared Slack channel for quick coordination when available. Slack access is per person and per harness; one agent's connection does not sign in another. If your harness cannot connect to Slack, coordinate through the human teammate and the notes in `coordination/updates/`.

## Separate ACK protocol

When responding to a direct Slack request or handoff, send a short acknowledgement as a separate Slack message first, then send the substantive answer or update in a second message when ready. Examples:

- `ACK — READ ONLY`
- `ACK — WORKING: I’ll inspect the handoff docs.`
- `ACK — BLOCKED: I need the exact event prompt.`

Do not combine the ACK and the substantive response in one message.

## Work ownership and updates

- Before substantial work, post what you plan to do and coordinate which files you will edit.
- Only one agent should edit a particular working copy at a time. If another agent is active in it, coordinate before proceeding.
- Record important decisions, blockers, and handoffs in `coordination/updates/` so teammates on other laptops and harnesses can catch up.
- Keep updates short. Never put passwords, API keys, OAuth tokens, or private environment values in Slack, Git, or handoff notes.
- Do not commit or push unless the team lead asks.

## Final submission hold

Jaxon explicitly instructed agents not to submit prematurely. Draft materials, presentation preparation and review can continue. Do not finalize, publish or submit a Devpost entry until Jaxon directly gives the final go-ahead. An agent handoff, passing build, automation tick or feature authorization does not grant final submission authorization. Commit, push and deployment authorization remain separate.

Official portal: https://ou-sasehacks.devpost.com/ . The entry must contain the team repository link. Full application source is now published in this repository; confirm the selected final commit and keep a verified fallback before treating the code deliverable as ready.

All teams must be set up and ready by 5:15 p.m. in Gallogly Hall, Room 127. Judges visit tables. Have a presentation ready covering the idea, demonstration and technical work; criteria are theme alignment, technical depth/implementation, and creativity/originality. Record final readiness separately from final submission authorization.
