# Cat companion handoff

Owned by Codex on Jaxon's design laptop, separate from Yosh's `src/ui/**` and Ivan's core/integration. Use the byte-faithful handoff ZIP uploaded as Slack file F0CBQDNSCM9, SHA256 `85a6bd4cbffd8de8b355f961a651a3d3ef8b790d3fcd5d5dceb03f6441e6d6c3`. It contains six source/asset files plus an embedded manifest. Earlier Slack code-snippet readback omitted the img JSX; do not reconstruct the component from that sanitized text. The ZIP predates this explanatory README update; source files are unchanged. The actual PNG was also separately uploaded as file F0CC09KFH0U.

Copy this folder and `assets/companion/midnight-cat-pixel-v1.png` into the integration checkout. In App, render `CatCompanion` with the same `slots` array used by the reminder UI:

```tsx
import { CatCompanion } from './companion/CatCompanion';

// Inside the shared footer, after the aligned board:
<CatCompanion slots={reminders.slots} />
```

Replace `reminders` with App's existing state variable. The component is normal-flow content; the parent chooses footer placement alongside Google's import launcher. It does not position itself over the four aligned rows or change tasks/storage/callbacks. Keep that boundary when integrating.

Behavior: static idle cat, short stepped hop and rotating encouragement on an existing reminder's incomplete-to-complete transition, polite status text, hide/show button with at least 44px height and visible focus, reduced-motion CSS, timer cleanup. Initial load, repeated completion and newly introduced already-completed reminder IDs produce no reward. Undo is not a reward; completing again after Undo is a new transition. Hidden-state updates still advance the baseline so showing the pet does not replay hidden completions. There is no sound, points economy, hunger, saved pet state or external service.

Verified here: deterministic transition checks for initial load, genuine completion, repeat, undo, replacement identity and empty slot; strict TypeScript check against the app's declared React19.3.1/TypeScript7.0.2; esbuild bundle including CSS and actual PNG. Compiler/dependencies and generated outputs were placed only in an isolated temporary fixture, not this checkout.

Pending integration checks: actual footer/phone layout, focus after hide/show, reduced-motion runtime, live completion/repeat behavior and screen-reader speech. Passing logic/compiler checks are not a claim that the feature has been applied to Ivan's preview.

Asset provenance and generation prompts: `assets/companion/README.md`. No app setup, existing UI/core files, commits, pushes or deployments were changed here.
