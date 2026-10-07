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
if (($taskPixelSpec.frameSizePx -join ',') -ne '64,96' -or ($taskPixelSpec.footAnchorPx -join ',') -ne '32,88' -or ($taskPixelSpec.sourceGrid.directions -join ',') -ne 'south,west,east,north') {
    throw 'This exporter expects the selected 64x96 grid, anchor (32,88), and four direction order.'
}
$taskResolvedSource = (Resolve-Path -LiteralPath $SourcePath).Path
$taskOutputPath = [System.IO.Path]::GetFullPath($OutputDirectory)
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

public class DiscipleFrameReportV1 {
    public int Row { get; set; }
    public int Column { get; set; }
    public int[] SourceBounds { get; set; }
    public int[] NativeBounds { get; set; }
    public int OpaquePixels { get; set; }
    public string PixelHash { get; set; }
    public int LowestLeftPixelY { get; set; }
    public int LowestRightPixelY { get; set; }
}
public static class DiscipleAtlasExporterV1 {
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
            if (area >= pixels.Length / 350) {
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
    public static DiscipleFrameReportV1[] Export(string source, string output, int frameWidth, int frameHeight, int anchorX, int anchorY, Color[] colors, string framePrefix) {
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
        if (components.Count != 28) {
            throw new InvalidOperationException("Expected 28 isolated figures; found " + components.Count + ". Inspect source alpha before export.");
        }
        components.Sort(delegate(Component a, Component b) { return a.CenterY.CompareTo(b.CenterY); });
        List<Component> ordered = new List<Component>();
        for (int row = 0; row < 4; row++) {
            List<Component> band = components.GetRange(row * 7, 7);
            band.Sort(delegate(Component a, Component b) { return a.CenterX.CompareTo(b.CenterX); });
            ordered.AddRange(band);
        }
        int maximumHeight = 0, maximumWidth = 0;
        foreach (Component component in ordered) {
            maximumHeight = Math.Max(maximumHeight, component.Box.Height);
            maximumWidth = Math.Max(maximumWidth, component.Box.Width);
        }
        double scale = Math.Min(82.0 / maximumHeight, 52.0 / maximumWidth);
        List<byte[]> framePixels = new List<byte[]>();
        List<DiscipleFrameReportV1> reports = new List<DiscipleFrameReportV1>();
        Dictionary<int,byte> colorCache = new Dictionary<int,byte>();
        for (int index = 0; index < ordered.Count; index++) {
            Rectangle box = ordered[index].Box;
            double pivot = WaistPivot(pixels, sourceWidth, box);
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
            reports.Add(new DiscipleFrameReportV1 {
                Row = index / 7, Column = index % 7,
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
        int atlasWidth = frameWidth * 7, atlasHeight = frameHeight * 4;
        byte[] atlas = new byte[atlasWidth * atlasHeight];
        for (int index = 0; index < framePixels.Count; index++) {
            int row = index / 7, column = index % 7;
            string name = framePrefix + (column == 0 ? "stand_" : "walk_") + directions[row] +
                (column == 0 ? "" : "_" + (column - 1).ToString("00"));
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
if (-not ('DiscipleAtlasExporterV1' -as [type])) {
    Add-Type -TypeDefinition $taskPackerCode -ReferencedAssemblies System.Drawing,System.Core,System
}
$taskReports = [DiscipleAtlasExporterV1]::Export(
    $taskResolvedSource,$taskOutputPath,
    $taskPixelSpec.frameSizePx[0],$taskPixelSpec.frameSizePx[1],
    $taskPixelSpec.footAnchorPx[0],$taskPixelSpec.footAnchorPx[1],$taskColors,[string]$taskPixelSpec.framePrefix
)
$taskFrameDefinitions = [ordered]@{}
$taskAnimations = [ordered]@{}
for ($taskRow = 0; $taskRow -lt 4; $taskRow++) {
    $taskDirection = $taskPixelSpec.sourceGrid.directions[$taskRow]
    $taskWalkNames = @()
    for ($taskColumn = 0; $taskColumn -lt 7; $taskColumn++) {
        if ($taskColumn -eq 0) { $taskFrameName = $taskPixelSpec.framePrefix + "stand_$taskDirection" }
        else { $taskFrameName = $taskPixelSpec.framePrefix + ("walk_{0}_{1:00}" -f $taskDirection,($taskColumn - 1)); $taskWalkNames += $taskFrameName }
        $taskFrameDefinitions[$taskFrameName] = [ordered]@{
            frame = [ordered]@{x=($taskColumn*64);y=($taskRow*96);w=64;h=96}
            sourceSize = [ordered]@{w=64;h=96}
            rotated = $false
            trimmed = $false
            anchorPx = @(32,88)
            image = "frames/$taskFrameName.png"
            pixelHash = $taskReports[$taskRow*7+$taskColumn].PixelHash
        }
    }
    $taskAnimations["stand_$taskDirection"] = @($taskPixelSpec.framePrefix + "stand_$taskDirection")
    $taskAnimations["walk_$taskDirection"] = $taskWalkNames
}
$taskMetadata = [ordered]@{
    schemaVersion = 'pixel-atlas-1'
    characterId = $taskPixelSpec.characterId
    costume = $taskPixelSpec.costume
    identityApprovedByProjectOwner = [bool]$taskPixelSpec.identityApprovedByProjectOwner
    animationStatus = 'draft_identity_and_motion_review'
    sourceImage = '../' + [System.IO.Path]::GetFileName($taskResolvedSource)
    frameSizePx = @(64,96)
    footAnchorPx = @(32,88)
    directionOrder = @($taskPixelSpec.sourceGrid.directions)
    fps = [int]$taskPixelSpec.walkFps
    palette = @($taskPixelSpec.palette)
    frames = $taskFrameDefinitions
    animations = $taskAnimations
    meta = [ordered]@{image='atlas.png';size=[ordered]@{w=448;h=384};format='indexed_png';scale=1}
    export = [ordered]@{
        artMethod = 'built_in_image_gen'
        packingMethod = 'connected_component_crop_uniform_nearest_neighbor_fixed_palette'
        nativeAlpha = '0_or_255'
        frameCount = 28
        sourcePath = [System.IO.Path]::GetFileName($taskResolvedSource)
        reports = @($taskReports)
    }
}
$taskJson = $taskMetadata | ConvertTo-Json -Depth 12
$taskUtf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $taskOutputPath 'atlas.json'),$taskJson + [Environment]::NewLine,$taskUtf8)
[System.IO.File]::WriteAllText((Join-Path $taskOutputPath 'atlas-data.js'),'window.' + $taskPixelSpec.dataGlobal + ' = ' + $taskJson + ';' + [Environment]::NewLine,$taskUtf8)
[pscustomobject]@{characterId=$taskPixelSpec.characterId;frameCount=28;frameSize='64x96';atlasSize='448x384';paletteEntries=$taskColors.Length;output=$taskOutputPath} | ConvertTo-Json -Compress
