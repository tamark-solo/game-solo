import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialSectProgress, type SectView } from '../../shared/sect';
import { currentSectQuest, sectQuests } from '../../shared/sect-quests';
import { CHAPTER_QUESTS, initialChapter } from '../../shared/chapter';

const view = (): SectView => ({ ...initialSectProgress(), profileId: 'quest-fixture', cultivation: 0,
  milestone: 'introduction', savedAt: 0, hp: 100, practising: false, activityStatus: 'locked',
  cycleStatus: 'idle', cycleReadyAt: 0 });
const foundation = (): SectView => ({ ...view(), hn01: true, hn02: true, foundation: 'breathing', cycleStep: 4,
  level: 1, milestone: 'M01', cultivation: 100 });

test('quest overview exists before joining without pretending later content or skills are unlocked by quests', () => {
  const quests = sectQuests();
  assert.equal(currentSectQuest(quests).id, 'HN01');
  assert.deepEqual(quests.map(q => q.status), ['available', 'locked', 'locked', 'locked', 'unreleased']);
  assert.match(quests[4]!.description, /chưa có/);
  assert.match(quests[4]!.reward, /Chưa mở/);
});
test('HN02 distinguishes confirmed phases, understanding and explicit M01 confirmation', () => {
  const snapshot = view(); snapshot.hn01 = true;
  let quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'HN02'); assert.equal(quest.status, 'available');
  snapshot.foundation = 'breathing'; snapshot.cycleStep = 2;
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.status, 'active');
  assert.deepEqual(quest.objectives.map(o => o.done), [true, true, true, false, false]);
  snapshot.cycleStep = 3;
  assert.match(currentSectQuest(sectQuests(snapshot)).nextStep, /Trả lời câu hỏi/);
  snapshot.cycleStep = 4;
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.status, 'ready'); assert.match(quest.nextStep, /xác nhận M01/);
  assert.equal(snapshot.hn02, false, 'projection cannot confirm the milestone');
});
test('HN03 credit remains visible when a runtime target is gone or a lesson is stopped', () => {
  const snapshot = foundation();
  assert.equal(currentSectQuest(sectQuests(snapshot)).status, 'available');
  snapshot.lessons.basic = true; snapshot.lessons.sword = true; snapshot.lessons.active = 'none';
  const quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'HN03'); assert.equal(quest.status, 'active');
  assert.deepEqual(quest.objectives.map(o => o.done), [true, true, false]);
  assert.match(quest.nextStep, /tiếp tục/);
});
test('all HN03 hit credits mean ready, not rewarded or complete until the server confirms', () => {
  const snapshot = foundation();
  Object.assign(snapshot.lessons, { basic: true, sword: true, thunder: true });
  const original = JSON.stringify(snapshot), quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.status, 'ready'); assert.match(quest.reward, /80/);
  assert.match(quest.nextStep, /xác nhận/);
  assert.equal(sectQuests(snapshot)[3]!.status, 'locked');
  assert.equal(JSON.stringify(snapshot), original);
});
test('HN04 displays independently confirmed walk and wind, then waits for explicit reward confirmation', () => {
  const snapshot = foundation();
  Object.assign(snapshot.lessons, { hn03: true, basic: true, sword: true, thunder: true, active: 'avoid', walk: true });
  let quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'HN04'); assert.equal(quest.status, 'active');
  assert.deepEqual(quest.objectives.map(o => o.done), [true, false]);
  snapshot.lessons.wind = true;
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.status, 'ready'); assert.equal(snapshot.cultivation, 100);
});
test('completed HN01-HN04 do not expose HN05, M02, portal or a new reward as playable', () => {
  const snapshot = foundation();
  Object.assign(snapshot.lessons, { hn03: true, hn04: true, basic: true, sword: true, thunder: true, walk: true, wind: true });
  const quests = sectQuests(snapshot);
  assert.deepEqual(quests.slice(0, 4).map(q => q.status), ['completed', 'completed', 'completed', 'completed']);
  assert.equal(currentSectQuest(quests).id, 'HN05');
  assert.equal(currentSectQuest(quests).status, 'unreleased');
  assert.equal(snapshot.milestone, 'M01');
});
test('projecting a different profile does not carry progress or mutate either saved view', () => {
  const advanced = foundation(), fresh = view(); fresh.profileId = 'other-character';
  const originals = [JSON.stringify(advanced), JSON.stringify(fresh)];
  assert.equal(currentSectQuest(sectQuests(advanced)).id, 'HN03');
  assert.equal(currentSectQuest(sectQuests(fresh)).id, 'HN01');
  assert.deepEqual([JSON.stringify(advanced), JSON.stringify(fresh)], originals);
});

test('a locked cultivation gate tracks the first unfinished quest and its actual next NPC', () => {
  const snapshot = foundation();
  Object.assign(snapshot.lessons, { hn03: true, hn04: true });
  snapshot.chapter = initialChapter();
  snapshot.chapter.accepted = ['HN05']; snapshot.chapter.completed = ['HN05'];
  let quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'HN06'); assert.equal(quest.status, 'locked');
  assert.equal(quest.stationId, 'cultivation'); assert.match(quest.nextStep, /M02/);
  assert.match(quest.objectives.find(o=>!o.done)!.text, /M02/);
  snapshot.milestone = 'M02'; snapshot.level = 3;
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.status, 'available'); assert.equal(quest.stationId, 'preparation');
  assert.equal(quest.objectives.some(o=>o.id==='cultivation-gate'), false);
  snapshot.chapter.accepted = CHAPTER_QUESTS.slice(0, 5);
  snapshot.chapter.completed = CHAPTER_QUESTS.slice(0, 4);
  snapshot.chapter.facts = ['HN09-proof'];
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'HN09'); assert.equal(quest.stationId, 'cultivation');
  snapshot.level = 9; snapshot.milestone = 'M03'; snapshot.chapter.completed.push('HN09');
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'HN10'); assert.equal(quest.stationId, 'cultivation');
  snapshot.level = 15;
  assert.equal(currentSectQuest(sectQuests(snapshot)).stationId, 'preparation');
  snapshot.chapter.jade = 'refined';
  assert.equal(currentSectQuest(sectQuests(snapshot)).stationId, 'training');
});
