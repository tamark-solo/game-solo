// Draw source RGBA unchanged. A presentation clip keeps the locked escape wedge
// free of decorative sparks; gameplay and source bitmaps remain separate.
export function drawSprite(ctx,image,pivot,pos,size,{zoom=1,opacity=1,rotation=0,scaleY=1,safeGap=0}={}){
 ctx.save();ctx.translate(...pos);ctx.rotate(rotation);ctx.scale(1,scaleY);ctx.imageSmoothingEnabled=false;
 if(safeGap){const gap=safeGap*Math.PI/360;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,512*zoom,-Math.PI+gap,Math.PI-gap);ctx.closePath();ctx.clip();}
 ctx.globalAlpha=opacity;ctx.drawImage(image,-pivot[0]*zoom,-pivot[1]*zoom,size[0]*zoom,size[1]*zoom);ctx.restore();
}
