# Source handoff helper

Run `New-DemoSourceArchive.ps1` from PowerShell in the fresh event checkout. Git and PowerShell are required. The helper does not commit, push, install dependencies, run project code, or change source files.

Save the working files and pause edits during packaging. This includes eligible tracked **and untracked** files, so new uncommitted app files are included. Files ignored by Git are omitted.

## Full source snapshot

```powershell
.\scripts\New-DemoSourceArchive.ps1
```

Outputs go to `sasehacks-demo-handoffs` under your system's temporary folder. The command prints the ZIP path, archive SHA-256, manifest path and file count. To choose a lasting backup location outside the checkout:

```powershell
.\scripts\New-DemoSourceArchive.ps1 -OutputDirectory 'C:\demo-backups'
```

## Only the owned UI paths

```powershell
.\scripts\New-DemoSourceArchive.ps1 -IncludePath 'src/ui'
```

Or choose exact files:

```powershell
.\scripts\New-DemoSourceArchive.ps1 -IncludePath 'src/ui/ReminderApp.tsx','src/ui/reminders.css','src/ui/INTEGRATION.md'
```

ZIP entries keep their repository-relative paths, for example `src/ui/ReminderApp.tsx`. They are not flattened. Each handoff includes an embedded `DEMO-SOURCE-MANIFEST.json` and a matching external manifest with per-file hashes and the base Git commit. The current working files may differ from that commit; packaging is not a build/test certification.

The helper checks that origin is `Jaxonize/sasehacks-ou-2026`, rejects output inside the checkout, skips symbolic links/junctions, and fails if selected source content changes during packaging. It creates uniquely named files and never overwrites an existing archive.

Git metadata, dependencies, common build/cache folders, existing archives, `.env*`, private-key formats and common credential/config filenames are excluded. Filename exclusions are not a scan for credentials embedded in source: review the manifest and source before sharing. Generated manifests do not include source-file contents.

## Receiver steps

1. Compare the archive SHA-256 with the sender's message.
2. Inspect the manifest and exact changed-file diff against your current integration. A full UI snapshot can contain unchanged files too.
3. Preserve the current working build before applying files. A valid hash does not establish permission to overwrite another owner's changes or prove compatibility.
4. Apply only the agreed paths, retain integration repairs, and run the checks affected by the actual diff.

Sharing an archive is a separate action; this helper never uploads it. Do not put handoff ZIPs in Git. Commit/push/deployment authorization remains with Jaxon.
