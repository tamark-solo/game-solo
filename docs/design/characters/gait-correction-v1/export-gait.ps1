param(
    [Parameter(Mandatory=$true)][string]$ManifestPath,
    [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskManifestFile = (Resolve-Path -LiteralPath $ManifestPath).Path
$taskManifestRoot = Split-Path -Parent $taskManifestFile
$taskManifest = Get-Content -LiteralPath $taskManifestFile -Raw -Encoding UTF8 | ConvertFrom-Json
$taskLegacyPath = (Resolve-Path -LiteralPath (Join-Path $taskManifestRoot $taskManifest.legacyAtlasPath)).Path
$taskLegacyRoot = Split-Path -Parent $taskLegacyPath
$taskLegacy = Get-Content -LiteralPath $taskLegacyPath -Raw -Encoding UTF8 | ConvertFrom-Json
$taskOutputPath = [System.IO.Path]::GetFullPath($OutputDirectory)
if (Test-Path -LiteralPath (Join-Path $taskOutputPath 'atlas.png')) { throw 'Use a new output version; an atlas already exists here.' }
if (($taskLegacy.frameSizePx -join ',') -ne '64,96' -or ($taskLegacy.footAnchorPx -join ',') -ne '32,88') { throw 'Unsupported legacy frame/anchor.' }
if ($taskManifest.framePrefix -notmatch '^[a-z][a-z0-9_]*_$') { throw 'Invalid frame prefix.' }
$taskColors = New-Object 'System.Drawing.Color[]' $taskLegacy.palette.Count
for ($taskIndex=0; $taskIndex -lt $taskColors.Length; $taskIndex++) {
    $taskHex = $taskLegacy.palette[$taskIndex].Substring(1)
    $taskColors[$taskIndex] = [System.Drawing.Color]::FromArgb([Convert]::ToInt32($taskHex.Substring(6,2),16),[Convert]::ToInt32($taskHex.Substring(0,2),16),[Convert]::ToInt32($taskHex.Substring(2,2),16),[Convert]::ToInt32($taskHex.Substring(4,2),16))
}
$taskPackerCode = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;

public class GaitFrameReport {
    public int SourceIndex { get; set; }
    public int[] SourceBounds { get; set; }
    public int[] NativeBounds { get; set; }
    public string PixelHash { get; set; }
    public double HeadCenterX { get; set; }
}
public static class GaitPackerV1 {
    private class Figure { public Rectangle Box; public int Area; }
    private static bool Solid(int argb) { return ((uint)argb >> 24) >= 128; }
    private static List<Figure> Figures(int[] pixels, int w, int h) {
        bool[] seen = new bool[pixels.Length]; int[] queue = new int[pixels.Length];
        List<Figure> large = new List<Figure>(); List<Rectangle> small = new List<Rectangle>();
        for (int seed=0; seed<pixels.Length; seed++) {
            if (seen[seed] || !Solid(pixels[seed])) continue;
            int head=0,tail=1,area=0,minX=w,minY=h,maxX=-1,maxY=-1; queue[0]=seed; seen[seed]=true;
            while (head<tail) {
                int i=queue[head++], x=i%w, y=i/w; area++;
                minX=Math.Min(minX,x); minY=Math.Min(minY,y); maxX=Math.Max(maxX,x); maxY=Math.Max(maxY,y);
                for (int dy=-1;dy<=1;dy++) for (int dx=-1;dx<=1;dx++) {
                    int nx=x+dx,ny=y+dy; if ((dx==0 && dy==0) || nx<0 || nx>=w || ny<0 || ny>=h) continue;
                    int ni=ny*w+nx; if (seen[ni] || !Solid(pixels[ni])) continue; seen[ni]=true; queue[tail++]=ni;
                }
            }
            Rectangle box=Rectangle.FromLTRB(minX,minY,maxX+1,maxY+1);
            if (area>pixels.Length/1000 && box.Height>h/7) large.Add(new Figure {Box=box,Area=area});
            else if (area>=4) small.Add(box);
        }
        if (large.Count!=8) throw new InvalidOperationException("Need eight isolated main figures; found "+large.Count+". Inspect alpha/layout.");
        foreach (Rectangle part in small) {
            Figure nearest=null; double best=double.MaxValue;
            foreach (Figure fig in large) {
                Rectangle expanded=fig.Box; expanded.Inflate(Math.Max(3,fig.Box.Height/14),Math.Max(3,fig.Box.Height/14));
                if (!expanded.IntersectsWith(part)) continue;
                double dx=(part.X+part.Width/2.0)-(fig.Box.X+fig.Box.Width/2.0),dy=(part.Y+part.Height/2.0)-(fig.Box.Y+fig.Box.Height/2.0);
                double d=dx*dx+dy*dy; if(d<best){nearest=fig;best=d;}
            }
            if(nearest!=null) nearest.Box=Rectangle.Union(nearest.Box,part);
        }
        large.Sort((a,b)=>(a.Box.Y+a.Box.Height/2.0).CompareTo(b.Box.Y+b.Box.Height/2.0));
        List<Figure> ordered=new List<Figure>();
        for(int row=0;row<2;row++) { List<Figure> band=large.GetRange(row*4,4); band.Sort((a,b)=>a.Box.X.CompareTo(b.Box.X)); ordered.AddRange(band); }
        return ordered;
    }
    private static double HeadCenter(int[] pixels,int width,Rectangle box) {
        double sum=0;int count=0;
        int top=box.Top+(int)Math.Round(box.Height*.12),bottom=box.Top+(int)Math.Round(box.Height*.25);
        for(int y=top;y<=bottom;y++) for(int x=box.Left;x<box.Right;x++) if(Solid(pixels[y*width+x])) {sum+=x;count++;}
        return count>0?sum/count:box.X+box.Width/2.0;
    }
    private static byte ColorIndex(int argb,Color[] colors) {
        if(!Solid(argb))return 0;
        int r=(argb>>16)&255,g=(argb>>8)&255,b=argb&255,best=1,distance=int.MaxValue;
        for(int i=1;i<colors.Length;i++){int dr=r-colors[i].R,dg=g-colors[i].G,db=b-colors[i].B,d=dr*dr+2*dg*dg+db*db;if(d<distance){best=i;distance=d;}}
        return (byte)best;
    }
    private static string Hash(byte[] data) { using(SHA256 sha=SHA256.Create())return BitConverter.ToString(sha.ComputeHash(data)).Replace("-","").ToLowerInvariant(); }
    private static void Save(string path,byte[] data,int w,int h,Color[] colors) {
        using(Bitmap bmp=new Bitmap(w,h,PixelFormat.Format8bppIndexed)) {
            ColorPalette palette=bmp.Palette;
            for(int i=0;i<palette.Entries.Length;i++)palette.Entries[i]=i<colors.Length?colors[i]:Color.FromArgb(0,0,0,0);
            bmp.Palette=palette;BitmapData locked=bmp.LockBits(new Rectangle(0,0,w,h),ImageLockMode.WriteOnly,PixelFormat.Format8bppIndexed);
            try{for(int y=0;y<h;y++)Marshal.Copy(data,y*w,IntPtr.Add(locked.Scan0,y*locked.Stride),w);}finally{bmp.UnlockBits(locked);}
            bmp.Save(path,ImageFormat.Png);
        }
    }
    public static GaitFrameReport[] ExportDirection(string source,string output,string prefix,string direction,string standPath,Color[] colors) {
        int w,h;int[] pixels;
        using(Bitmap bmp=new Bitmap(source)){w=bmp.Width;h=bmp.Height;pixels=new int[w*h];for(int y=0;y<h;y++)for(int x=0;x<w;x++)pixels[y*w+x]=bmp.GetPixel(x,y).ToArgb();}
        List<Figure> figures=Figures(pixels,w,h);int maxH=0,maxW=0;
        foreach(Figure fig in figures){maxH=Math.Max(maxH,fig.Box.Height);maxW=Math.Max(maxW,fig.Box.Width);}
        double scale=Math.Min(82.0/maxH,54.0/maxW),referenceHead=32;
        using(Bitmap stand=new Bitmap(standPath)){
            int[] p=new int[64*96];int minX=64,minY=96,maxX=0,maxY=0;
            for(int y=0;y<96;y++)for(int x=0;x<64;x++){int c=stand.GetPixel(x,y).ToArgb();p[y*64+x]=c;if(Solid(c)){minX=Math.Min(minX,x);minY=Math.Min(minY,y);maxX=Math.Max(maxX,x);maxY=Math.Max(maxY,y);}}
            referenceHead=HeadCenter(p,64,Rectangle.FromLTRB(minX,minY,maxX+1,maxY+1));
        }
        // Fit all silhouettes around the fixed head axis; an extended sleeve
        // must not shift the body root or reach the frame's outermost column.
        double maxLeft=0,maxRight=0;
        foreach(Figure fig in figures) {
            double center=HeadCenter(pixels,w,fig.Box);
            maxLeft=Math.Max(maxLeft,center-fig.Box.Left);
            maxRight=Math.Max(maxRight,fig.Box.Right-1-center);
        }
        if(maxLeft>0)scale=Math.Min(scale,(referenceHead-1.75)/maxLeft);
        if(maxRight>0)scale=Math.Min(scale,(61.25-referenceHead)/maxRight);
        List<GaitFrameReport> reports=new List<GaitFrameReport>();Directory.CreateDirectory(output);
        for(int i=0;i<8;i++) {
            Rectangle box=figures[i].Box;double headX=HeadCenter(pixels,w,box);
            byte[] data=new byte[64*96];int minX=64,minY=96,maxX=-1,maxY=-1,count=0;
            for(int y=0;y<96;y++)for(int x=0;x<64;x++) {
                int sy=(int)Math.Floor((y-88)/scale+box.Bottom-1+.5),sx=(int)Math.Floor((x-referenceHead)/scale+headX+.5);
                if(sx<box.Left||sx>=box.Right||sy<box.Top||sy>=box.Bottom)continue;
                int argb=pixels[sy*w+sx];if(!Solid(argb))continue;
                data[y*64+x]=ColorIndex(argb,colors);minX=Math.Min(minX,x);minY=Math.Min(minY,y);maxX=Math.Max(maxX,x);maxY=Math.Max(maxY,y);count++;
            }
            int shift=88-maxY;
            if(shift>0&&shift<=2){byte[] corrected=new byte[data.Length];for(int y=0;y<96-shift;y++)Array.Copy(data,y*64,corrected,(y+shift)*64,64);data=corrected;minY+=shift;maxY+=shift;}
            if(count<400||minX<1||maxX>62||minY<1||maxY!=88||maxY-minY+1<74)throw new InvalidOperationException("Invalid native bounds for "+direction+" pose "+i+": "+minX+","+minY+".."+maxX+","+maxY+". Inspect source.");
            string name=prefix+"walk_"+direction+"_"+i.ToString("00");Save(Path.Combine(output,name+".png"),data,64,96,colors);
            reports.Add(new GaitFrameReport {SourceIndex=i,SourceBounds=new[]{box.X,box.Y,box.Width,box.Height},NativeBounds=new[]{minX,minY,maxX-minX+1,maxY-minY+1},PixelHash=Hash(data),HeadCenterX=headX});
        }
        return reports.ToArray();
    }
    public static void Atlas(string[] orderedFiles,int[] columns,int[] rows,string target,int atlasColumns,Color[] colors) {
        int w=64*atlasColumns,h=96*4;byte[] pixels=new byte[w*h];
        for(int i=0;i<orderedFiles.Length;i++)using(Bitmap frame=new Bitmap(orderedFiles[i]))for(int y=0;y<96;y++)for(int x=0;x<64;x++)pixels[(rows[i]*96+y)*w+columns[i]*64+x]=ColorIndex(frame.GetPixel(x,y).ToArgb(),colors);
        Save(target,pixels,w,h,colors);
    }
}
'@
if (-not ('GaitPackerV1' -as [type])) { Add-Type -TypeDefinition $taskPackerCode -ReferencedAssemblies System.Drawing,System.Core,System }
$taskFramesPath = Join-Path $taskOutputPath 'frames'
New-Item -ItemType Directory -Path $taskFramesPath -Force | Out-Null
$taskFrameDefinitions=[ordered]@{}; $taskAnimations=[ordered]@{}; $taskReports=[ordered]@{}
$taskFiles=New-Object 'System.Collections.Generic.List[string]'
$taskColumns=New-Object 'System.Collections.Generic.List[int]'
$taskRows=New-Object 'System.Collections.Generic.List[int]'
$taskDirections=@('south','west','east','north')
$taskSourcePaths=[ordered]@{}
for($taskRow=0;$taskRow -lt 4;$taskRow++) {
    $taskDirection=$taskDirections[$taskRow]
    $taskStandName=$taskLegacy.animations."stand_$taskDirection"[0]
    $taskStandingFile=Join-Path $taskLegacyRoot $taskLegacy.frames.$taskStandName.image
    $taskSourceProperty=$taskManifest.walkSources.PSObject.Properties[$taskDirection]
    if($null -ne $taskSourceProperty) {
        $taskSource=(Resolve-Path -LiteralPath (Join-Path $taskManifestRoot $taskSourceProperty.Value)).Path
        $taskSourcePaths[$taskDirection]=$taskSourceProperty.Value
        $taskReports[$taskDirection]=@([GaitPackerV1]::ExportDirection($taskSource,$taskFramesPath,$taskManifest.framePrefix,$taskDirection,$taskStandingFile,$taskColors))
        $taskWalkNames=@(0..7 | ForEach-Object {$taskManifest.framePrefix+('walk_{0}_{1:00}' -f $taskDirection,$_ )})
    } else {
        $taskWalkNames=@($taskLegacy.animations."walk_$taskDirection")
        foreach($taskName in $taskWalkNames) {Copy-Item -LiteralPath (Join-Path $taskLegacyRoot $taskLegacy.frames.$taskName.image) -Destination (Join-Path $taskFramesPath ($taskName+'.png'))}
    }
    Copy-Item -LiteralPath $taskStandingFile -Destination (Join-Path $taskFramesPath ($taskStandName+'.png'))
    $taskNames=@($taskStandName)+$taskWalkNames
    for($taskColumn=0;$taskColumn -lt $taskNames.Count;$taskColumn++) {
        $taskName=$taskNames[$taskColumn]
        $taskHash=if($taskColumn -eq 0 -or $null -eq $taskSourceProperty){$taskLegacy.frames.$taskName.pixelHash}else{$taskReports[$taskDirection][$taskColumn-1].PixelHash}
        $taskFrameDefinitions[$taskName]=[ordered]@{frame=[ordered]@{x=$taskColumn*64;y=$taskRow*96;w=64;h=96};sourceSize=[ordered]@{w=64;h=96};rotated=$false;trimmed=$false;anchorPx=@(32,88);image='frames/'+$taskName+'.png';pixelHash=$taskHash}
        $taskFiles.Add((Join-Path $taskFramesPath ($taskName+'.png')));$taskColumns.Add($taskColumn);$taskRows.Add($taskRow)
    }
    $taskAnimations["stand_$taskDirection"]=@($taskStandName);$taskAnimations["walk_$taskDirection"]=$taskWalkNames
}
[GaitPackerV1]::Atlas($taskFiles.ToArray(),$taskColumns.ToArray(),$taskRows.ToArray(),(Join-Path $taskOutputPath 'atlas.png'),9,$taskColors)
$taskMetadata=[ordered]@{schemaVersion='pixel-atlas-1';characterId=$taskLegacy.characterId;costume=$taskLegacy.costume;identityApprovedByProjectOwner=$false;identityReferenceApprovedByProjectOwner=[bool]$taskLegacy.identityApprovedByProjectOwner;animationStatus='gait_redraw_pending_owner_review';frameSizePx=@(64,96);footAnchorPx=@(32,88);directionOrder=$taskDirections;fps=8;palette=$taskLegacy.palette;frames=$taskFrameDefinitions;animations=$taskAnimations;meta=[ordered]@{image='atlas.png';size=[ordered]@{w=576;h=384};format='indexed_png';scale=1};sourceWalkImages=$taskSourcePaths;legacyAtlasPath=$taskManifest.legacyAtlasPath;reusedStandingPixels=$true;walkPhase=@('contact_a','down_a','passing_b','up_b','contact_b','down_b','passing_a','up_a');export=[ordered]@{artMethod='built_in_image_gen';packingMethod='uniform_nearest_palette_head_registration_ground_anchor';frameCount=$taskFrameDefinitions.Count;reports=$taskReports}}
$taskJson=$taskMetadata | ConvertTo-Json -Depth 14
$taskUtf8=New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $taskOutputPath 'atlas.json'),$taskJson+[Environment]::NewLine,$taskUtf8)
[pscustomobject]@{characterId=$taskLegacy.characterId;frameCount=$taskFrameDefinitions.Count;redrawnDirections=@($taskSourcePaths.Keys);output=$taskOutputPath} | ConvertTo-Json -Compress
