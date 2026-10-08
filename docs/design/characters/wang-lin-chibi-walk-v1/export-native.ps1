param(
    [string]$OutputDirectory = 'docs/design/characters/wang-lin-chibi-walk-v1/native-v1'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = (Get-Location).Path
$taskSourceRoot = $PSScriptRoot
$taskOutput = [System.IO.Path]::GetFullPath((Join-Path $taskRoot $OutputDirectory))
if (-not $taskOutput.StartsWith($taskRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Output must stay inside the workspace.' }
if (Test-Path -LiteralPath $taskOutput) { throw 'Choose a new output version; output already exists.' }
$taskEastRoot = Join-Path $taskRoot 'docs/design/characters/wang-lin-chibi-pilot-v1/native-v1'
$taskEast = Get-Content -LiteralPath (Join-Path $taskEastRoot 'atlas.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if (($taskEast.frameSizePx -join ',') -ne '64,96' -or ($taskEast.footAnchorPx -join ',') -ne '32,88') { throw 'Unsupported approved east frame/anchor.' }

# Reuse the source-sheet crop/palette helper. It samples drawn poses; it does
# not synthesize anatomy, mirror directions or tween raster geometry.
$taskTemplate = Get-Content -LiteralPath (Join-Path $taskRoot 'docs/design/characters/gait-correction-v1/export-gait.ps1') -Raw -Encoding UTF8
$taskCode = [regex]::Match($taskTemplate, '(?s)using System;.*?(?=\r?\n''@\r?\n)').Value
if (-not $taskCode) { throw 'Packing helper not found.' }
$taskCode = $taskCode.Replace('GaitPackerV1', 'ChibiFourPackerV1').Replace('GaitFrameReport', 'ChibiFourFrameReport')
$taskCode = $taskCode.Replace('large.Count!=8', 'large.Count!=5').Replace('Need eight isolated', 'Need five isolated')
$taskCode = $taskCode.Replace('large.GetRange(row*4,4)', 'large.GetRange(row*3,row==0?3:2)')
$taskCode = $taskCode.Replace('for(int i=0;i<8;i++)', 'for(int i=0;i<5;i++)')
$taskCode = $taskCode.Replace('referenceHead=HeadCenter(p,64,Rectangle.FromLTRB(minX,minY,maxX+1,maxY+1));', 'referenceHead=32;')
Add-Type -TypeDefinition $taskCode -ReferencedAssemblies System.Drawing,System.Core,System
$taskColors = New-Object 'System.Drawing.Color[]' $taskEast.palette.Count
for ($taskIndex=0; $taskIndex -lt $taskColors.Length; $taskIndex++) {
    $taskHex = $taskEast.palette[$taskIndex].Substring(1)
    $taskColors[$taskIndex] = [System.Drawing.Color]::FromArgb([Convert]::ToInt32($taskHex.Substring(6,2),16),[Convert]::ToInt32($taskHex.Substring(0,2),16),[Convert]::ToInt32($taskHex.Substring(2,2),16),[Convert]::ToInt32($taskHex.Substring(4,2),16))
}
$taskFramesRoot = Join-Path $taskOutput 'frames'
New-Item -ItemType Directory -Path $taskFramesRoot -Force | Out-Null
$taskDirections = @('south','west','east','north')
$taskSources = [ordered]@{south='south-source-v1.png';west='west-source-v2.png';north='north-source-v1.png'}
$taskDefinitions = [ordered]@{}
$taskAnimations = [ordered]@{}
$taskReports = [ordered]@{}
$taskFiles = New-Object 'System.Collections.Generic.List[string]'
$taskColumns = New-Object 'System.Collections.Generic.List[int]'
$taskRows = New-Object 'System.Collections.Generic.List[int]'
$taskReference = Join-Path $taskEastRoot $taskEast.frames.wanglin_chibi_stand_east.image
for ($taskRow=0; $taskRow -lt 4; $taskRow++) {
    $taskDirection = $taskDirections[$taskRow]
    $taskNames = @('wanglin_chibi_stand_'+$taskDirection) + @(0..3 | ForEach-Object { 'wanglin_chibi_walk_{0}_{1:00}' -f $taskDirection,$_ })
    if ($taskDirection -ne 'east') {
        $taskReports[$taskDirection] = @([ChibiFourPackerV1]::ExportDirection((Join-Path $taskSourceRoot $taskSources[$taskDirection]),$taskFramesRoot,'crop_',$taskDirection,$taskReference,$taskColors))
    }
    for ($taskColumn=0; $taskColumn -lt 5; $taskColumn++) {
        $taskName = $taskNames[$taskColumn]
        $taskDestination = Join-Path $taskFramesRoot ($taskName+'.png')
        if ($taskDirection -eq 'east') {
            Copy-Item -LiteralPath (Join-Path $taskEastRoot $taskEast.frames.$taskName.image) -Destination $taskDestination
            $taskHash = $taskEast.frames.$taskName.pixelHash
        } else {
            $taskCrop = Join-Path $taskFramesRoot ('crop_walk_{0}_{1:00}.png' -f $taskDirection,$taskColumn)
            Copy-Item -LiteralPath $taskCrop -Destination $taskDestination
            Remove-Item -LiteralPath $taskCrop
            $taskHash = $taskReports[$taskDirection][$taskColumn].PixelHash
        }
        $taskDefinitions[$taskName] = [ordered]@{frame=[ordered]@{x=$taskColumn*64;y=$taskRow*96;w=64;h=96};sourceSize=[ordered]@{w=64;h=96};rotated=$false;trimmed=$false;anchorPx=@(32,88);image='frames/'+$taskName+'.png';pixelHash=$taskHash}
        $taskFiles.Add($taskDestination)
        $taskColumns.Add($taskColumn)
        $taskRows.Add($taskRow)
    }
    $taskAnimations['stand_'+$taskDirection] = @($taskNames[0])
    $taskAnimations['walk_'+$taskDirection] = @($taskNames[1..4])
}
[ChibiFourPackerV1]::Atlas($taskFiles.ToArray(),$taskColumns.ToArray(),$taskRows.ToArray(),(Join-Path $taskOutput 'atlas.png'),5,$taskColors)
$taskMetadata = [ordered]@{
    schemaVersion='pixel-atlas-1';characterId='CHR-WANG-LIN-CHIBI';sourceCharacterId='CHR-WANG-LIN';costume='gray';previewOnly=$true
    availableDirections=$taskDirections;directionOrder=$taskDirections;frameSizePx=@(64,96);footAnchorPx=@(32,88);fps=5
    identityReferenceApprovedByProjectOwner=$true;identityApprovedByProjectOwner=$false
    animationStatus='chibi_four_directions_pending_owner_review';palette=$taskEast.palette;frames=$taskDefinitions;animations=$taskAnimations
    meta=[ordered]@{image='atlas.png';size=[ordered]@{w=320;h=384};format='indexed_png';scale=1}
    sourceImages=$taskSources;reusedEastAtlasPath='../../wang-lin-chibi-pilot-v1/native-v1/atlas.json';eastPixelsPreserved=$true
    referenceUrl='https://www.pinterest.com/pin/480196379041020113/';proportionTarget='approximately_2_7_heads'
    walkPhase=@('contact_a','passing_b','contact_b','passing_a');defaultGaitCycleDistancePx=24;defaultMovementSpeedPxPerSecond=40
    export=[ordered]@{artMethod='built_in_image_gen';geometryGeneratedByCode=$false;frameCount=20;reports=$taskReports}
}
[System.IO.File]::WriteAllText((Join-Path $taskOutput 'atlas.json'),($taskMetadata | ConvertTo-Json -Depth 14)+[Environment]::NewLine,(New-Object System.Text.UTF8Encoding($false)))
[pscustomobject]@{frames=20;newFrames=15;reusedEastFrames=5;directions=$taskDirections;output=$taskOutput} | ConvertTo-Json -Compress
