// Initial merge for the redesigned spirit edition. Does not write any V1 asset.
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const root=resolve('docs/design/vfx');
for(const family of ['sword','thunder','wind']){
 const base=join(root,`r04-${family}-v2`),data=JSON.parse(await readFile(join(base,'clips.json'),'utf8')),
 retained=JSON.parse(await readFile(join(base,'retained-clips.json'),'utf8')),
 skill=JSON.parse(await readFile(join(base,'skill.json'),'utf8'));
 Object.assign(data.clips,retained);
 const spirit=data.clips[skill.spirit.clip];spirit.sampling='linear';spirit.opacities=skill.spirit.opacities;
 data.version=skill.version;data.realm='R04';data.edition='half_body_qi_sigil';
 await writeFile(join(base,'clips.json'),JSON.stringify(data,null,2)+'\n');
 console.log(family,Object.values(data.clips).reduce((n,c)=>n+c.frames.length,0),'PNG /',Object.keys(data.clips).length,'clips');
}
