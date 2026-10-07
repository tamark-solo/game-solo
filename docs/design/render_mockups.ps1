param(
    [string[]]$MockupNames = @(),
    [string]$BrowserPath = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $BrowserPath -PathType Leaf)) {
    throw 'Browser not found. Pass a Chrome or Edge path using -BrowserPath.'
}
$renderRoot = $PSScriptRoot
$previewProfileRoot = Join-Path $env:TEMP ('game-solo-ux-' + [Guid]::NewGuid().ToString('N'))
$drawings = @(Get-ChildItem -LiteralPath $renderRoot -Filter '*.svg' -File)
if ($MockupNames.Count -gt 0) {
    $drawings = @($drawings | Where-Object { $MockupNames -contains $_.BaseName })
    if ($drawings.Count -ne $MockupNames.Count) { throw 'A requested mockup name has no matching SVG file.' }
}
foreach ($drawing in $drawings) {
    [xml]$svg = Get-Content -Raw -Encoding UTF8 -LiteralPath $drawing.FullName
    $pngPath = Join-Path $renderRoot ($drawing.BaseName + '.png')
    $profilePath = $previewProfileRoot + '-' + $drawing.BaseName
    $browserArguments = @(
        '--headless', '--disable-gpu', '--hide-scrollbars',
        '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
        '--allow-file-access-from-files', '--virtual-time-budget=1500',
        ('--user-data-dir="' + $profilePath + '"'),
        ('--window-size=' + $svg.DocumentElement.GetAttribute('width') + ',' + $svg.DocumentElement.GetAttribute('height')),
        ('--screenshot="' + $pngPath + '"'),
        ([System.Uri]$drawing.FullName).AbsoluteUri
    )
    $renderStartedAt = [DateTime]::UtcNow
    $renderProcess = Start-Process -FilePath $BrowserPath -ArgumentList $browserArguments -WindowStyle Hidden -PassThru
    if (-not $renderProcess.HasExited) {
        try { Wait-Process -Id $renderProcess.Id -Timeout 25 -ErrorAction Stop }
        catch { Stop-Process -InputObject $renderProcess -ErrorAction SilentlyContinue; throw }
    }
    if (-not (Test-Path -LiteralPath $pngPath -PathType Leaf)) { throw ('PNG was not created: ' + $drawing.BaseName) }
    if ((Get-Item -LiteralPath $pngPath).LastWriteTimeUtc -lt $renderStartedAt) {
        throw ('PNG was not refreshed: ' + $drawing.BaseName)
    }
    Write-Output ('Rendered ' + $drawing.BaseName)
}
