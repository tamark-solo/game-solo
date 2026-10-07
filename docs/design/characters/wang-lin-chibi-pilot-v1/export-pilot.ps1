param(
    [string]$SourcePath = 'docs/design/characters/wang-lin-chibi-pilot-v1/wang-lin-chibi-east-source-v2.png',
    [string]$OutputDirectory = 'docs/design/characters/wang-lin-chibi-pilot-v1/native-v1'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = (Get-Location).Path
$taskSource = (Resolve-Path -LiteralPath $SourcePath).Path
$taskOutput = [System.IO.Path]::GetFullPath((Join-Path $taskRoot $OutputDirectory))
if (Test-Path -LiteralPath (Join-Path $taskOutput 'atlas.png')) { throw 'Choose a new output version.' }
$taskTemplate = Get-Content -LiteralPath docs/design/characters/gait-correction-v1/export-gait.ps1 -Raw -Encoding UTF8
$taskCode = [regex]::Match($taskTemplate, '(?s)using System;.*?(?=\r?\n''@\r?\n)').Value
if (-not $taskCode) { throw 'Cannot find the packing helper.' }
$taskCode = $taskCode.Replace('GaitPackerV1', 'ChibiPackerV1').Replace('GaitFrameReport', 'ChibiFrameReport')
$taskCode = $taskCode.Replace('large.Count!=8', 'large.Count!=5').Replace('Need eight isolated', 'Need five isolated')
$taskCode = $taskCode.Replace('large.GetRange(row*4,4)', 'large.GetRange(row*3,row==0?3:2)')
$taskCode = $taskCode.Replace('for(int i=0;i<8;i++)', 'for(int i=0;i<5;i++)')
$taskCode = $taskCode.Replace('referenceHead=HeadCenter(p,64,Rectangle.FromLTRB(minX,minY,maxX+1,maxY+1));', 'referenceHead=32;')
$taskCode = $taskCode.Replace('int w=64*atlasColumns,h=96*4;', 'int w=64*atlasColumns,h=96;')
Add-Type -TypeDefinition $taskCode -ReferencedAssemblies System.Drawing,System.Core,System
$taskLegacyRoot = Join-Path $taskRoot 'docs/design/characters/wang-lin-gray-walk-v1/native-v2'
$taskLegacy = Get-Content -LiteralPath (Join-Path $taskLegacyRoot 'atlas.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskColors = New-Object 'System.Drawing.Color[]' 24
for ($taskIndex=0; $taskIndex -lt 24; $taskIndex++) {
    $taskHex = $taskLegacy.palette[$taskIndex].Substring(1)
    $taskColors[$taskIndex] = [System.Drawing.Color]::FromArgb([Convert]::ToInt32($taskHex.Substring(6,2),16),[Convert]::ToInt32($taskHex.Substring(0,2),16),[Convert]::ToInt32($taskHex.Substring(2,2),16),[Convert]::ToInt32($taskHex.Substring(4,2),16))
}
$taskFramesRoot = Join-Path $taskOutput 'frames'
New-Item -ItemType Directory -Path $taskFramesRoot -Force | Out-Null
$taskStandReference = Join-Path $taskLegacyRoot $taskLegacy.frames.($taskLegacy.animations.stand_east[0]).image
$taskReports = @([ChibiPackerV1]::ExportDirection($taskSource,$taskFramesRoot,'wanglin_chibi_','east',$taskStandReference,$taskColors))
$taskFrames = [ordered]@{}
$taskFiles = New-Object 'System.Collections.Generic.List[string]'
$taskNames = @('wanglin_chibi_stand_east','wanglin_chibi_walk_east_00','wanglin_chibi_walk_east_01','wanglin_chibi_walk_east_02','wanglin_chibi_walk_east_03')
for ($taskIndex=0; $taskIndex -lt 5; $taskIndex++) {
    $taskTemporary = Join-Path $taskFramesRoot ('wanglin_chibi_walk_east_{0:00}.png' -f $taskIndex)
    # Read the raw crops first; assigning names must not overwrite a later crop.
    Copy-Item -LiteralPath $taskTemporary -Destination (Join-Path $taskFramesRoot ('source-pose-{0}.png' -f $taskIndex))
}
for ($taskIndex=0; $taskIndex -lt 5; $taskIndex++) {
    $taskName = $taskNames[$taskIndex]
    $taskFile = Join-Path $taskFramesRoot ($taskName+'.png')
    Copy-Item -LiteralPath (Join-Path $taskFramesRoot ('source-pose-{0}.png' -f $taskIndex)) -Destination $taskFile
    $taskFiles.Add($taskFile)
    $taskFrames[$taskName] = [ordered]@{frame=[ordered]@{x=$taskIndex*64;y=0;w=64;h=96};sourceSize=[ordered]@{w=64;h=96};rotated=$false;trimmed=$false;anchorPx=@(32,88);image='frames/'+$taskName+'.png';pixelHash=$taskReports[$taskIndex].PixelHash}
}
[ChibiPackerV1]::Atlas($taskFiles.ToArray(),@(0,1,2,3,4),@(0,0,0,0,0),(Join-Path $taskOutput 'atlas.png'),5,$taskColors)
for ($taskIndex=0; $taskIndex -lt 5; $taskIndex++) { Remove-Item -LiteralPath (Join-Path $taskFramesRoot ('source-pose-{0}.png' -f $taskIndex)) }
Remove-Item -LiteralPath (Join-Path $taskFramesRoot 'wanglin_chibi_walk_east_04.png')
$taskMeta = [ordered]@{
    schemaVersion='pixel-atlas-1';characterId='CHR-WANG-LIN-CHIBI-EAST-PILOT';sourceCharacterId='CHR-WANG-LIN';costume='gray';previewOnly=$true;availableDirections=@('east');identityApprovedByProjectOwner=$false;animationStatus='chibi_pilot_pending_owner_review';frameSizePx=@(64,96);footAnchorPx=@(32,88);fps=8;palette=$taskLegacy.palette;frames=$taskFrames;animations=[ordered]@{stand_east=@($taskNames[0]);walk_east=@($taskNames[1..4])};meta=[ordered]@{image='atlas.png';size=[ordered]@{w=320;h=96};format='indexed_png';scale=1};sourceImage='../'+[System.IO.Path]::GetFileName($taskSource);referenceUrl='https://www.pinterest.com/pin/480196379041020113/';proportionTarget='approximately_2_7_heads';walkPhase=@('contact_a','passing_b','contact_b','passing_a');export=[ordered]@{artMethod='built_in_image_gen';geometryGeneratedByCode=$false;reports=$taskReports}
}
[System.IO.File]::WriteAllText((Join-Path $taskOutput 'atlas.json'),($taskMeta | ConvertTo-Json -Depth 14), (New-Object System.Text.UTF8Encoding($false)))
[pscustomobject]@{frames=5;walkFrames=4;direction='east';output=$taskOutput} | ConvertTo-Json -Compress
