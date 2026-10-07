param(
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$PixelSpecPath,
    [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskPixelSpec = Get-Content -LiteralPath $PixelSpecPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskPixelSpec.framePrefix -notmatch '^[a-z][a-z0-9_]*_$' -or $taskPixelSpec.dataGlobal -notmatch '^[A-Za-z][A-Za-z0-9]*$') {
    throw 'Invalid framePrefix or dataGlobal in the pixel spec.'
}
$taskNativeDirections = @('south','west','east','north')
if (($taskPixelSpec.sourceGrid.directions | Sort-Object) -join ',' -ne 'east,north,south,west' -or $taskPixelSpec.sourceGrid.columns -ne 2 -or $taskPixelSpec.sourceGrid.rows -ne 2) {
    throw 'This exporter expects all four directions, in a 2x2 source grid. Record the observed source order in the spec.'
}
$taskSourcePermutation = New-Object 'int[]' 4
for ($taskIndex = 0; $taskIndex -lt 4; $taskIndex++) {
    for ($taskSourceIndex = 0; $taskSourceIndex -lt 4; $taskSourceIndex++) {
        if ($taskNativeDirections[$taskIndex] -eq $taskPixelSpec.sourceGrid.directions[$taskSourceIndex]) {
            $taskSourcePermutation[$taskIndex] = $taskSourceIndex
        }
    }
}
if ($taskPixelSpec.frameSizePx.Count -ne 2 -or $taskPixelSpec.anchorPx.Count -ne 2 -or $taskPixelSpec.palette.Count -ne 24) {
    throw 'Invalid frame, anchor or palette budget.'
}
$taskResolvedSource = (Resolve-Path -LiteralPath $SourcePath).Path
$taskOutputPath = [System.IO.Path]::GetFullPath($OutputDirectory)
$taskPackageRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
if (-not $taskOutputPath.StartsWith($taskPackageRoot + [System.IO.Path]::DirectorySeparatorChar,[System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Export output must stay within this ART package.'
}
if (Test-Path -LiteralPath (Join-Path $taskOutputPath 'atlas.png')) {
    throw 'Output atlas already exists. Export to a new version directory to preserve the earlier asset.'
}
$taskColors = New-Object 'System.Drawing.Color[]' $taskPixelSpec.palette.Count
for ($taskColorIndex = 0; $taskColorIndex -lt $taskColors.Length; $taskColorIndex++) {
    $taskHex = $taskPixelSpec.palette[$taskColorIndex].Substring(1)
    $taskColors[$taskColorIndex] = [System.Drawing.Color]::FromArgb(
        [Convert]::ToInt32($taskHex.Substring(6,2),16),
        [Convert]::ToInt32($taskHex.Substring(0,2),16),
        [Convert]::ToInt32($taskHex.Substring(2,2),16),
        [Convert]::ToInt32($taskHex.Substring(4,2),16)
    )
}
$taskPackerCode = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;

public class CoreStaticFrameReportV1 {
    public int Row { get; set; }
    public int Column { get; set; }
    public int[] SourceBounds { get; set; }
    public int[] NativeBounds { get; set; }
    public int OpaquePixels { get; set; }
    public string PixelHash { get; set; }
    public int LowestLeftPixelY { get; set; }
    public int LowestRightPixelY { get; set; }
}
public static class CoreStaticAtlasExporterV1 {
    private class Component {
        public Rectangle Box;
        public int Area;
        public double CenterX { get { return Box.X + Box.Width / 2.0; } }
        public double CenterY { get { return Box.Y + Box.Height / 2.0; } }
    }
    private static bool Solid(int argb) {
        return ((uint)argb >> 24) >= 128;
    }
    private static List<Component> Components(int[] pixels, int width, int height) {
        bool[] visited = new bool[pixels.Length];
        int[] queue = new int[pixels.Length];
        List<Component> result = new List<Component>();
        for (int seed = 0; seed < pixels.Length; seed++) {
            if (visited[seed] || !Solid(pixels[seed])) continue;
            int head = 0, tail = 1, area = 0;
            queue[0] = seed; visited[seed] = true;
            int minX = width, minY = height, maxX = -1, maxY = -1;
            while (head < tail) {
                int index = queue[head++], x = index % width, y = index / width;
                area++;
                minX = Math.Min(minX, x); minY = Math.Min(minY, y);
                maxX = Math.Max(maxX, x); maxY = Math.Max(maxY, y);
                for (int dy = -1; dy <= 1; dy++) {
                    for (int dx = -1; dx <= 1; dx++) {
                        if (dx == 0 && dy == 0) continue;
                        int nx = x + dx, ny = y + dy;
                        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                        int ni = ny * width + nx;
                        if (visited[ni] || !Solid(pixels[ni])) continue;
                        visited[ni] = true; queue[tail++] = ni;
                    }
                }
            }
            if (area >= pixels.Length / 100) {
                result.Add(new Component { Area = area, Box = Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1) });
            }
        }
        return result;
    }
    private static double WaistPivot(int[] pixels, int width, Rectangle box) {
        int y = box.Y + (int)Math.Round(box.Height * 0.52);
        int bestStart = box.X, bestLength = 0, runStart = -1;
        for (int x = box.X; x <= box.Right; x++) {
            bool opaque = x < box.Right && Solid(pixels[y * width + x]);
            if (opaque && runStart < 0) runStart = x;
            if (!opaque && runStart >= 0) {
                int length = x - runStart;
                if (length > bestLength) { bestStart = runStart; bestLength = length; }
                runStart = -1;
            }
        }
        return bestLength > 0 ? bestStart + (bestLength - 1) / 2.0 : box.X + (box.Width - 1) / 2.0;
    }
    private static byte NearestColor(int argb, Color[] colors) {
        int r = (argb >> 16) & 255, g = (argb >> 8) & 255, b = argb & 255;
        int best = 1, distance = int.MaxValue;
        for (int i = 1; i < colors.Length; i++) {
            int dr = r - colors[i].R, dg = g - colors[i].G, db = b - colors[i].B;
            int candidate = dr * dr + 2 * dg * dg + db * db;
            if (candidate < distance) { distance = candidate; best = i; }
        }
        return (byte)best;
    }
    private static void SaveIndexed(string path, byte[] indices, int width, int height, Color[] colors) {
        using (Bitmap bitmap = new Bitmap(width, height, PixelFormat.Format8bppIndexed)) {
            ColorPalette palette = bitmap.Palette;
            for (int i = 0; i < palette.Entries.Length; i++) {
                palette.Entries[i] = i < colors.Length ? colors[i] : Color.FromArgb(0,0,0,0);
            }
            bitmap.Palette = palette;
            BitmapData data = bitmap.LockBits(new Rectangle(0,0,width,height), ImageLockMode.WriteOnly, PixelFormat.Format8bppIndexed);
            try {
                for (int y = 0; y < height; y++) {
                    Marshal.Copy(indices, y * width, IntPtr.Add(data.Scan0, y * data.Stride), width);
                }
            } finally { bitmap.UnlockBits(data); }
            bitmap.Save(path, ImageFormat.Png);
        }
    }
    public static CoreStaticFrameReportV1[] Export(string source, string output, int frameWidth, int frameHeight, int anchorX, int anchorY, Color[] colors, string framePrefix, int contentWidth, int contentHeight, bool centerOnBounds, int[] sourcePermutation) {
        int sourceWidth, sourceHeight;
        int[] pixels;
        using (Bitmap bitmap = new Bitmap(source)) {
            sourceWidth = bitmap.Width; sourceHeight = bitmap.Height;
            pixels = new int[sourceWidth * sourceHeight];
            for (int y = 0; y < sourceHeight; y++)
                for (int x = 0; x < sourceWidth; x++)
                    pixels[y * sourceWidth + x] = bitmap.GetPixel(x,y).ToArgb();
        }
        List<Component> components = Components(pixels, sourceWidth, sourceHeight);
        if (components.Count != 4) {
            throw new InvalidOperationException("Expected 4 isolated figures; found " + components.Count + ". Inspect source alpha before export.");
        }
        components.Sort(delegate(Component a, Component b) { return a.CenterY.CompareTo(b.CenterY); });
        List<Component> ordered = new List<Component>();
        for (int row = 0; row < 2; row++) {
            List<Component> band = components.GetRange(row * 2, 2);
            band.Sort(delegate(Component a, Component b) { return a.CenterX.CompareTo(b.CenterX); });
            ordered.AddRange(band);
        }
        List<Component> nativeOrdered = new List<Component>();
        foreach (int sourceIndex in sourcePermutation) nativeOrdered.Add(ordered[sourceIndex]);
        ordered = nativeOrdered;
        int maximumHeight = 0, maximumWidth = 0;
        foreach (Component component in ordered) {
            maximumHeight = Math.Max(maximumHeight, component.Box.Height);
            maximumWidth = Math.Max(maximumWidth, component.Box.Width);
        }
        double scale = Math.Min((double)contentHeight / maximumHeight, (double)contentWidth / maximumWidth);
        List<byte[]> framePixels = new List<byte[]>();
        List<CoreStaticFrameReportV1> reports = new List<CoreStaticFrameReportV1>();
        Dictionary<int,byte> colorCache = new Dictionary<int,byte>();
        for (int index = 0; index < ordered.Count; index++) {
            Rectangle box = ordered[index].Box;
            double pivot = centerOnBounds ? box.X + (box.Width - 1) / 2.0 : WaistPivot(pixels, sourceWidth, box);
            byte[] native = new byte[frameWidth * frameHeight];
            int minX = frameWidth, minY = frameHeight, maxX = -1, maxY = -1, opaque = 0;
            int lowestLeft = -1, lowestRight = -1;
            for (int y = 0; y < frameHeight; y++) {
                int sy = (int)Math.Floor((y - anchorY) / scale + box.Bottom - 1 + 0.5);
                if (sy < box.Top || sy >= box.Bottom) continue;
                for (int x = 0; x < frameWidth; x++) {
                    int sx = (int)Math.Floor((x - anchorX) / scale + pivot + 0.5);
                    if (sx < box.Left || sx >= box.Right) continue;
                    int argb = pixels[sy * sourceWidth + sx];
                    if (!Solid(argb)) continue;
                    int rgb = argb & 0x00FFFFFF;
                    byte paletteIndex;
                    if (!colorCache.TryGetValue(rgb, out paletteIndex)) {
                        paletteIndex = NearestColor(argb, colors);
                        colorCache.Add(rgb,paletteIndex);
                    }
                    native[y * frameWidth + x] = paletteIndex;
                    minX = Math.Min(minX,x); minY = Math.Min(minY,y);
                    maxX = Math.Max(maxX,x); maxY = Math.Max(maxY,y);
                    if (x < anchorX) lowestLeft = Math.Max(lowestLeft,y); else lowestRight = Math.Max(lowestRight,y);
                    opaque++;
                }
            }
            int verticalCorrection = anchorY - maxY;
            if (verticalCorrection > 0 && verticalCorrection <= 2) {
                byte[] registered = new byte[native.Length];
                for (int y = 0; y < frameHeight - verticalCorrection; y++)
                    Array.Copy(native,y * frameWidth,registered,(y + verticalCorrection) * frameWidth,frameWidth);
                native = registered;
                minY += verticalCorrection; maxY += verticalCorrection;
                if (lowestLeft >= 0) lowestLeft += verticalCorrection;
                if (lowestRight >= 0) lowestRight += verticalCorrection;
            }
            if (opaque < 400 || minX < 1 || maxX >= frameWidth - 1 || minY < 1 || maxY != anchorY) {
                throw new InvalidOperationException("Frame " + index + " has bounds " + minX + "," + minY + ".." + maxX + "," + maxY + ". Inspect source geometry.");
            }
            string hash;
            using (SHA256 sha = SHA256.Create()) {
                hash = BitConverter.ToString(sha.ComputeHash(native)).Replace("-","").ToLowerInvariant();
            }
            reports.Add(new CoreStaticFrameReportV1 {
                Row = sourcePermutation[index] / 2, Column = sourcePermutation[index] % 2,
                SourceBounds = new int[] {box.X,box.Y,box.Width,box.Height},
                NativeBounds = new int[] {minX,minY,maxX-minX+1,maxY-minY+1},
                OpaquePixels = opaque, PixelHash = hash,
                LowestLeftPixelY = lowestLeft, LowestRightPixelY = lowestRight
            });
            framePixels.Add(native);
        }
        Directory.CreateDirectory(output);
        string framesDirectory = Path.Combine(output,"frames");
        Directory.CreateDirectory(framesDirectory);
        string[] directions = new string[] {"south","west","east","north"};
        int atlasWidth = frameWidth * 4, atlasHeight = frameHeight;
        byte[] atlas = new byte[atlasWidth * atlasHeight];
        for (int index = 0; index < framePixels.Count; index++) {
            int row = 0, column = index;
            string name = framePrefix + "static_" + directions[index];
            byte[] frame = framePixels[index];
            SaveIndexed(Path.Combine(framesDirectory,name+".png"),frame,frameWidth,frameHeight,colors);
            for (int y = 0; y < frameHeight; y++) {
                Array.Copy(frame,y * frameWidth,atlas,(row * frameHeight+y) * atlasWidth+column * frameWidth,frameWidth);
            }
        }
        SaveIndexed(Path.Combine(output,"atlas.png"),atlas,atlasWidth,atlasHeight,colors);
        return reports.ToArray();
    }
}
'@
if (-not ('CoreStaticAtlasExporterV1' -as [type])) {
    Add-Type -TypeDefinition $taskPackerCode -ReferencedAssemblies System.Drawing,System.Core,System
}
$taskHoverHeight = 0
if ($taskPixelSpec.PSObject.Properties.Name -contains 'hoverHeightPx') {
    $taskHoverHeight = [int]$taskPixelSpec.hoverHeightPx
}
if ($taskHoverHeight -lt 0 -or $taskHoverHeight -ge $taskPixelSpec.anchorPx[1]) {
    throw 'Invalid spirit hover height.'
}
$taskContentBottomY = [int]$taskPixelSpec.anchorPx[1] - $taskHoverHeight
$taskReports = [CoreStaticAtlasExporterV1]::Export(
    $taskResolvedSource,$taskOutputPath,
    $taskPixelSpec.frameSizePx[0],$taskPixelSpec.frameSizePx[1],
    $taskPixelSpec.anchorPx[0],$taskContentBottomY,$taskColors,[string]$taskPixelSpec.framePrefix,
    $taskPixelSpec.contentMaxSizePx[0],$taskPixelSpec.contentMaxSizePx[1],($taskPixelSpec.anchorKind -eq 'seat_base'),$taskSourcePermutation
)
$taskFrameDefinitions = [ordered]@{}
$taskAnimations = [ordered]@{}
$taskFrameWidth = [int]$taskPixelSpec.frameSizePx[0]
$taskFrameHeight = [int]$taskPixelSpec.frameSizePx[1]
for ($taskIndex = 0; $taskIndex -lt 4; $taskIndex++) {
    $taskDirection = $taskNativeDirections[$taskIndex]
    $taskFrameName = $taskPixelSpec.framePrefix + "static_$taskDirection"
    $taskFrameDefinitions[$taskFrameName] = [ordered]@{
        frame = [ordered]@{x=($taskIndex*$taskFrameWidth);y=0;w=$taskFrameWidth;h=$taskFrameHeight}
        sourceSize = [ordered]@{w=$taskFrameWidth;h=$taskFrameHeight}
        rotated = $false
        trimmed = $false
        anchorPx = @($taskPixelSpec.anchorPx)
        image = "frames/$taskFrameName.png"
        pixelHash = $taskReports[$taskIndex].PixelHash
    }
    $taskAnimations["static_$taskDirection"] = @($taskFrameName)
}
$taskMetadata = [ordered]@{
    schemaVersion = 'pixel-static-atlas-1'
    characterId = $taskPixelSpec.characterId
    form = $taskPixelSpec.form
    costume = $taskPixelSpec.costume
    identityApprovedByProjectOwner = [bool]$taskPixelSpec.identityApprovedByProjectOwner
    studyStatus = $(if ($taskPixelSpec.prototypeBaselineAcceptedByProjectOwner) { 'provisionally_accepted_design_baseline' } elseif ($taskPixelSpec.identityApprovedByProjectOwner) { 'accepted_as_first_static_pixel_baseline' } else { 'concept_and_static_pixel_study_pending_review' })
    prototypeBaselineAcceptedByProjectOwner = [bool]$taskPixelSpec.prototypeBaselineAcceptedByProjectOwner
    identityApprovalLevel = $(if ($taskPixelSpec.prototypeBaselineAcceptedByProjectOwner) { 'provisional' } elseif ($taskPixelSpec.identityApprovedByProjectOwner) { 'accepted' } else { 'pending' })
    sourceImage = '../' + [System.IO.Path]::GetFileName($taskResolvedSource)
    frameSizePx = @($taskPixelSpec.frameSizePx)
    anchorPx = @($taskPixelSpec.anchorPx)
    anchorKind = $taskPixelSpec.anchorKind
    hoverHeightPx = $taskHoverHeight
    directionOrder = @($taskNativeDirections)
    palette = @($taskPixelSpec.palette)
    frames = $taskFrameDefinitions
    animations = $taskAnimations
    meta = [ordered]@{image='atlas.png';size=[ordered]@{w=(4*$taskFrameWidth);h=$taskFrameHeight};format='indexed_png';scale=1}
    export = [ordered]@{
        artMethod = 'built_in_image_gen'
        packingMethod = 'connected_component_crop_uniform_nearest_neighbor_fixed_palette_registered_static_atlas'
        nativeAlpha = '0_or_255'
        frameCount = 4
        sourcePath = [System.IO.Path]::GetFileName($taskResolvedSource)
        sourceDirectionOrder = @($taskPixelSpec.sourceGrid.directions)
        reports = @($taskReports)
    }
    runtimeReady = $false
}
$taskJson = $taskMetadata | ConvertTo-Json -Depth 12
$taskUtf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $taskOutputPath 'atlas.json'),$taskJson + [Environment]::NewLine,$taskUtf8)
[System.IO.File]::WriteAllText((Join-Path $taskOutputPath 'atlas-data.js'),'window.' + $taskPixelSpec.dataGlobal + ' = ' + $taskJson + ';' + [Environment]::NewLine,$taskUtf8)
[pscustomobject]@{characterId=$taskPixelSpec.characterId;frameCount=4;frameSize=($taskPixelSpec.frameSizePx -join 'x');atlasSize=("{0}x{1}" -f (4*$taskFrameWidth),$taskFrameHeight);paletteEntries=$taskColors.Length;output=$taskOutputPath} | ConvertTo-Json -Compress
