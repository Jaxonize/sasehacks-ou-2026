<#
.SYNOPSIS
Creates a reviewable source handoff without committing, pushing, or changing source.
.EXAMPLE
./scripts/New-DemoSourceArchive.ps1 -OutputDirectory C:\Temp\demo-handoffs
.EXAMPLE
./scripts/New-DemoSourceArchive.ps1 -IncludePath src/ui -OutputDirectory C:\Temp\demo-handoffs
#>
[CmdletBinding()]
param(
    [string] $SourceRoot = (Split-Path -Parent $PSScriptRoot),
    [string] $OutputDirectory = (Join-Path ([IO.Path]::GetTempPath()) 'sasehacks-demo-handoffs'),
    [string[]] $IncludePath = @()
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root = (Resolve-Path -LiteralPath $SourceRoot).ProviderPath.TrimEnd('\', '/')
$rootPrefix = $root + [IO.Path]::DirectorySeparatorChar
$comparison = [StringComparison]::OrdinalIgnoreCase
$gitRoot = & git -C $root rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or [IO.Path]::GetFullPath($gitRoot).TrimEnd('\', '/') -ne $root) {
    throw 'SourceRoot must be the root of the event Git checkout.'
}
$remote = & git -C $root remote get-url origin
if ($LASTEXITCODE -ne 0 -or $remote -notmatch '^(https://github\.com/|git@github\.com:)Jaxonize/sasehacks-ou-2026(?:\.git)?/?$') {
    throw 'Expected origin Jaxonize/sasehacks-ou-2026. The older starter must not be packaged.'
}
$output = [IO.Path]::GetFullPath($OutputDirectory).TrimEnd('\', '/')
if ($output.Equals($root, $comparison) -or $output.StartsWith($rootPrefix, $comparison)) {
    throw 'Choose an OutputDirectory outside the source checkout.'
}
$includes = @($IncludePath | ForEach-Object {
    $relative = $_.Replace('\', '/').TrimEnd('/')
    if ([string]::IsNullOrWhiteSpace($relative) -or $relative.StartsWith('/') -or
        $relative -match '(^|/)\.\.(/|$)|:') {
        throw 'IncludePath must be a repository-relative file or folder, without .. or a drive prefix.'
    }
    $relative
})
$rawPaths = @(& git -C $root ls-files --cached --others --exclude-standard -z)
if ($LASTEXITCODE -ne 0) { throw 'Git could not enumerate source files.' }
$paths = (([string]::Join("`n", $rawPaths)) -split [char]0) |
    Where-Object { $_ } | Sort-Object -Unique
$selected = @()
foreach ($relative in $paths) {
    $relative = $relative.Replace('\', '/')
    if ($includes.Count -gt 0 -and -not @($includes | Where-Object {
        $relative -eq $_ -or $relative.StartsWith($_ + '/', $comparison)
    }).Count) { continue }
    if ($relative -match '(^|/)(\.git|node_modules|dist|build|coverage|\.next|\.vercel|\.cache|\.venv|venv|__pycache__)(/|$)') { continue }
    $name = ($relative -split '/')[-1]
    if ($name -match '^(\.env.*|\.npmrc|\.netrc|\.pypirc|\.DS_Store|credentials.*\.json|secrets.*\.json|service-account.*\.json)$' -or
        $name -match '\.(pem|key|pfx|p12|zip|7z|tar|gz)$') { continue }
    if ($relative -eq 'DEMO-SOURCE-MANIFEST.json') {
        throw 'DEMO-SOURCE-MANIFEST.json is reserved for the generated manifest.'
    }
    $fullPath = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (-not $fullPath.StartsWith($rootPrefix, $comparison)) { throw 'A source path escaped the checkout.' }
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) { continue }
    # Do not follow file links or linked folders into another checkout.
    $linked = $false
    $inspectPath = $fullPath
    while ($inspectPath -and -not $inspectPath.Equals($root, $comparison)) {
        $item = Get-Item -LiteralPath $inspectPath -Force
        if ($item.LinkType -in @('SymbolicLink', 'Junction')) { $linked = $true; break }
        $inspectPath = Split-Path -Parent $inspectPath
    }
    if ($linked) { continue }
    $selected += [PSCustomObject]@{ Relative = $relative; FullPath = $fullPath }
}
if ($selected.Count -eq 0) { throw 'No eligible source files matched. Nothing was created.' }

[IO.Directory]::CreateDirectory($output) | Out-Null
$stamp = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
$token = [Guid]::NewGuid().ToString('N').Substring(0, 8)
$archivePath = Join-Path $output "sasehacks-source-$stamp-$token.zip"
$partialPath = $archivePath + '.partial'
$manifestPath = $archivePath + '.manifest.json'
$hashPath = $archivePath + '.sha256.txt'
$utf8 = [Text.UTF8Encoding]::new($false)
$sha = [Security.Cryptography.SHA256]::Create()
$records = @()
$created = @()
$success = $false
try {
    $fileStream = [IO.File]::Open($partialPath, [IO.FileMode]::CreateNew)
    $created += $partialPath
    try {
        $zip = [IO.Compression.ZipArchive]::new($fileStream, [IO.Compression.ZipArchiveMode]::Create, $true)
        try {
            foreach ($file in $selected) {
                $bytes = [IO.File]::ReadAllBytes($file.FullPath)
                $digest = ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
                $entry = $zip.CreateEntry($file.Relative, [IO.Compression.CompressionLevel]::Optimal)
                $stream = $entry.Open()
                try { $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
                $records += [PSCustomObject]@{ path = $file.Relative; bytes = $bytes.Length; sha256 = $digest }
            }
            $commit = & git -C $root rev-parse HEAD
            if ($LASTEXITCODE -ne 0) { throw 'Could not identify the source commit.' }
            $manifest = [ordered]@{
                schemaVersion = 1
                repository = 'Jaxonize/sasehacks-ou-2026'
                baseCommit = [string]$commit
                createdUtc = [DateTime]::UtcNow.ToString('o')
                scope = $(if ($includes.Count) { $includes } else { @('all eligible tracked and untracked files') })
                note = 'Includes current working files, not just the base commit. No build or test claim.'
                fileCount = $records.Count
                files = $records
            } | ConvertTo-Json -Depth 8
            $entry = $zip.CreateEntry('DEMO-SOURCE-MANIFEST.json')
            $stream = $entry.Open()
            try {
                $bytes = $utf8.GetBytes($manifest)
                $stream.Write($bytes, 0, $bytes.Length)
            } finally { $stream.Dispose() }
        } finally { $zip.Dispose() }
    } finally { $fileStream.Dispose() }

    # A live editor must not silently produce a mixed-version handoff.
    foreach ($record in $records) {
        $current = (Get-FileHash -LiteralPath (Join-Path $root $record.path) -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($current -ne $record.sha256) { throw "Source changed while packaging: $($record.path). Save and retry." }
    }
    Move-Item -LiteralPath $partialPath -Destination $archivePath
    $created += $archivePath
    [IO.File]::WriteAllText($manifestPath, $manifest, $utf8)
    $created += $manifestPath
    $archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
    [IO.File]::WriteAllText($hashPath, "$archiveHash  $([IO.Path]::GetFileName($archivePath))`n", $utf8)
    $created += $hashPath
    $success = $true
    [PSCustomObject]@{ Archive = $archivePath; SHA256 = $archiveHash; Manifest = $manifestPath; HashFile = $hashPath; SourceFiles = $records.Count }
} finally {
    $sha.Dispose()
    if (-not $success) {
        # Only remove the unique output files created by this invocation; never source.
        foreach ($path in $created) {
            if (Test-Path -LiteralPath $path -PathType Leaf) { Remove-Item -LiteralPath $path -Force }
        }
    }
}
