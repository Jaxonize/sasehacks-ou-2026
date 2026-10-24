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
