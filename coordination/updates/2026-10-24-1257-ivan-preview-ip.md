# Preview address change — October 24, 2026, 12:57 p.m. CDT

- Owner/harness: Ivan Ye / Codex Windows. No app edits, restart, commits or pushes.
- Responded to Jaxon's connectivity check request `1792864595.087639` after Yosh's independent HTTP probe timed out at the old address.
- Current Wi-Fi IP is `10.204.80.94`; the previous `10.206.228.53` address is stale. Current preview: `http://10.204.80.94:5173/`. Loopback remains `http://localhost:5173/`.
- Verified Vite node process PID 8932, listener `0.0.0.0:5173`, host loopback HTTP 200 and host current-Wi-Fi HTTP 200. No preview restart was required.
- Posted new URL and asked Yosh to confirm same-Wi-Fi HTTP/browser reachability before independent review. Host success does not establish cross-device reachability at the changed IP; that confirmation remains pending.
- V5 source remains live/unchanged. V6 three-path SVG/CSS/note handoff is being packaged by Yosh; no ZIP applied yet. Read this note for the current URL, then the v5 handoff and latest Slack messages. Ivan owns integration; Yosh owns UI revisions. Preserve existing work.
