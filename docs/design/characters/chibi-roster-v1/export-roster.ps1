param(
    [ValidateSet('male','female','li-muwan','situ-nan')]
    [string[]]$Models = @('male','female','li-muwan','situ-nan'),
    [ValidatePattern('^[a-z0-9-]+$')]
    [string]$OutputVersion = 'native-v1'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = (Get-Location).Path
$taskManifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'models.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskReference = Join-Path $taskRoot 'docs/design/characters/wang-lin-chibi-walk-v1/native-v2/frames/wanglin_chibi_stand_east.png'
$taskTemplate = Get-Content -LiteralPath (Join-Path $taskRoot 'docs/design/characters/gait-correction-v1/export-gait.ps1') -Raw -Encoding UTF8
$taskHelper = [regex]::Match($taskTemplate, '(?s)using System;.*?(?=\r?\n''@\r?\n)').Value
if (-not $taskHelper) { throw 'Packing helper not found.' }
foreach ($taskModelName in $Models) {
    $taskModel = $taskManifest.models | Where-Object { $_.folder -eq $taskModelName }
    if ($null -eq $taskModel) { throw 'Model manifest not found.' }
    $taskModelRoot = Join-Path $PSScriptRoot $taskModelName
    $taskOutput = [System.IO.Path]::GetFullPath((Join-Path $taskModelRoot $OutputVersion))
    if (-not $taskOutput.StartsWith($taskRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Output must stay inside the workspace.' }
    if (Test-Path -LiteralPath $taskOutput) { throw ('Choose a new output version: '+$taskOutput) }
    $taskOriginal = Get-Content -LiteralPath (Join-Path $taskRoot $taskModel.paletteSourceMetadataPath) -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($taskModel.PSObject.Properties['palette']) {
        if ($taskModel.palette.Count -ne 24) { throw 'Custom palette must contain 24 entries.' }
        $taskOriginal.palette = $taskModel.palette
    }
    $taskColors = New-Object 'System.Drawing.Color[]' $taskOriginal.palette.Count
    for ($taskIndex=0; $taskIndex -lt $taskColors.Length; $taskIndex++) {
        $taskHex = $taskOriginal.palette[$taskIndex].Substring(1)
        $taskColors[$taskIndex] = [System.Drawing.Color]::FromArgb([Convert]::ToInt32($taskHex.Substring(6,2),16),[Convert]::ToInt32($taskHex.Substring(0,2),16),[Convert]::ToInt32($taskHex.Substring(2,2),16),[Convert]::ToInt32($taskHex.Substring(4,2),16))
    }
    # Read twenty drawn figures, then fit each row uniformly to the same
    # native frame. No interpolation of anatomy or mirrored poses.
    $taskClass = 'ChibiRosterPacker'+($taskModelName.Replace('-',''))
    $taskCode = $taskHelper.Replace('GaitPackerV1',$taskClass).Replace('GaitFrameReport',($taskClass+'Report'))
    $taskCode = $taskCode.Replace('large.Count!=8','large.Count!=20').Replace('Need eight isolated','Need twenty isolated')
    $taskCode = $taskCode.Replace('row<2','row<4').Replace('large.GetRange(row*4,4)','large.GetRange(row*5,5)')
    $taskCode = $taskCode.Replace('for(int i=0;i<8;i++)','for(int i=0;i<5;i++)')
    $taskCode = $taskCode.Replace('string standPath,Color[] colors) {','string standPath,Color[] colors,int sourceRow) {')
    $taskCode = $taskCode.Replace('List<Figure> figures=Figures(pixels,w,h);','List<Figure> figures=Figures(pixels,w,h).GetRange(sourceRow*5,5);')
    $taskCode = $taskCode.Replace('referenceHead=HeadCenter(p,64,Rectangle.FromLTRB(minX,minY,maxX+1,maxY+1));','referenceHead=32;')
    if ($taskModel.hoverHeightPx -gt 0) {
        $taskCode = $taskCode.Replace('82.0/maxH','80.0/maxH').Replace('88','84')
    }
    Add-Type -TypeDefinition $taskCode -ReferencedAssemblies System.Drawing,System.Core,System
    $taskPacker = $taskClass -as [type]
    $taskFramesRoot = Join-Path $taskOutput 'frames'
    New-Item -ItemType Directory -Path $taskFramesRoot -Force | Out-Null
    $taskDirections = @('south','west','east','north')
    $taskDefinitions = [ordered]@{}
    $taskAnimations = [ordered]@{}
    $taskReports = [ordered]@{}
    $taskFiles = New-Object 'System.Collections.Generic.List[string]'
    $taskColumns = New-Object 'System.Collections.Generic.List[int]'
    $taskRows = New-Object 'System.Collections.Generic.List[int]'
    for ($taskRow=0; $taskRow -lt 4; $taskRow++) {
        $taskDirection = $taskDirections[$taskRow]
        $taskReports[$taskDirection] = @($taskPacker::ExportDirection((Join-Path $taskModelRoot $taskModel.sourceSheet),$taskFramesRoot,'crop_',$taskDirection,$taskReference,$taskColors,$taskRow))
        $taskNames = @($taskModel.framePrefix+'stand_'+$taskDirection) + @(0..3 | ForEach-Object { $taskModel.framePrefix+('walk_{0}_{1:00}' -f $taskDirection,$_) })
        for ($taskColumn=0; $taskColumn -lt 5; $taskColumn++) {
            $taskName = $taskNames[$taskColumn]
            $taskDestination = Join-Path $taskFramesRoot ($taskName+'.png')
            $taskCrop = Join-Path $taskFramesRoot ('crop_walk_{0}_{1:00}.png' -f $taskDirection,$taskColumn)
            Copy-Item -LiteralPath $taskCrop -Destination $taskDestination
            Remove-Item -LiteralPath $taskCrop
            $taskDefinitions[$taskName] = [ordered]@{frame=[ordered]@{x=$taskColumn*64;y=$taskRow*96;w=64;h=96};sourceSize=[ordered]@{w=64;h=96};rotated=$false;trimmed=$false;anchorPx=@(32,88);image='frames/'+$taskName+'.png';pixelHash=$taskReports[$taskDirection][$taskColumn].PixelHash}
            $taskFiles.Add($taskDestination)
            $taskColumns.Add($taskColumn)
            $taskRows.Add($taskRow)
        }
        $taskAnimations['stand_'+$taskDirection] = @($taskNames[0])
        $taskAnimations['walk_'+$taskDirection] = @($taskNames[1..4])
    }
    $taskPacker::Atlas($taskFiles.ToArray(),$taskColumns.ToArray(),$taskRows.ToArray(),(Join-Path $taskOutput 'atlas.png'),5,$taskColors)
    $taskMeta = [ordered]@{
        schemaVersion='pixel-atlas-1';characterId=$taskModel.characterId;costume=$taskModel.costume;previewOnly=$true
        availableDirections=$taskDirections;directionOrder=$taskDirections;frameSizePx=@(64,96);footAnchorPx=@(32,88)
        anchorKind=$taskModel.anchorKind;hoverHeightPx=$taskModel.hoverHeightPx;movementKind=$taskModel.movementKind
        identityReferenceApprovedByProjectOwner=$taskModel.identityReferenceApprovedByProjectOwner;identityApprovedByProjectOwner=$false
        animationStatus='chibi_roster_pending_owner_review';fps=5;palette=$taskOriginal.palette;frames=$taskDefinitions;animations=$taskAnimations
        meta=[ordered]@{image='atlas.png';size=[ordered]@{w=320;h=384};format='indexed_png';scale=1}
        sourceImage='../'+$taskModel.sourceSheet;sourcePrompt='../'+$taskModel.sourcePrompt
        proportionReferencePath='docs/design/characters/wang-lin-chibi-walk-v1/native-v2/atlas.json';proportionTarget='approximately_2_7_heads'
        defaultGaitCycleDistancePx=24;defaultMovementSpeedPxPerSecond=40
        movementPhase=if($taskModel.movementKind -eq 'glide'){@('drift_start','drift_peak','relax','counter_ripple')}else{@('contact_a','passing_b','contact_b','passing_a')}
        export=[ordered]@{artMethod='built_in_image_gen';geometryGeneratedByCode=$false;frameCount=20;reports=$taskReports;packingMethod='per_direction_uniform_nearest_palette_head_registration_ground_anchor'}
    }
    [System.IO.File]::WriteAllText((Join-Path $taskOutput 'atlas.json'),($taskMeta | ConvertTo-Json -Depth 16)+[Environment]::NewLine,(New-Object System.Text.UTF8Encoding($false)))
    [pscustomobject]@{character=$taskModel.characterId;frames=20;movement=$taskModel.movementKind;output=$taskOutput} | ConvertTo-Json -Compress
}
