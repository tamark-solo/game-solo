import {readFile} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
export async function png(file){
 const bytes=await readFile(file);if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('PNG signature '+file);
 let width,height,depth,type,interlace,idat=[];
 for(let at=8;at<bytes.length;){const len=bytes.readUInt32BE(at),tag=bytes.toString('ascii',at+4,at+8),data=bytes.subarray(at+8,at+8+len);if(tag==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9];interlace=data[12];}if(tag==='IDAT')idat.push(data);at+=len+12;}
 const channels={0:1,2:3,4:2,6:4}[type];if(depth!==8||interlace!==0||!channels)throw Error('Unsupported PNG encoding '+file);
 const stride=width*channels,filtered=inflateSync(Buffer.concat(idat));if(filtered.length!==(stride+1)*height)throw Error('PNG length '+file);
 const decoded=Buffer.alloc(stride*height),paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const f=filtered[y*(stride+1)];if(f>4)throw Error('PNG filter');for(let x=0;x<stride;x++){const n=filtered[y*(stride+1)+x+1],a=x>=channels?decoded[y*stride+x-channels]:0,b=y?decoded[(y-1)*stride+x]:0,c=y&&x>=channels?decoded[(y-1)*stride+x-channels]:0;decoded[y*stride+x]=(n+(f===0?0:f===1?a:f===2?b:f===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}}
 const rgba=Buffer.alloc(width*height*4);for(let p=0;p<width*height;p++){const i=p*channels,j=p*4;if(type===6){decoded.copy(rgba,j,i,i+4);}else if(type===2){decoded.copy(rgba,j,i,i+3);rgba[j+3]=255;}else{rgba[j]=rgba[j+1]=rgba[j+2]=decoded[i];rgba[j+3]=type===4?decoded[i+1]:255;}}
 return {width,height,rgba,pixel:(x,y)=>[...rgba.subarray((y*width+x)*4,(y*width+x)*4+4)]};
}
export function edges(image,threshold=1){let count=0;for(let x=0;x<image.width;x++)for(const y of [0,image.height-1])if(image.rgba[(y*image.width+x)*4+3]>=threshold)count++;for(let y=1;y<image.height-1;y++)for(const x of [0,image.width-1])if(image.rgba[(y*image.width+x)*4+3]>=threshold)count++;return count;}
export function rectBytes(image,[x,y,w,h]){const out=Buffer.alloc(w*h*4);for(let row=0;row<h;row++)image.rgba.copy(out,row*w*4,((y+row)*image.width+x)*4,((y+row)*image.width+x+w)*4);return out;}
export function alphaCount(image,threshold=1){let n=0;for(let i=3;i<image.rgba.length;i+=4)if(image.rgba[i]>=threshold)n++;return n;}
