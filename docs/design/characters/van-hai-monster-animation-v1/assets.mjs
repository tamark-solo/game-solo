const cache=new Map(),pending=new Map(),fixed=new Map(),budget=16*1024*1024;let decoded=0,loads=0,evictions=0;
export async function fixedBitmap(url){const absolute=new URL(url,import.meta.url).href;if(!fixed.has(absolute))fixed.set(absolute,(async()=>{const im=new Image();im.src=absolute;await im.decode();return createImageBitmap(im);})());return fixed.get(absolute);}
export async function bitmap(url){
 const absolute=new URL(url,import.meta.url).href;
 if(cache.has(absolute)){const v=cache.get(absolute);cache.delete(absolute);cache.set(absolute,v);return v.image;}
 if(pending.has(absolute))return pending.get(absolute);
 const promise=(async()=>{const im=new Image();im.src=absolute;await im.decode();const image=await createImageBitmap(im),bytes=image.width*image.height*4;loads++;
  if(bytes>budget)return image;
  while(decoded+bytes>budget&&cache.size){const [key,old]=cache.entries().next().value;cache.delete(key);old.image.close();decoded-=old.bytes;evictions++;}
  cache.set(absolute,{image,bytes});decoded+=bytes;return image;})();
 pending.set(absolute,promise);try{return await promise;}finally{pending.delete(absolute);}
}
export const cacheStats=()=>({decodedBytes:decoded,budgetBytes:budget,entries:cache.size,loads,evictions,scope:'decoded actor/FX bitmaps only; excludes map/browser cache/GPU total'});
export function dispose(){for(const v of cache.values())v.image.close();cache.clear();decoded=0;for(const p of fixed.values())p.then(im=>im.close());fixed.clear();}
