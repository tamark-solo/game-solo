import {progressionLabel,type SectView} from '../../../shared/sect';
import {chapterGate,initialChapter,levelThreshold} from '@shared/chapter';
import {currentSectQuest,sectQuests} from '../../../shared/sect-quests';
import type {AvatarId} from '../../../shared/profiles';

// Presentation projection only. Thresholds/credits remain defined by shared gameplay.
export function characterSheet(view:SectView,avatarId:AvatarId){
 const recovery=avatarId==='CHR-SITU-NAN';
 const gate=chapterGate(view.chapter??initialChapter()),max=gate===3600?15:gate===1620?9:3;
 const nextLevel=view.hn02&&view.level<max?view.level+1:undefined;
 const threshold=nextLevel===undefined?undefined:levelThreshold(nextLevel);
 const missing=threshold===undefined?undefined:Math.max(0,threshold-view.cultivation);
 const quest=currentSectQuest(sectQuests(view));
 return {
  realm:progressionLabel(avatarId,view.level).replace(' · mốc gameplay',''),
  foundation:view.foundation==='spirit'?'Ổn định linh thể':view.foundation==='breathing'?'Thổ nạp nhập môn':'Chưa chọn nền',
  accumulation:recovery?'Tiến triển hồi phục':'Tu vi tích lũy',
  nextLevel,threshold,missing,
  thresholdLabel:nextLevel===undefined?'':recovery?`Xác nhận tiến triển hồi phục ${nextLevel}/15`:`Xác nhận tầng ${nextLevel}`,
  progress:threshold===undefined?0:Math.min(100,Math.max(0,view.cultivation/threshold*100)),
  quest,completedObjectives:quest.objectives.filter(o=>o.done).length,
  nextObjective:quest.objectives.find(o=>!o.done)?.text??quest.nextStep,
 };
}
