import {uid,type EditorAsset} from '../../shared/map-editor';

export async function readPNG(file:File):Promise<{url:string;image:HTMLImageElement}> {
  if(file.type!=='image/png'||file.size>4*1024*1024)throw new Error('Chọn PNG tối đa 4 MB.');
  const url=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('Không đọc được PNG.'));r.readAsDataURL(file);});
  const image=new Image();image.src=url;await image.decode();if(image.width>8192||image.height>8192)throw new Error('PNG vượt 8192 px.');return {url,image};
}
export async function importPNGs(files:File[]):Promise<EditorAsset[]> {const out:EditorAsset[]=[];for(const f of files){const {url,image}=await readPNG(f);out.push({id:uid(),name:f.name.slice(0,110),width:image.width,height:image.height,pivot:{x:image.width/2,y:image.height-8},category:'other',defaultLayer:'depth',parts:[{id:'image',file:url,cover:false}]});}return out;}
export async function sliceTileset(file:File,width:number,height:number,limit:number):Promise<EditorAsset[]> {
  const {image}=await readPNG(file);if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||image.width%width||image.height%height)throw new Error('Cỡ ô phải chia hết chiều rộng/cao PNG; tileset không có margin/spacing.');
  if(image.width/width*image.height/height>limit)throw new Error(`Tileset vượt ${limit} ô còn trống trong thư viện. Chọn sheet nhỏ hơn.`);
  const out:EditorAsset[]=[],c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d',{willReadFrequently:true})!;
  for(let row=0;row<image.height/height;row++)for(let col=0;col<image.width/width;col++){x.clearRect(0,0,width,height);x.drawImage(image,col*width,row*height,width,height,0,0,width,height);const pixels=x.getImageData(0,0,width,height).data;let visible=false;for(let i=3;i<pixels.length;i+=4)if(pixels[i]){visible=true;break;}if(!visible)continue;out.push({id:uid(),name:`${file.name.slice(0,80)} · ${col},${row}`,width,height,pivot:{x:0,y:0},category:'terrain',defaultLayer:'ground',parts:[{id:'tile',file:c.toDataURL('image/png'),cover:false}]});}return out;
}
