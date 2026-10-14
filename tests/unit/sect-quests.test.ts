import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialSectProgress, type SectView } from '../../shared/sect';
import { currentSectQuest, sectQuests } from '../../shared/sect-quests';
import { G2_ACT_IDS, initialChapter } from '../../shared/chapter';

const view = (): SectView => ({
  ...initialSectProgress(),
  profileId: 'quest-fixture',
  cultivation: 0,
  milestone: 'introduction',
  savedAt: 0,
  hp: 100,
  practising: false,
  activityStatus: 'locked',
  cycleStatus: 'idle',
  cycleReadyAt: 0
});

const completedVG01 = (): SectView => {
  const s = view();
  s.hn01 = true;
  s.hn02 = true;
  s.lessons.hn03 = true;
  s.lessons.hn04 = true;
  s.level = 3;
  s.milestone = 'M02';
  s.cultivation = 390;
  return s;
};

test('sectQuests always returns the exact 11 acts (VG01..VG11) of Menh Kiep Chi (GDD 0.34)', () => {
  const quests = sectQuests();
  assert.equal(quests.length, 11);
  assert.deepEqual(quests.map(q => q.id), [...G2_ACT_IDS]);
  assert.equal(currentSectQuest(quests).id, 'VG01');
  assert.equal(quests[0]!.status, 'active');
  assert.ok(quests.slice(1).every(q => q.status === 'locked'));
});

test('VG01 tracks 3 sub-objectives and completes once hn04 or g2-act-VG01 is confirmed, unlocking VG02', () => {
  const snapshot = view();
  snapshot.hn01 = true;
  let quests = sectQuests(snapshot);
  assert.equal(quests[0]!.status, 'active');
  assert.deepEqual(quests[0]!.objectives.map(o => o.done), [true, false, false]);

  snapshot.hn02 = true;
  quests = sectQuests(snapshot);
  assert.deepEqual(quests[0]!.objectives.map(o => o.done), [true, true, false]);

  snapshot.lessons.hn04 = true;
  quests = sectQuests(snapshot);
  assert.equal(quests[0]!.status, 'completed');
  const current = currentSectQuest(quests);
  assert.equal(current.id, 'VG02');
  assert.equal(current.status, 'active');
});

test('VG02 through VG06 track proof and completion cleanly across Stage 1', () => {
  const snapshot = completedVG01();
  snapshot.chapter = initialChapter();
  snapshot.chapter.facts.push('HN05-proof');

  let quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'VG02');
  assert.equal(quest.status, 'ready');
  assert.deepEqual(quest.objectives.map(o => o.done), [true, false]);

  snapshot.chapter.completed.push('HN05');
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'VG03');
  assert.equal(quest.status, 'active');

  snapshot.chapter.completed.push('HN06', 'HN07', 'HN09');
  quest = currentSectQuest(sectQuests(snapshot));
  assert.equal(quest.id, 'VG06');
  assert.equal(quest.status, 'active');
});

test('VG07 through VG11 chain cleanly across Stage 2 without any -II or -III legacy sub-quests', () => {
  const snapshot = completedVG01();
  snapshot.level = 15;
  snapshot.cultivation = 3200;
  snapshot.chapter = initialChapter();
  snapshot.chapter.completed = ['HN05', 'HN06', 'HN07', 'HN08', 'HN09', 'HN10', 'HN11', 'HN12', 'EX01'];

  const quests = sectQuests(snapshot);
  assert.equal(quests.some(q => q.id.includes('-II') || q.id.includes('-III')), false);
  const current = currentSectQuest(quests);
  assert.equal(current.id, 'VG10');
  assert.equal(current.status, 'active');

  snapshot.chapter.completed.push('EX02');
  assert.equal(currentSectQuest(sectQuests(snapshot)).id, 'VG11');
});

test('projecting a different profile does not carry progress or mutate either saved view', () => {
  const advanced = completedVG01();
  const fresh = view();
  fresh.profileId = 'other-character';
  const originals = [JSON.stringify(advanced), JSON.stringify(fresh)];
  assert.equal(currentSectQuest(sectQuests(advanced)).id, 'VG02');
  assert.equal(currentSectQuest(sectQuests(fresh)).id, 'VG01');
  assert.deepEqual([JSON.stringify(advanced), JSON.stringify(fresh)], originals);
});
