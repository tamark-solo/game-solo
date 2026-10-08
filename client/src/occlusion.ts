export interface AlphaMask { width: number; height: number; alpha: Uint8Array }
export interface PlacedMask { mask: AlphaMask; left: number; top: number; scaleX?: number; scaleY?: number; flipX?: boolean }

export function imageAlpha(image: CanvasImageSource & { width: number; height: number }): AlphaMask {
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,0,0);
  const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data,alpha=new Uint8Array(canvas.width*canvas.height);
  for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
  return {width:canvas.width,height:canvas.height,alpha};
}

export function cropAlpha(source: AlphaMask, rect:{x:number;y:number;w:number;h:number}):AlphaMask {
  const alpha=new Uint8Array(rect.w*rect.h);
  for(let y=0;y<rect.h;y++)alpha.set(source.alpha.subarray((rect.y+y)*source.width+rect.x,(rect.y+y)*source.width+rect.x+rect.w),y*rect.w);
  return {width:rect.w,height:rect.h,alpha};
}

export function opaqueMasksOverlap(a:PlacedMask,b:PlacedMask):boolean {
  const bounds=(p:PlacedMask)=>({left:p.left,top:p.top,right:p.left+p.mask.width*(p.scaleX??1),bottom:p.top+p.mask.height*(p.scaleY??1)});
  const aa=bounds(a),bb=bounds(b),left=Math.max(aa.left,bb.left),top=Math.max(aa.top,bb.top),right=Math.min(aa.right,bb.right),bottom=Math.min(aa.bottom,bb.bottom);
  if(right<=left||bottom<=top)return false;
  const sample=(p:PlacedMask,x:number,y:number)=>{
    let px=Math.floor((x-p.left)/(p.scaleX??1));const py=Math.floor((y-p.top)/(p.scaleY??1));
    if(p.flipX)px=p.mask.width-px-1;
    return px>=0&&py>=0&&px<p.mask.width&&py<p.mask.height?p.mask.alpha[py*p.mask.width+px]:0;
  };
  let hits=0;
  for(let y=top+.5;y<bottom;y+=2)for(let x=left+.5;x<right;x+=2){if(sample(a,x,y)>=48&&sample(b,x,y)>=48&&++hits>=2)return true;}
  return false;
}
