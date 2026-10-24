# Tactile Reminders — judging and submission draft

Prepared by Codex on Jaxon's design laptop, October 24, 2026, 2:07 p.m. CDT.
Working project name only; replace it if the team chooses a final name.

Current source checkpoint: published V30 at88acbfa8eb927a36124a71f20a2399020a08b4a9. Public demo: https://tactile-reminders-demo-2026.yvan314234.chatgpt.site/ . All21 tests/build and final-source browser checks passed independently; see2026-10-24-1634-codex-final-readme-audit.md. Simulator tap does nothing: swipe right to complete/left to Undo, or use the completion circle/Undo buttons. Urgency persists; Braille toggle is visual mapping only. Public Google SDK/Connect button readiness observed, real account import not verified in this audit. Rehearse the exact build and use the README as the current features/usage reference.

Official submission update from Jaxon: https://ou-sasehacks.devpost.com/ requires the team repository link. Be set up and ready at 5:15 p.m. in Gallogly Hall, Room 127; judges circulate between tables. Final Devpost submission is on hold until Jaxon explicitly says to submit. Draft preparation is allowed.

Evaluation criteria: alignment with SASEHACKS FOR GOOD, technical depth/implementation, and creativity/originality. This pitch/walkthrough can support the required presentation; rehearse it with the final verified build and update feature claims only after live evidence exists.

## One-sentence description

A physical reminder board that pairs everyday tasks with satisfying switches and dials, demonstrated through a phone app and a 3D-printed enclosure.

## Approximately 60-second pitch

Everyday reminders can disappear into a long list of notifications. We wanted to give a small set of important tasks a fixed, physical place.

Our prototype pairs four reminders with two dials and two switches. Each control belongs to one task, and activating it marks that task complete. The idea is to make finishing a task tangible, satisfying, and easy to recognize.

For SASEHacks for Good, we're exploring how that interaction could support people who benefit from tactile routines, including people with ADHD and people with vision-accessibility needs. Those benefits still need testing with the people we want to serve.

Today, our working app demonstrates task assignment, editing, urgency, completion, undo, local saving, visual Braille titles and a black pixel-art cat with completion feedback. We also built a read-only importer for Google Tasks due today; describe real account import as working only after live consent/API verification. The printed controls are physical prototypes; we manually mirror their actions in the app. A connected device and a refreshable Braille display are future work.

## 90-second demonstration

Use the exact final phone/build selected by Ivan. Prepare four short sample tasks before judging: Bring water, Call family, Stretch, Pack a snack. These are demonstration data, not additional product requirements.

| Time | Presenter action | Suggested narration |
|---|---|---|
| 0–15 seconds | Show the board and four assigned rows. | “Each reminder has a fixed position beside its own control.” |
| 15–35 seconds | Activate a printed control, then openly use its corresponding on-screen simulation control with the accepted build's gesture. | “These printed controls aren't electronically connected yet; this on-screen action simulates the signal the real device would send.” |
| 35–50 seconds | Show the completed row, cat feedback and confetti. | “Finishing a task gets a small encouraging response.” In V30 swipe right completes/left undoes; taps on the simulator do nothing. The separate core command for future hardware is completion-only/idempotent. |
| 50–65 seconds | Use the separate Undo action, then complete the task again. | “Undo is an explicit app action.” |
| 65–80 seconds | Edit one short task and save. | “People can assign the reminders that matter to their day.” |
| 80–90 seconds | Close with the physical product and future direction. | “Our next step is connecting the controls and testing this interaction with users, including nonvisual access.” |

Show reload persistence only if useful and time permits, on the same origin/browser. Do not change host addresses during the demonstration: localStorage is origin-specific. Rehearse the exact final mapping against the printed enclosure: top Dial 1, Dial 2, then Switch 1, Switch 2, with numeric rows fixed at 1–4.

Optional Google segment, only after successful live account testing: leave one row empty, sign in on the actual approved origin, choose a real demo task due today, select the empty slot and import. State that completion stays local and does not modify Google. A laptop localhost import does not appear on another device. If live OAuth remains blocked, show the working local reminders and describe the importer as implemented but not live-verified; do not present fixtures as a real connection.

## Submission description draft

Tactile Reminders explores a tangible way to manage a small set of everyday tasks. Our prototype pairs four fixed reminders with two dials and two switches, using satisfying physical actions to represent completion. We built a mobile web app for assigning, editing, completing and undoing tasks, with local saving, a black pixel-art cat and completion feedback, and a dark glass interface designed to align with a 3D-printed enclosure. A read-only Google Tasks importer brings tasks due today into empty slots after OAuth configuration; live account verification is still pending at this checkpoint. The phone and on-screen controls demonstrate the software interaction; the printed controls are not electronically connected. We want to develop connected hardware and explore accessible tactile output, including Braille, through testing with intended users.

## Judge questions

**What actually works today?** The app's reminder actions and local persistence. Use the final integrated build's verified features; all four simulated control inputs complete their assigned tasks.

**Are the physical controls connected?** No. They demonstrate the physical interaction. The presenter openly mirrors each action using the corresponding app control.

**Does the prototype output Braille?** It can visually map reminder titles to Unicode Braille characters. That is not tactile output or validated complete transcription. The phone stands in for the future integrated display; refreshable Braille is a proposed hardware direction.

**Why does this help people with ADHD?** We are exploring whether a visible routine plus a satisfying tactile completion action is useful. We have not established a clinical or measured dopamine benefit.

**What about blind users?** Phones can already be accessed through screen readers. We are exploring a dedicated tactile interface, with accessible app controls and announcements. Actual screen-reader speech remains a testing gap in the current evidence; do not claim user validation or complete accessibility certification.

**Where is the data?** Reminders stay in this browser's localStorage; there is no cloud synchronization between devices. The optional Google Tasks importer requests read-only Google access and keeps the access token in memory. Local completion does not modify Google. Current sequential same-origin tab handling has been repaired; simultaneous writes are not transactional.

## Preparation and remaining human inputs

- Review the official Devpost form at https://ou-sasehacks.devpost.com/ for required fields, deliverable format and any edit-after-submission rules. The repository link and a ready presentation are now explicit organizer requirements; remaining form details still need review. Do not finalize the entry without Jaxon's explicit authorization.
- Fill in the final project name, team member names, project category and any required attribution fields.
- Have Ivan identify one final integrated source snapshot and retain a backup. The complete app is published at https://github.com/Jaxonize/sasehacks-ou-2026 (V30 source checkpoint88acbfa). This chat's docs were published separately under Jaxon's explicit authorization. Source publication does not authorize final Devpost submission.
- Record a short software demonstration before the print finishes. Keep the video and screenshots available locally on the presenting laptop/phone.
- Confirm the demo phone can reach the final host, the laptop stays awake, and the host URL is unchanged. Rehearse loading and task entry on that exact device.
- Prepare phone mounting, fasteners/tools and control assembly before the print is ready. Test hand position/row alignment against the enclosure drawing in advance.
- The earlier 2:45 software target was superseded by authorized Google/cat additions. Follow coordination/RELEASE_CHECKLIST.md: choose the final version around 3:30, resolve Google/phone evidence or fallback by 3:45, prepare recording/source by 4:00 and presentation/draft/rehearsal by 4:15. Prepare assembly before the expected 4:45 print finish. Target 5:00 for assembly/submission verification with Jaxon's explicit final submission authorization, leaving travel time to Gallogly before 5:15.

## Fallback if the print or network slips

Keep a rehearsed phone-app walkthrough and the local recording ready. Show whatever physical parts are complete or the enclosure drawing, and accurately describe the hardware as a prototype. Use the verified earlier app build if a newer visual version has not passed integration. Resolve the fallback phone/host route before judging rather than relying on a last-minute public deployment.

## Presenter handoff

One person explains the problem and intended community benefit; one operates the phone and controls; another can explain printing/implementation and answer questions. Choose roles during rehearsal. Keep the pitch focused on what judges can see and try.
