# Current V22 integration — October 24, 2026

Ivan explicitly authorized V22 integration and push. Source archive SHA256:
3e8786a4e376ba441f5542979c7c83148498bec843e25a5321a9a406530c0607.
ReminderApp.tsx and reminders.css match Yosh's V22 candidate. The app retains
locally bundled JetBrains Mono, boolean | void callback compatibility, 44px
Hide/Show and pointer-transparent artwork. Cat size is 170px with five randomized
waypoints, pauses and stationary turns. Completion clicks create 26 blue/black/
white confetti pieces; Undo creates none; pieces clean up after 1250ms. Reduced
motion CSS disables cat and confetti animations. Core, Google and companion
sources remain unchanged. Earlier summaries below are historical.

---
# Accepted V21 integration — October 24, 2026

Ivan selected V21 and explicitly requested fixes followed by a Git push.
V21 restores full-height cards and a 68px cat roaming on randomized waypoints.
Integrated repairs retain boolean | void callbacks, a 44px Hide/Show target,
pointer-transparent cat artwork, and celebration feedback that preserves roaming.
Reduced-motion CSS disables both animations. UI controls toggle Complete/Undo;
core hardware activation remains idempotent completion-only. Core, Google and
companion component sources are unchanged. Google OAuth remains unconfigured.
Source archive SHA256: b6cbe57720abdca89a3758dcc17b9534683fbaa19a714fee401b54c690168602.
Earlier sections below are historical and superseded by this summary.

---
# Current integrated contract — V19, October 24, 2026

V19 is integrated on the verified V18 + Google Tasks + cat checkpoint. Ivan
explicitly authorized integration. Both the completion circle and the on-screen
simulated control toggle Complete/Undo. Core onActivateControl remains an
idempotent completion-only command. Slots remain Dial 1, Dial 2, Switch 1,
Switch 2. Add/edit callbacks retain boolean | void; false preserves the draft
and captured editor mode. Completion focuses Undo; Undo focuses Complete.

Input archive SHA256:
1baa5f9bbb4384fc0b93a78042a97bc430760a820fa055f4c6ccb0b5ac965136.
ReminderApp.tsx and reminders.css were integrated; the archive's older handoff
was superseded with this summary. Integration repairs restore callback types,
strengthen footer/cat CSS specificity against later-loaded styles, keep the
walking sprite clear of Hide/Show, and separate row controls from Edit/Undo.

Mobile row centers are approximately 15/38/61/84 percent. The 48px walking cat
occupies the lane below row four, above Google Tasks. Hide/Show has a 44px target.
The cat still celebrates existing reminders' incomplete-to-complete transitions
and supports reduced motion. Core, Google and companion source are unchanged.
Google OAuth is unconfigured; live sign-in/import remains untested. No physical
hardware is connected. Actual iPhone audio/keyboard/safe-area checks remain.

All 20 tests and TypeScript/production build pass. Fresh integrated browser
checks cover 375x812, 393x852 and a 375x400 editor viewport. See
coordination/updates/2026-10-24-1526-v19-integration.md for evidence and limits.
Everything below is historical and superseded by this current V19 contract.

---
# Current integrated contract — V18 + Google Tasks + cat, October 24, 2026

V18 is integrated over Ivan's verified Google Tasks checkpoint. Slots remain
1=Dial 1, 2=Dial 2, 3=Switch 1, 4=Switch 2. Add/edit callbacks retain
`boolean | void`: false keeps the draft and captured Add/Edit mode. Complete
focuses Undo; Undo focuses Complete. All controls retain 44px minimum targets;
long titles scroll within their row and <=600px viewports use flowing editors.

The four UI files came from the verified V18 archive (SHA256
ee3d9475f3c920948257be07608fdc09e46173b2abc83241d0bd4191676711f8).
Integration changes only its narrowed boolean callback types back to the agreed
boolean | void contract and adds this current summary. V18 supplies lighter
glass, completion checks/click audio, and dark document/safe-area metadata.

App mounts GoogleTasksImport and CatCompanion in a shared normal-flow footer
AFTER the full-height board; neither overlaps the aligned rows. Core and Google
source files are unchanged. Google OAuth remains unconfigured, with truthful
setup-needed messaging. The cat uses the original verified PNG/source archive,
rewards only existing reminders' incomplete-to-complete transitions, and
supports hide/show and reduced motion. No physical hardware is connected.

See the latest integration note for measured browser checks and limitations.
Earlier handoff sections below are historical and superseded by this contract.

---
# Current UI contract — V18, October 24, 2026

This section is authoritative. The revision notes below are historical; where
they disagree with this summary, use this summary and the current component.

Ownership and files:
- Yosh owns `src/ui/ReminderApp.tsx`, `src/ui/reminders.css`, and this handoff.
- Ivan owns app entry/setup, state/actions, types, storage, and integration.
- Import `{ ReminderApp }` from `./ui/ReminderApp`; no added UI dependencies.

Contract:
- `slots` is parent-owned state in stable numeric order 1–4. Physical labels are
  slot 1=Dial 1, 2=Dial 2, 3=Switch 1, 4=Switch 2. Do not renumber stored slots.
- `onAdd(slotId,title)` and `onEdit(slotId,title)` return `boolean`. `false`
  means rejected; keep the editor and draft open. Any accepted result closes it.
- `onComplete`, `onUndo`, and `onActivateControl` are parent-owned actions.
  Completion controls preserve focus to the newly available Undo action; Undo
  returns focus to Complete. A simulated control calls `onActivateControl` and
  repeated completion stays complete. Empty physical controls are disabled.
- Core errors arrive via `error`; the component keeps role=alert, completion
  announcements, a hidden save-status announcement, and the 200-character limit.
- The page is a full-height iPhone 16 portrait board with four equal-position
  task rows, no visual header, dark browser/document chrome, and reduced copy.
  The simulated-control buttons use a quiet glass outline and draw a checkmark
  on completion; decorative dial and switch graphics are removed. User-initiated
  completion plays a short, brighter, click-like cue using Web Audio where
  available.
  `ReminderApp` temporarily adds `viewport-fit=cover`, dark document backgrounds,
  and zero body margin so the artwork can extend into the iPhone safe area.
  At narrow viewport heights (including keyboard resize), editors switch to
  document flow. Long titles scroll inside their row without covering actions.
- Interactive targets remain at least 44×44 CSS pixels; the slot number/title
  and other UI remain usable with keyboard focus and reduced motion.
- This is a local reminders UI; displayed controls are simulations and no
  physical hardware is connected.

Status: Ivan's integrated V14 includes the verified reliability, focus, label,
44px-target, and short-viewport repairs. V18 below carries these UI-side fixes
into this checkout, makes the glass more transparent, removes decorative
control art, and extends the page into the iPhone safe area. It remains a UI-only
candidate until Ivan applies it; actual iPhone browser-bar tint still needs a
human device reload check.

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
