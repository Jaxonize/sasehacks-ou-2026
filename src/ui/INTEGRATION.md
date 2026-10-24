# Integrated V30 — October 24, 2026

The handoff below describes Yosh’s candidate. Integration now persists optional urgency through add/edit, completion, Undo and reload, preserving v1 saves and Google provenance. The 60-character editor limit never truncates existing titles: rejected saves keep the draft and explain shortening; Cancel preserves the original. Core/import compatibility remains 200 characters. The board uses available width rather than a height-derived width to avoid squeezed text. JetBrains Mono remains bundled. Keyboard completion is available through the separate completion/Undo buttons; switch tap remains a no-op. Braille is a visual character mapping, not certified transcription or tactile output.

# Current UI contract — V30, October 24, 2026

This section is authoritative. The revision notes below are historical; where
they disagree with this summary, use this summary and the current component.

Ownership and files:
- Yosh owns `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, and this handoff.
- Ivan owns app entry/setup, state/actions, types, storage, and integration.
- Import `{ ReminderApp }` from `./ui/ReminderApp`; no added UI dependencies.

Contract:
- `slots` is parent-owned state in stable numeric order 1–4. Physical labels are
  slot 1=Dial 1, 2=Dial 2, 3=Switch 1, 4=Switch 2. Do not renumber stored slots.
- Reminder data may include `urgent?: boolean`; absent means false. `onAdd(slotId,title,urgent)`
  and `onEdit(slotId,title,urgent)` return `boolean | void`. `false` means rejected;
  keep the editor and draft open. Any accepted result closes it. Ivan must store and
  return `urgent` in the parent-owned slot state for the red border to persist.
- `onComplete`, `onUndo`, and `onActivateControl` are parent-owned actions.
  The reminder check toggles: pending calls `onComplete`, completed calls
  `onUndo`; it preserves focus between the check and Undo action. The simulated
  switch changes state only on a horizontal pointer swipe: pending + right swipe
  calls `onActivateControl`; completed + left swipe calls `onUndo`. Its visible
  track has no surrounding square. Click/tap does nothing. Separate hardware
  actions remain completion-only; no physical control is connected. Empty
  controls are disabled.
- Core errors arrive via `error`; the component keeps role=alert, completion
  announcements, a hidden save-status announcement, and the 60-character reminder-title limit.
- The page is a full-height iPhone 16 portrait board with four equal-position
  task rows, no visual header, dark browser/document chrome, and reduced copy.
  The right-side simulated switches have no square housing. They change state only
  after a horizontal pointer swipe: swipe right to complete and left to undo;
  taps/clicks do not toggle them. Decorative dial and switch graphics are
  removed. User-initiated completion plays a short, brighter, click-like cue
  using Web Audio where available.
  `ReminderApp` temporarily adds `viewport-fit=cover`, dark document backgrounds,
  and zero body margin so the artwork can extend into the iPhone safe area.
  At narrow viewport heights (including keyboard resize), editors switch to
  document flow. Long titles scroll inside their row without covering actions.
- Interactive targets remain at least 44×44 CSS pixels; the slot number/title
  and other UI remain usable with keyboard focus and reduced motion.
- This is a local reminders UI; displayed controls are simulations and no
  physical hardware is connected.

Status: V29 carries forward the full-height layout, callback compatibility,
44px targets, completion glow, confetti, and V23 cat behavior. The 128px cat
roams on a quicker 34–44 second cycle with eased travel and stationary eased
turns, and supports pointer/touch drag and arrow-key movement. The right-side
glass switches have no square housing, are enlarged to a 54×32px track, and
respond only to a horizontal pointer swipe: right completes, left undoes, and
click/tap does nothing. Reminder titles are capped at 60 characters and centered
vertically in each row. Completion confetti keeps blue/black/white for regular tasks and uses
red/black/white for urgent tasks. The editor has an Urgent toggle; pending urgent
cards use a glowing red border, which hides on completion and returns on undo.
Urgency is passed to parent callbacks. The reminder title display has a corner
Braille/English toggle using uncontracted Unicode Braille; input and accessible
labels remain English. The glow softly pulses; reduced-motion users get a strong
static glow. This UI candidate is not integrated or pushed; Ivan remains
integration/push owner. Keep the existing untracked UI source intact.
Integrated-device review remains with Ivan/team.

Only the dark theme is offered. The V30 light-mode toggle request was withdrawn
before handoff, so the existing dark visual system remains the sole theme.

## Per-task urgency effects and Braille display — V29, October 24, 2026, 16:11 CDT

The human requested red confetti only for urgent tasks, no urgent border while a
task is completed, and a corner button to display reminders in Braille. Regular
completion now uses blue/black/white confetti; urgent completion uses
red/black/white. Red urgent glow is shown only while pending and returns after
Undo. The button opposite Hide cat toggles all reminder titles between English
and uncontracted Grade 1 Unicode Braille. It leaves edit fields and accessible
screen-reader labels in English. Braille is display-only; it does not change the
stored title.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, this handoff,
and the V29 coordination note. Ivan still needs the parent `urgent` state
integration from V27. No commit or push.

## Stronger urgent-card glow — V28, October 24, 2026, 16:07 CDT

The human asked for the urgent border to glow red and stand out more. The card
now has a brighter red edge and a layered red halo that gently pulses. Reduced
motion disables the pulse but keeps a strong static halo. Urgency controls,
parent callback contract, and confetti colors are unchanged.

Changed path: `src/ui/reminders.css`, this handoff, and the V28 coordination
note. No commit or push.

## Urgent reminders and red confetti — V27, October 24, 2026, 16:05 CDT

The human asked for an Urgent button in the reminder editor, a red border for
urgent cards, and red confetti instead of blue. The editor now has an
`aria-pressed` Urgent toggle for both add and edit. Selecting it previews a red
card border immediately; saving passes the urgent boolean through `onAdd` or
`onEdit`, and the card reads `urgent` from parent-owned reminder state. The
confetti palette changes from blue/black/white to red/black/white. The 60-character
limit, centered rows, swipe-only switches and cat behavior remain.

Integration: Ivan must carry `urgent?: boolean` in each parent-owned reminder,
accept the third `urgent` argument on add/edit, persist it, and return it in
`slots` so the red border survives rerenders and reloads. UI-only checkout does
not edit Ivan-owned app, storage or core files.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, this handoff,
and the V27 coordination note. No commit or push.

## Larger centered switches and shorter reminders — V26, October 24, 2026, 16:01 CDT

The human asked for larger switches, centered task text, and a limit to prevent
long reminders from disrupting the compact board. The switch track is 54×32px
with a 24px thumb and a 20px slide, fitted within the existing control column.
The transparent housing remains absent, and interaction remains swipe-only.
Assigned reminder rows now use the full card height so their text centers in the
card above the pinned action area. Titles are limited to 60 characters both by
the input and save validation, including when an older over-limit title is
edited.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, this handoff,
and the V27 coordination note. No tests, commit, or push. Ivan remains
integration/push owner.

## Swipe-only controls — V25, October 24, 2026, 15:58 CDT

The human liked the switch design but asked to remove the box around each one
and make it respond only to a physical swipe. The square glass button housing
is removed; only the small glass switch track and thumb remain visible. Taps,
clicks and keyboard activation do not change task state. A horizontal right
pointer/touch swipe completes a pending task; a left swipe undoes a completed
task. Empty slots remain disabled. The task-card confetti and V23 cat motion
are unchanged.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, this handoff,
and the V25 coordination note. Ivan remains integration/push owner. No commit
or push.

## Drag switches and card-wide confetti — V24, October 24, 2026, 15:53 CDT

The human asked to make the right-side controls interactive light switches and
expand completion confetti across the task card while retaining the existing
pointer-origin burst. The simulator buttons now expose `role=switch` and
`aria-checked`, move their glass thumb when toggled, complete on click or a right
drag, and undo on a left drag. Empty slots stay disabled. Completion creates
both the existing localized burst and a second burst distributed across the
full task-card bounds. The same completion sound, parent callback mapping,
reduced-motion behavior and physical-control contract remain unchanged.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, this handoff,
and the V24 coordination note. Strict TypeScript check and isolated preview bundle passed. Browser review
verified click-to-complete, right-drag completion, left-drag undo, accessible
switch state, and particles spanning the task-card bounds. No tests, commit, or
push.
Ivan remains integration/push owner.

## Smaller, smoother, draggable cat — V23, October 24, 2026, 15:51 CDT

The human asked for smoother cat movement and turns, slightly faster travel, a
smaller cat, and direct dragging. The UI renders the cat at 128px, randomly
chooses a 34–44 second route, eases travel between stops, and eases each turn in
place before walking. Pointer and touch drag can place the sprite anywhere in
its safe screen bounds; it then starts a fresh random route from the drop point.
Arrow keys move it too (Shift+arrows use larger steps). Existing completion
confetti and reduced-motion behavior remain.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, this handoff,
and the V23 coordination note. Strict TypeScript check and isolated esbuild
bundle passed; live integrated review remains with Ivan. No tests, commit, or
push. Ivan owns integration and publishing.

## Reversible simulated control and cat walk — V19

The user asked to undo a completed reminder by clicking its button again. The
reminder check now calls `onUndo` when complete and `onComplete` when pending;
the simulated control calls `onUndo` when complete and `onActivateControl` when
pending. Completion sound plays only on the pending to complete transition.
Accessible names announce the current action. Physical-control callback
semantics and core remain unchanged.

The user requested the cat be 2.5 times larger, pause and turn while stationary
before each leg, and show falling confetti at the completion click. UI-owned CSS
renders the cat at 170px, chooses five randomized waypoints on app mount, and
animates a short stop/turn/settle at each waypoint before movement. Completion
clicks create a brief burst of small blue, black, and white particles at the
pointer location; undo does not. Both effects respect reduced-motion settings.
The existing V21 full-height rows, separate 44px action row, completion reward,
and normal-flow Google Tasks section remain. No cat component, App, core,
storage, or setup files are changed.

No commits or pushes.

## Historical revision notes

## Brighter completion click — V18

The human found the initial synthesized cue too low-pitched and asked for a
clickier, slightly higher sound. Raised both tone frequencies, shortened their
envelopes, and added a very brief filtered noise transient for a crisp attack.
The cue remains quiet and only plays on a new user-initiated completion. No
audio asset or dependency was added.

## Completion click — V17

The human asked for a satisfying sound to confirm completion. A brief, quiet
two-tone click is synthesized with the browser Web Audio API on user-initiated
completion, whether activated through Complete or the simulated control. It
does not play on Undo or repeated activation of an already completed task. If
audio is unavailable or blocked, completion behavior is unaffected. No audio
asset or dependency was added.

## Reduced control art and safe-area extension — V16

The human liked the glass styling and asked to remove the dial/switch slash
illustrations and their motion. Simulated-control buttons now show only a subtle
empty ring while pending and a checkmark that draws in when the parent reports
completion. The animation respects reduced-motion preferences; the manual
Complete/Undo actions and control callback mapping are unchanged.

The component now temporarily adds `viewport-fit=cover`, keeps the document and
body backgrounds dark, and removes the browser-default body margin while mounted.
All prior values are restored on unmount. This lets the page artwork reach the
iPhone safe-area edges where the browser supports it; native browser chrome
still needs a real-device check. No core, storage, entry, setup, dependency,
commit, or push changes.

## Keyboard correction — 11:54 CDT

Independent review of Ivan's integrated preview found focus fell back to the page
when ordinary Complete disabled its focused button or Undo removed its button.
The updated component restores focus within that same row: Complete moves to
Undo; Undo moves to Complete. Simulated control activation keeps its own focus.
The callback contract and styles are unchanged. Ivan applies this updated UI-only
handoff to his integration checkout and verifies the two keyboard paths there.

## Compact board revision — 11:57 CDT

V3 supersedes the focus-only V2 ZIP. Mobile styles reduce hero/progress spacing and
place row actions beside the reminder instead of below it. All four ordinary
assigned slots must fit at 390×844 and 375×812, retaining 44px controls, readable
reminder text and explicit completion labels. The simulation stays below the
board. Long titles and open editors may grow naturally and scroll rather than
being truncated. Desktop presentation and the callback contract are unchanged.

## Dark theme revision — 12:11 CDT

V4 adds a UI-local Light/Dark switch with dark as the review default. Theme resets
to dark on reload; no storage, props, callbacks, core files or dependencies change.
The native button exposes `role="switch"`, a stable `Dark mode` label and
`aria-checked`; Space changes theme and keeps focus on the switch. An open editor
and its draft survive theme changes. Both themes retain the V3 focus repair.

Dark styles are scoped by `data-theme="dark"` on `.sb-app`: navy/charcoal surfaces,
light text, blue/light-blue actions and completed states, a light-blue focus ring,
readable error and disabled-control treatments. The existing light palette remains
available. The header switch is at least 76×44 pixels.

Isolated V4 checks: strict TypeScript and bundling passed. At both 390×844 and
375×812, in both themes with four assigned/completed reminders, row four ends at
y=711.875; no horizontal overflow and all controls measure at least 44×44. Toggle
keyboard state/focus, draft preservation, blank error, add, simulated completion,
and same-row Complete/Undo focus were checked. These are isolated fixture results;
Ivan must verify the integrated V4 preview after applying the UI-only files.

Computed dark text contrast: pending title 14.37:1; completed title 10.41:1; slot
labels 8.69:1; action text 8.98:1; error 9.83:1; disabled simulator label 8.09:1;
toggle label 11.84:1. Focus outline is 3px light blue with a 4px offset. Reduced
motion rules are unchanged. Long titles/open editors may scroll; actual
screen-reader speech and forced reduced-motion runtime remain untested.

## Charcoal glass styling — V5, 12:34 CDT

The human supplied six visual references and requested dark mode, liquid glass,
soft dimensional controls and blue accent `#3082b0`. This revision changes only
`src/ui/reminders.css` and this note. `ReminderApp.tsx` is byte-for-byte V4; there
is no component, state, persistence, callback, dependency or setup change.

Dark styling now uses charcoal surfaces, static blue background lighting, frosted
panels, subtle edge highlights, rounded state chips and recessed/raised controls.
`--sb-brand` and `--sb-accent` are exactly `#3082b0`; action text uses the lighter
`#85caed` for readability. Typography uses the system sans-serif family. The
references are inspiration only; no image asset or pre-existing app code is copied.

Opaque surfaces are declared first. An `@supports` block enhances them with
translucency, `backdrop-filter` and `-webkit-backdrop-filter`. No decorative layer
intercepts input and no new animation is added. Light mode and existing motion
preferences remain intact. Ivan reported testing forced reduced motion on V4;
Yosh did not independently test that runtime. Actual screen-reader speech is
untested by both agents.

Isolated checks: esbuild CSS bundling passed. Four assigned/completed reminders
end at y=716.875 at both 390×844 and 375×812. No horizontal overflow; settled
buttons measure at least 44×44. Completion uses V4's existing brief scale animation.
An external fallback fixture omitting only the `@supports` enhancement rendered
with `backdrop-filter: none`; the same fit and settled target checks passed.
This simulates fallback CSS, not a separate physical browser without blur support.

Contrast checks use a deliberately light `#3d4d60` glass-surface swatch: primary
text 8.02:1, muted text 4.87:1, lighter-blue actions 4.80:1, pending control ring
3.67:1 and focus ring 6.50:1. Error text/opaque background is 9.92:1; disabled
label 8.99:1; primary button label/darkest gradient stop 9.04:1. Glass compositing
varies with the backdrop, so these are palette checks plus visual review, not a
claim of a complete accessibility audit.

V5 ZIP manifest contains only the two changed paths above. Ivan preserves V4 and
applies that diff, then checks integrated glass/fallback layout and readable focus.
Long-title/open-editor scrolling remains as before. No commit or push.

## Monochrome wave background — V6, 12:55 CDT

The human requested broad flowing background gradients inspired by the attached
wallpaper, using only shades of the blue accent. Added a newly drawn decorative
`src/ui/background-waves.svg` and referenced it from the dark root background.
The SVG uses static curved bands and blue gradients built around `#3082b0`; no
reference screenshot is copied. A dark overlay softens the lower bands. The glass
phone tint is slightly more translucent, with its text still on a dark surface;
the simulation backing is translucent and rounded to continue the background.

V6 changes exactly three paths: `src/ui/reminders.css`,
`src/ui/background-waves.svg`, and this note. `ReminderApp.tsx`, state, callbacks,
storage, setup and dependencies are unchanged. Vite handles the relative SVG URL
as a standard CSS asset. The isolated esbuild preview used an SVG data-url loader.

SVG XML parsing and CSS/asset bundling passed. Isolated four assigned/completed
rows still end at y=716.875 at both 390×844 and 375×812, with no horizontal
overflow and settled targets at least 44×44. Background asset and 18px card blur
were observed; keyboard Undo still focuses Complete. Phone and desktop previews
were visually reviewed. The wave is static; motion preferences remain intact.

The opaque fallback remains in place. Glass alpha is retained at about 64% on
the phone backing to restrain the brighter waves behind text; existing card,
error and control colors remain unchanged. Palette checks are sampled/design
evidence, not a complete accessibility audit of every composited pixel.

Ivan reported V5 live at 12:46. Yosh's independent access attempt failed: browser
navigation/focus timed out, and an HTTP connection to `10.206.228.53:5173` timed
out after 3004ms (HTTP 000). V6 images/checks are isolated, not integrated results.
Ivan should preserve V5, inspect/apply the three-path V6 diff and provide the
current reachable preview URL for independent review. No commit or push.

## Dark-only appearance — V7, 13:12 CDT

The human asked to remove Light mode. The header theme switch and its toggle-only
CSS are removed. The app now always renders the existing dark glass and blue-wave
appearance; there is no appearance state or theme persistence. Reminder behavior,
props, callbacks, core, storage and other visual treatments are unchanged.
Changed paths: this note, `src/ui/ReminderApp.tsx`, and
`src/ui/reminders.css`. Ivan should apply the UI-only files in his integration
checkout and confirm the preview no longer offers a Light mode control.

## Glass controls panel — V8, 13:20 CDT

The human requested removal of the top completion counter, moving the simulated
controls out of the reminder page, and a stronger liquid-glass treatment. The
entire progress/count panel is removed. A fixed corner “Try controls” button
opens a native modal dialog with a close button, Escape dismissal, and focus
restoration. The four simulator actions, labels, disabled empty slots, and their
callbacks are preserved. Glass surfaces now use stronger blur/saturation, more
translucency, layered highlights, and an ambient blue edge glow; on mobile the
blue wave wallpaper remains visible through the phone surface. No core, data,
storage, setup, or entry files changed. No tests run for this visual revision.

Isolated browser preview: the counter is absent, the dialog opens on both desktop
and phone sizes, Escape closes it, and focus returns to the corner trigger.
These are local fixture observations, not integrated-core or persistence results;
automated tests were not run. `src/ui/background-waves.svg` is unchanged.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, and this note.
Ivan should apply the V8 archive after completing V7 integration checks, then
verify the dialog and small-screen layout in the live preview.

## Centered add icon and close target — V9, 13:24 CDT

The human noted that the plus in the empty-slot add control looked off-center.
It is now drawn from two centered CSS strokes instead of a font glyph. Ivan also
found the dialog close button measured 42×42, below the agreed 44×44 minimum;
it is now 44×44. No action, modal, core, or storage behavior changed. Isolated
mobile preview visually confirms the plus is centered. The V9 ZIP should be
applied over V8 in the integration checkout; changed paths are this note and
`src/ui/reminders.css`, with `ReminderApp.tsx` included for a complete UI handoff
and `background-waves.svg` still unchanged.

## Richer liquid-glass surfaces — V10, 13:25 CDT

The human asked for more liquid glass. The phone, reminder cards, control cards,
simulation dialog and floating launcher now have brighter edge reflections,
layered blue-white highlights, deeper blur, stronger saturation, and slightly
more translucent dark surfaces. The existing monochrome wave background and
all layout, text, sizing and behavior remain unchanged. The screenshot preview
was reviewed in the local fixture at 633×895; no automated tests or full
contrast audit were run. Changed paths are this note and `src/ui/reminders.css`;
component and SVG are unchanged. Ivan should apply this CSS update after V9.

## Dark card corners — V11, 13:28 CDT

The human requested darker corners on existing reminder cards while keeping
their surfaces semi-transparent. Added dark radial shading at all four corners
for pending and completed cards. Card centers retain layered blue-white glass
reflections and alpha surfaces; supported browsers continue to use the existing
32px backdrop blur. The add-empty-slot card, component, wording, sizes and
behavior are unchanged. Local fixture preview was visually reviewed; no
automated tests or full contrast audit were run. Changed paths: this note and
`src/ui/reminders.css`. Ivan should apply V11 after V10.

## Reminders paired with physical controls — V12, 13:45 CDT

The human asked to redesign the board so each reminder is lined up with the
switch or dial that represents it. The four fixed rows now show Switch 1, Switch
2, Dial 1, and Dial 2 beside slots 1–4. The on-screen switch/dial button calls
the existing `onActivateControl(slotId)` prop, preserving mouse/pointer
simulation. In the preview fixture, that callback marks the matching reminder
complete; the actual UI does not connect to physical hardware. Existing
completion/undo, add/edit, focus behavior and storage remain parent-owned.

The separate simulation page/modal was removed. Empty rows retain their add
action and show the corresponding disabled control. Cards keep the semi
transparent dark-corner liquid-glass styling. The mobile control column narrows
at 380px and below. Local preview at 633×895 shows all four rows; clicking the
Switch 1 simulation button changed only its matching task to completed and
announced the update. The preview uses fixture callbacks and does not validate
the integrated core or physical hardware.

Changed paths: `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, and this note.
Ivan should apply V12 in the integration checkout and verify row mapping and
callback behavior there. No core, hardware, data, setup or entry files changed;
no commits or pushes.

## iPhone layout aligned to the enclosure — V13, 13:50 CDT

The human supplied a dimensioned enclosure drawing and asked for an iPhone 16
portrait layout, no header, control alignment, and less copy. The header,
section heading, visible save line, control names/instructions and status copy
were removed from the visual layout. Four equal-height glass reminder rows now
fill a centered full-height phone canvas, capped at 430px wide and constrained to
the iPhone 16 portrait ratio (46.13dvh) on wider viewports, with 5dvh top/bottom
insets. At 633×895, row centers land at approximately 16%, 39%, 62%, and 84%
of the viewport, matching the four evenly spaced hardware positions in the
drawing. On an iPhone 16 CSS viewport (393×852), the same proportional layout
preserves those positions. Slot numbers, task names, completion affordance,
short Edit/Undo actions, and one icon-only simulated control remain visible.

The drawing shows the upper pair as small rotary controls and lower pair as
toggle levers, so the visible/accessibility mapping is now slot 1=Dial 1,
2=Dial 2, 3=Switch 1, 4=Switch 2. Each still invokes `onActivateControl` with
its same numeric slot ID; no physical hardware integration was added. This
updates V12's earlier type labels to match the supplied physical reference.

The isolated preview was bundled and visually reviewed at 633×895; the four
rows fill the page and align at the stated relative positions. Accessibility
tree shows the updated dial/switch names; clicking Switch 1 completes its own
fixture task and announces it. This is fixture verification, not integrated
core, persistence or hardware verification. Changed paths are
`src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, and this note. Ivan should
apply V13 in the integration checkout and verify the visual mapping against
the final enclosure. No core, storage, setup, or entry files changed; no commits
or pushes.

## Charcoal neumorphic pass — V14, 13:56 CDT

The human requested a visual redesign using the dark finance-app and
neumorphism references while retaining the established blue-glass look. The
four-row iPhone grid and physical alignment remain unchanged. Reminder cards
now use restrained charcoal translucent surfaces with dark corner falloff,
subtle glass highlights, finer borders and softer blue completion lighting.
The icon-only simulated dial/switch buttons and completion circles have
recessed/raised shadow pairs to echo the soft tactile controls in the reference.
Visible Edit/Undo words are now a pencil and return-arrow icon with accessible
task-specific labels; reminder titles and the empty-slot Add action remain
visible. No extra metrics, chart data or product behavior were added.

The updated isolated preview was bundled and visually reviewed at phone
proportions. Accessibility names for Edit and Undo remain present, as do the
same slot-specific simulation button labels. No callback, state, storage or
physical integration changed. Changed paths are this note,
`src/ui/ReminderApp.tsx`, and `src/ui/reminders.css`. Ivan should apply V14 in
the integration checkout. No core or setup files changed; no commits or pushes.

## Browser chrome and verified UI repairs — V15, 14:28 CDT

The human reported white bands around the page in the iPhone browser and asked
that the outstanding Slack audit findings be carried into the UI checkout.
`ReminderApp` now temporarily applies dark color-scheme/background styling to
the document and body, adds or updates `meta[name=theme-color]` to `#081522`, and
restores prior document values if unmounted. The host `index.html` remains
Ivan-owned and unchanged. This is intended to tint supported mobile browser
chrome and prevent white overscroll; real-phone tint confirmation is pending.

The component now mirrors Ivan's verified UI repairs: add/edit callbacks return
boolean; editor mode is captured on open; `false` leaves the editor and draft
intact; Complete moves focus to Undo and Undo returns focus to Complete. CSS
restores 44×44 completion/editor action targets, keeps long reminder titles
scrollable within their row, and switches to document flow at viewport heights
under 600px so editors remain reachable when the keyboard shrinks the page.
Physical label mapping remains slot 1=Dial 1, 2=Dial 2, 3=Switch 1, 4=Switch 2.

Isolated fixture bundle and TypeScript check passed. Fixture interactions
verified Complete→Undo and Undo→Complete focus; rejected Add and Edit preserved
their draft and mode, and a subsequent accepted save closed the editor and
returned focus to the row action. At the default 633×895 browser viewport, root
and body backgrounds computed to `rgb(8, 21, 34)`, the live theme-color meta was
`#081522`, and all measured action targets were at least 44px. The browser
viewport override did not take effect in this IAB, so V15 was not independently
measured at 393×852 or 375×812. Ivan's integrated V14 report covers those sizes;
V15 still needs integration and an actual phone check for browser-bar tint,
keyboard resizing, and layout. No core, storage, entry, setup, dependency,
commit, or push changes.
