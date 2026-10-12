import {CHARACTER_INFO,R01_IDS,isAvatarId,type AvatarId,type CharacterProfile} from '../../../shared/profiles';
import {initialSectProgress,validSectProgress} from '../../../shared/sect';
import {initialLessonProgress} from '../../../shared/lesson-contracts';
import {initialCharacterInventory,validCharacterInventory} from '../../../shared/character-inventory';
import {validChapter} from '../../../shared/chapter';

// Shared by legacy and registered-character repositories; never repairs an invalid save.
export function decodeProfile(data:string,identity:{id:string;accountId:string;avatarId:AvatarId;revision:number}):CharacterProfile {
  const raw=JSON.parse(data) as Omit<CharacterProfile,'schema'>&{schema:number};
  if(![1,2].includes(raw.schema))throw new Error('Saved profile failed validation.');
  const p=raw as CharacterProfile,{accountId,avatarId}=identity;
  if(!isAvatarId(p.avatarId)||p.accountId!==accountId||p.avatarId!==avatarId||p.id!==identity.id||p.revision!==identity.revision||
    ![p.x,p.y,p.hp,p.mp,p.casts,p.practiceHits,p.revision,p.nextSwordAt,p.nextThunderAt,p.nextWindAt,p.lastSpentAt,p.createdAt,p.updatedAt].every(Number.isFinite)||
    p.hp<0||p.hp>100||p.mp<0||p.mp>100||![p.casts,p.practiceHits,p.revision,p.cultivation].every(n=>Number.isInteger(n)&&n>=0)||
    !Array.isArray(p.skills)||p.skills.length!==3||!R01_IDS.every(id=>p.skills.includes(id))||
    (p.chapter!==undefined&&!validChapter(p.chapter))||
    (p.facing!==undefined&&(!p.facing||![p.facing.x,p.facing.y].every(Number.isFinite)||Math.hypot(p.facing.x,p.facing.y)<.001||Math.hypot(p.facing.x,p.facing.y)>1.001))||
    (raw.schema===1?p.milestone!=='introduction':!validSectProgress(p.sect,p))||
    (p.inventory!==undefined&&!validCharacterInventory(p.inventory,p.id))||
    p.progressionKind!==CHARACTER_INFO[avatarId].progressionKind||typeof p.name!=='string'||typeof p.mapId!=='string'||typeof p.mapVersion!=='string')throw new Error('Saved profile failed validation.');
  const inventory=p.inventory??initialCharacterInventory(p.id);
  return raw.schema===1?{...p,schema:2,sect:initialSectProgress(),inventory}:{...p,sect:{...p.sect,lessons:p.sect.lessons??initialLessonProgress()},inventory};
}
