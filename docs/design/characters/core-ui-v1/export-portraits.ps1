[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$ManifestPath,
    [Parameter(Mandatory=$true)][string]$OutputVersion
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskPackageRoot = $PSScriptRoot
$taskWorkspaceRoot = [IO.Path]::GetFullPath((Join-Path $taskPackageRoot '../../../..'))
$taskManifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($OutputVersion -notmatch '^native-v[1-9][0-9]*$') { throw 'Expected a versioned native directory name.' }
$taskReports = @()
foreach ($taskPortrait in $taskManifest.portraits) {
    $taskSourcePath = [IO.Path]::GetFullPath((Join-Path $taskWorkspaceRoot $taskPortrait.sourcePath))
    $taskOutputPath = [IO.Path]::GetFullPath((Join-Path $taskPackageRoot ("portraits/" + $taskPortrait.slug + "/" + $OutputVersion)))
    if (-not $taskSourcePath.StartsWith($taskWorkspaceRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Source escaped workspace.' }
    if (-not $taskOutputPath.StartsWith($taskPackageRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Output escaped portrait package.' }
    if (Test-Path -LiteralPath $taskOutputPath) { throw "Output version already exists: $taskOutputPath" }
    $taskSource = [Drawing.Bitmap]::new($taskSourcePath)
    try {
        if ($taskSource.Width -ne $taskSource.Height) { throw 'Expected a square portrait source; inspect composition before export.' }
        [IO.Directory]::CreateDirectory($taskOutputPath) | Out-Null
        foreach ($taskSize in @(512,160,64)) {
            $taskBitmap = [Drawing.Bitmap]::new($taskSize,$taskSize,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
            $taskGraphics = [Drawing.Graphics]::FromImage($taskBitmap)
            $taskAttributes = [Drawing.Imaging.ImageAttributes]::new()
            try {
                $taskGraphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
                $taskGraphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
                $taskGraphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $taskGraphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $taskGraphics.Clear([Drawing.Color]::Transparent)
                $taskAttributes.SetWrapMode([Drawing.Drawing2D.WrapMode]::TileFlipXY)
                $taskTarget = [Drawing.Rectangle]::new(0,0,$taskSize,$taskSize)
                $taskGraphics.DrawImage($taskSource,$taskTarget,0,0,$taskSource.Width,$taskSource.Height,[Drawing.GraphicsUnit]::Pixel,$taskAttributes)
                $taskFilePath = Join-Path $taskOutputPath ("portrait-" + $taskSize + ".png")
                $taskBitmap.Save($taskFilePath,[Drawing.Imaging.ImageFormat]::Png)
                $taskAlphas = [Collections.Generic.HashSet[int]]::new()
                $taskOpaque = 0
                $taskMinX=$taskSize; $taskMinY=$taskSize; $taskMaxX=-1; $taskMaxY=-1
                for ($taskY=0; $taskY -lt $taskSize; $taskY++) {
                    for ($taskX=0; $taskX -lt $taskSize; $taskX++) {
                        $taskAlpha=[int]$taskBitmap.GetPixel($taskX,$taskY).A
                        [void]$taskAlphas.Add($taskAlpha)
                        if($taskAlpha -ge 128) {
                            $taskOpaque++
                            $taskMinX=[Math]::Min($taskMinX,$taskX); $taskMaxX=[Math]::Max($taskMaxX,$taskX)
                            $taskMinY=[Math]::Min($taskMinY,$taskY); $taskMaxY=[Math]::Max($taskMaxY,$taskY)
                        }
                    }
                }
                if (-not $taskAlphas.Contains(0) -or -not $taskAlphas.Contains(255)) { throw 'Portrait needs transparent and opaque pixels.' }
                if ($taskMinX -lt 1 -or $taskMinY -lt 1 -or $taskMaxX -ge $taskSize - 1 -or $taskMaxY -ge $taskSize - 1) { throw 'Portrait touches canvas edge; inspect source padding.' }
                foreach($taskCorner in @(@(0,0),@(($taskSize-1),0),@(0,($taskSize-1)),@(($taskSize-1),($taskSize-1)))) {
                    if($taskBitmap.GetPixel($taskCorner[0],$taskCorner[1]).A -ne 0) { throw 'Expected genuinely transparent portrait corners.' }
                }
                $taskReports += [pscustomobject]@{
                    characterId=$taskPortrait.characterId
                    slug=$taskPortrait.slug
                    sizePx=@($taskSize,$taskSize)
                    sourceSizePx=@($taskSource.Width,$taskSource.Height)
                    file=("portraits/" + $taskPortrait.slug + "/" + $OutputVersion + "/portrait-" + $taskSize + ".png")
                    bytes=(Get-Item -LiteralPath $taskFilePath).Length
                    alphaValues=$taskAlphas.Count
                    transparentCorners=$true
                    opaquePixelCount=$taskOpaque
                    opaqueBoundsPx=@($taskMinX,$taskMinY,($taskMaxX-$taskMinX+1),($taskMaxY-$taskMinY+1))
                }
            } finally {
                $taskAttributes.Dispose()
                $taskGraphics.Dispose()
                $taskBitmap.Dispose()
            }
        }
    } finally { $taskSource.Dispose() }
}
$taskReports | ConvertTo-Json -Depth 8
