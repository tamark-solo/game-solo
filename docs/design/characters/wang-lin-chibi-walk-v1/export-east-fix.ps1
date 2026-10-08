param(
    [string]$OutputDirectory = 'docs/design/characters/wang-lin-chibi-walk-v1/native-v2'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = (Get-Location).Path
$taskBaseRoot = Join-Path $PSScriptRoot 'native-v1'
$taskOutput = [System.IO.Path]::GetFullPath((Join-Path $taskRoot $OutputDirectory))
if (-not $taskOutput.StartsWith($taskRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Output must stay inside the workspace.' }
if (Test-Path -LiteralPath $taskOutput) { throw 'Choose a new output version; output already exists.' }
$taskBase = Get-Content -LiteralPath (Join-Path $taskBaseRoot 'atlas.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskTemplate = Get-Content -LiteralPath (Join-Path $taskRoot 'docs/design/characters/gait-correction-v1/export-gait.ps1') -Raw -Encoding UTF8
$taskCode = [regex]::Match($taskTemplate, '(?s)using System;.*?(?=\r?\n''@\r?\n)').Value
if (-not $taskCode) { throw 'Packing helper not found.' }
$taskCode = $taskCode.Replace('GaitPackerV1', 'ChibiEastFixPackerV1').Replace('GaitFrameReport', 'ChibiEastFixFrameReport')
$taskCode = $taskCode.Replace('large.Count!=8', 'large.Count!=5').Replace('Need eight isolated', 'Need five isolated')
$taskCode = $taskCode.Replace('large.GetRange(row*4,4)', 'large.GetRange(row*3,row==0?3:2)')
$taskCode = $taskCode.Replace('for(int i=0;i<8;i++)', 'for(int i=0;i<5;i++)')
$taskCode = $taskCode.Replace('referenceHead=HeadCenter(p,64,Rectangle.FromLTRB(minX,minY,maxX+1,maxY+1));', 'referenceHead=32;')
Add-Type -TypeDefinition $taskCode -ReferencedAssemblies System.Drawing,System.Core,System
$taskColors = New-Object 'System.Drawing.Color[]' $taskBase.palette.Count
for ($taskIndex=0; $taskIndex -lt $taskColors.Length; $taskIndex++) {
    $taskHex = $taskBase.palette[$taskIndex].Substring(1)
    $taskColors[$taskIndex] = [System.Drawing.Color]::FromArgb([Convert]::ToInt32($taskHex.Substring(6,2),16),[Convert]::ToInt32($taskHex.Substring(0,2),16),[Convert]::ToInt32($taskHex.Substring(2,2),16),[Convert]::ToInt32($taskHex.Substring(4,2),16))
}
$taskFramesRoot = Join-Path $taskOutput 'frames'
$taskCropsRoot = Join-Path $taskOutput 'source-crops'
New-Item -ItemType Directory -Path $taskFramesRoot -Force | Out-Null
New-Item -ItemType Directory -Path $taskCropsRoot -Force | Out-Null
$taskReports = @([ChibiEastFixPackerV1]::ExportDirection((Join-Path $PSScriptRoot 'east-last-source-v1.png'),$taskCropsRoot,'crop_','east',(Join-Path $taskBaseRoot 'frames/wanglin_chibi_stand_east.png'),$taskColors))
$taskChangedId = 'wanglin_chibi_walk_east_03'
$taskFiles = New-Object 'System.Collections.Generic.List[string]'
$taskColumns = New-Object 'System.Collections.Generic.List[int]'
$taskRows = New-Object 'System.Collections.Generic.List[int]'
foreach ($taskEntry in $taskBase.frames.PSObject.Properties) {
    $taskFrame = $taskEntry.Value
    $taskDestination = Join-Path $taskOutput $taskFrame.image
    if ($taskEntry.Name -eq $taskChangedId) {
        Copy-Item -LiteralPath (Join-Path $taskCropsRoot 'crop_walk_east_04.png') -Destination $taskDestination
        $taskFrame.pixelHash = $taskReports[4].PixelHash
    } else {
        Copy-Item -LiteralPath (Join-Path $taskBaseRoot $taskFrame.image) -Destination $taskDestination
    }
    $taskFiles.Add($taskDestination)
    $taskColumns.Add([int]($taskFrame.frame.x / 64))
    $taskRows.Add([int]($taskFrame.frame.y / 96))
}
[ChibiEastFixPackerV1]::Atlas($taskFiles.ToArray(),$taskColumns.ToArray(),$taskRows.ToArray(),(Join-Path $taskOutput 'atlas.png'),5,$taskColors)
$taskBase.animationStatus = 'east_final_passing_pose_corrected_pending_owner_review'
$taskBase.eastPixelsPreserved = $false
$taskBase | Add-Member -NotePropertyName changedFrameIds -NotePropertyValue @($taskChangedId)
$taskBase | Add-Member -NotePropertyName preservedOtherFrameCount -NotePropertyValue 19
$taskBase | Add-Member -NotePropertyName preservedDirections -NotePropertyValue @('south','west','north')
$taskBase | Add-Member -NotePropertyName previousAtlasPath -NotePropertyValue '../native-v1/atlas.json'
$taskBase | Add-Member -NotePropertyName frameOverrides -NotePropertyValue ([ordered]@{wanglin_chibi_walk_east_03=[ordered]@{sourceImage='../east-last-source-v1.png';promptPath='../east-last-source-v1.prompt.txt';sourceIndex=4;report=$taskReports[4]}})
$taskBase.export | Add-Member -NotePropertyName changedFrameIds -NotePropertyValue @($taskChangedId)
[System.IO.File]::WriteAllText((Join-Path $taskOutput 'atlas.json'),($taskBase | ConvertTo-Json -Depth 16)+[Environment]::NewLine,(New-Object System.Text.UTF8Encoding($false)))
[pscustomobject]@{frames=20;changedFrame=$taskChangedId;preservedOtherFrames=19;output=$taskOutput} | ConvertTo-Json -Compress
