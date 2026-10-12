param([switch]$Prune)
$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$archiveRoot = Join-Path $workspace 'docs/archive/actor-animation-pre-pixel02-2026-10-12'
$manifestFile = Join-Path $archiveRoot 'manifest.json'
$zipFile = Join-Path $archiveRoot 'sources.zip'
function CheckedPath([string]$relative) {
  $path = [IO.Path]::GetFullPath((Join-Path $workspace $relative))
  if (-not $path.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw "Outside workspace: $path" }
  return $path
}
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if ($Prune) {
  $manifest = Get-Content -LiteralPath $manifestFile -Raw | ConvertFrom-Json
  if ((Get-FileHash -LiteralPath $zipFile -Algorithm SHA256).Hash.ToLower() -ne $manifest.archiveSha256) { throw 'Archive changed' }
  # Validate every target first. All operations stay in PowerShell and inside workspace.
  foreach ($relative in $manifest.pruneTargets) {
    $path = CheckedPath $relative
    if (Test-Path -LiteralPath $path) {
      $files = if ((Get-Item -LiteralPath $path).PSIsContainer) { Get-ChildItem -LiteralPath $path -Recurse -File } else { Get-Item -LiteralPath $path }
      foreach ($file in $files) {
        $key = $file.FullName.Substring($workspace.Length + 1).Replace('\','/')
        $saved = $manifest.entries | Where-Object { $_.path -eq $key } | Select-Object -First 1
        if (-not $saved -or (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLower() -ne $saved.sha256) { throw "Unarchived/changed file: $key" }
      }
    }
  }
  foreach ($relative in $manifest.pruneTargets) {
    $path = CheckedPath $relative
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Recurse -Force }
  }
  Write-Output "Pruned $($manifest.pruneTargets.Count) verified targets; archive kept at $zipFile"
  exit
}
if (Test-Path -LiteralPath $manifestFile) { throw 'Archive already exists; inspect it instead of overwriting' }
$targets = @(
 'docs/design/characters/actor-animation-pilot-v1', 'docs/design/characters/actor-animation-production-v1', 'docs/design/characters/wang-lin-pixel-production-study-v1',
 'client/public/assets/actor-animation-pilot-v1','client/public/assets/actor-animation-production-v1',
 'client/actor-animation-pilot.html','client/actor-animation-production.html','client/actor-animation-arena.html',
 'client/src/actor-animation-pilot.ts','client/src/actor-animation-production.ts','client/src/actor-animation-arena.ts',
 'client/src/features/actor-animation-pilot.ts','client/src/features/actor-animation-production.ts','client/src/features/actor-animation-arena.ts',
 'client/src/ui/actor-animation-pilot-canvas.ts','client/src/ui/actor-animation-pilot-view.ts','client/src/ui/actor-animation-pilot.css',
 'client/src/ui/actor-animation-production-canvas.ts','client/src/ui/actor-animation-production-view.ts','client/src/ui/actor-animation-arena-view.ts','client/src/ui/actor-animation-arena.css',
 'scripts/build-actor-animation-pilot.mjs','scripts/register-actor-animation-pilot.mjs','scripts/sync-actor-animation-pilot.mjs',
 'scripts/build-actor-animation-production.mjs','scripts/build-actor-animation-presentation.mjs','scripts/prepare-actor-animation-production.mjs','scripts/record-actor-animation-production.mjs','scripts/sync-actor-animation-production.mjs','scripts/verify-actor-animation-production.mjs',
 'scripts/inspect-actor-animation-production.mjs','scripts/verify-wang-pixel-study.mjs',
 'tests/smoke/actor-animation-pilot-browser.mjs','tests/smoke/actor-animation-production-browser.mjs','tests/smoke/actor-animation-production-gpu.mjs','tests/smoke/wang-pixel-study-browser.mjs','tests/unit/actor-animation-production.test.ts',
 'docs/design/characters/wang-lin-pixel-production-v2/sources/run-southwest-v2.png','docs/design/characters/wang-lin-pixel-production-v2/sources/run-southwest-v2.prompt.txt',
 'docs/design/characters/wang-lin-pixel-production-v2/sources/run-west-v2.png','docs/design/characters/wang-lin-pixel-production-v2/sources/run-west-v2.prompt.txt',
 'docs/design/characters/wang-lin-pixel-production-v2/sources/run-northwest-v2.png','docs/design/characters/wang-lin-pixel-production-v2/sources/run-northwest-v2.prompt.txt',
 'docs/design/characters/wang-lin-pixel-production-v2/sources/run-northeast-v2.png','docs/design/characters/wang-lin-pixel-production-v2/sources/run-northeast-v2.prompt.txt',
 'docs/design/characters/wang-lin-pixel-wind-v1/sources/south-v1.png','docs/design/characters/wang-lin-pixel-wind-v1/sources/south.prompt.txt',
 'docs/design/characters/wang-lin-pixel-wind-v1/sources/north-v1.png','docs/design/characters/wang-lin-pixel-wind-v1/sources/north.prompt.txt'
)
$backup = @('docs/design/characters/wang-lin-pixel-production-v2/review.mjs','docs/design/characters/wang-lin-pixel-production-v2/index.html','docs/design/characters/wang-lin-pixel-production-v2/style-basis.json','docs/design/characters/wang-lin-pixel-production-v2/production-plan.json','docs/design/characters/wang-lin-pixel-wind-v1/review.mjs','docs/design/characters/wang-lin-pixel-wind-v1/index.html','docs/design/characters/wang-lin-pixel-wind-v1/production-plan.json','scripts/build-wang-pixel-study.mjs','scripts/verify-wang-pixel-production.mjs','scripts/verify-wang-pixel-wind.mjs')
New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null
$files = @{}; $entries = @()
foreach ($relative in ($targets + $backup)) {
 $path = CheckedPath $relative
 if (-not (Test-Path -LiteralPath $path)) { throw "Missing target: $relative" }
 $found = if ((Get-Item -LiteralPath $path).PSIsContainer) { Get-ChildItem -LiteralPath $path -Recurse -File } else { Get-Item -LiteralPath $path }
 foreach ($file in $found) { if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Symlink in archive target' }; $files[$file.FullName] = $file }
}
$zip = [IO.Compression.ZipFile]::Open($zipFile,[IO.Compression.ZipArchiveMode]::Create)
try { foreach ($file in ($files.Values | Sort-Object FullName)) {
 $key = $file.FullName.Substring($workspace.Length + 1).Replace('\','/')
 [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,$key,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
 $entries += @{path=$key;bytes=$file.Length;sha256=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLower()}
}} finally { $zip.Dispose() }
$zip = [IO.Compression.ZipFile]::OpenRead($zipFile)
try { foreach ($saved in $entries) {
 $entry = $zip.GetEntry($saved.path);$stream=$entry.Open();$hasher=[Security.Cryptography.SHA256]::Create()
 try { $hash=([BitConverter]::ToString($hasher.ComputeHash($stream))).Replace('-','').ToLower();if ($hash -ne $saved.sha256) { throw "ZIP mismatch: $($saved.path)" } } finally { $stream.Dispose();$hasher.Dispose() }
}} finally { $zip.Dispose() }
$manifest = @{date='2026-10-12';status='archive-verified-before-prune';archive='sources.zip';archiveSha256=(Get-FileHash -LiteralPath $zipFile -Algorithm SHA256).Hash.ToLower();pruneTargets=$targets;backupOnly=$backup;entries=$entries;scope='Superseded animation review packs and unused variants; live actor sources, owner map/DB, customization library and art references excluded.'}
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestFile -Encoding UTF8
Write-Output "Verified $($entries.Count) files in $zipFile ($((Get-Item -LiteralPath $zipFile).Length) bytes); nothing pruned yet."
