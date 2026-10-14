import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SCHEMA,
  PROGRESSION_CONTRACTS,
  IDENTITIES,
  REALMS,
  FOUNDATION_QUALITIES,
  STANCES,
  ARTIFACT_FAMILIES,
  ACTS,
  SANDBOX_ACTIVITIES,
  BOSS_ENCOUNTERS,
  evaluateAnnularSealSector,
  createProgressionPrototype,
  restoreProgressionPrototype,
  runFullStage1To2Walkthrough,
} from '../../docs/design/gameplay/wang-lin-progression-loop-prototype-v1/core.mjs';

test('progression contracts are frozen, experimental-fixture-only, and match contracts.json', async () => {
  const json = JSON.parse(
    await readFile(
      new URL('../../docs/design/gameplay/wang-lin-progression-loop-prototype-v1/contracts.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(json.schema, SCHEMA);
  assert.equal(json.runtimeIntegrated, false);
  assert.deepEqual(json, PROGRESSION_CONTRACTS);
  assert.throws(() => {
    PROGRESSION_CONTRACTS.realms.ngung_khi.maxSubStage = 99;
  }, TypeError);
});

test('covers both identities (Huyễn Tâm a / Tịch Bạch b), 5 Major Realms, 4 Artifacts x 3 Milestones, 3 Stances, and 11 Acts', () => {
  assert.deepEqual(Object.keys(IDENTITIES), ['a', 'b']);
  assert.equal(IDENTITIES.a.bodyHeightPx, 80);
  assert.equal(IDENTITIES.b.bodyHeightPx, 80);
  assert.deepEqual(Object.keys(REALMS), ['ngung_khi', 'truc_co', 'ket_dan', 'nguyen_anh', 'hoa_than']);
  assert.equal(REALMS.ngung_khi.subStages.length, 15);
  assert.deepEqual(Object.keys(ARTIFACT_FAMILIES), ['sword', 'banner', 'chariot', 'bead']);
  for (const fam of Object.values(ARTIFACT_FAMILIES)) {
    assert.deepEqual(Object.keys(fam.milestones), ['1', '2', '3']);
  }
  assert.deepEqual(Object.keys(STANCES), ['sword_kill', 'soul_command', 'chariot_bulwark']);
  assert.equal(ACTS.length, 11);
  assert.equal(ACTS[0].id, 'VG01');
  assert.equal(ACTS[10].id, 'VG11');
});

test('Sub-stage Auto vs. Gate Breakthrough: normal sub-stages auto-advance, gate sub-stages (3, 6, 9, 12, 15) require breakthroughFact', () => {
  const p = createProgressionPrototype({ avatarId: 'a' });
  assert.equal(p.cultivation.subStage, 1);

  // Gain 500 EXP without completing VG01_S3_QI_CONDUIT_TRIAL: should auto-advance to sub-stage 2, then hold at Gate 3
  p.gainCultivationExp(500, 'test');
  assert.equal(p.cultivation.subStage, 2);
  assert.equal(p.events.at(-1).type, 'substage_gate_held');
  assert.equal(p.events.at(-1).waitingForSubStage, 3);
  assert.equal(p.events.at(-1).requiredBreakthroughFact, 'fact_vg01_qi_conduit_trial');

  // Recording the gate fact immediately unlocks sub-stage 3 and auto-advances into sub-stage 4 (since EXP is 500 + 120 = 620)
  p.recordFact('fact_vg01_qi_conduit_trial');
  assert.equal(p.cultivation.subStage, 4);
});

test('Auto-Chain Fact Rule advances VG01 steps in the field and unlocks Thiên Nghịch Châu Mốc I & Kiếm Linh Mốc I', () => {
  const p = createProgressionPrototype({ avatarId: 'b' });

  // Before picking up bead, bead-st is unowned
  assert.equal(p.castArtifact({ family: 'bead', mode: 'st', startedAt: 100 }).reason, 'artifact-unowned');

  // Step 1: pick up Stone Bead in Cliff Cave
  const s1 = p.recordFact('fact_vg01_stone_bead_picked');
  assert.equal(s1.chainedSteps.length, 1);
  assert.equal(p.cultivation.subStage, 2);
  assert.equal(p.loadout.families.bead.ownership, 'discovered');
  assert.deepEqual(p.loadout.families.bead.unlockedSkills, ['st']);
  assert.equal(p.ledger.currentStepId, 'VG01_S2_SWORD_AND_PUPPETS');

  // Step 2: clear 3 training puppets & refine Sword M1
  p.recordFact('fact_vg01_training_puppets_cleared');
  assert.equal(p.loadout.families.sword.ownership, 'refined');
  assert.deepEqual(p.loadout.families.sword.unlockedSkills, ['st']);
  assert.equal(p.ledger.currentStepId, 'VG01_S3_QI_CONDUIT_TRIAL');

  // Step 3: complete Qi Conduit trial -> finishes VG01, advances to VG02, reaches Ngưng Khí 3
  p.recordFact('fact_vg01_qi_conduit_trial');
  assert.equal(p.cultivation.subStage, 3);
  assert.equal(p.ledger.currentActId, 'VG02');
  assert.ok(p.ledger.completedActs.includes('VG01'));
});

test('3 Cultivation Stances and Milestone II Hứa Lập Quốc integrate with P2 equipment contracts', () => {
  const p = createProgressionPrototype({ avatarId: 'a' });
  p.recordFact('fact_vg01_stone_bead_picked');
  p.recordFact('fact_vg01_training_puppets_cleared');

  // Locked before VG03
  assert.equal(p.switchStance('sword_kill').reason, 'stance-system-locked-until-vg03');

  // Unlock stance system in VG03
  p.recordFact('fact_vg03_situ_nan_met');
  assert.equal(p.switchStance('soul_command', { inCombat: true }).reason, 'cannot-switch-stance-in-combat');
  assert.equal(p.switchStance('sword_kill', { inCombat: false }).accepted, true);

  // Cast sword-st under sword_kill stance: cooldown reduced from 6000ms -> 5000ms, multiplier 1.15
  const cast1 = p.castArtifact({
    family: 'sword',
    mode: 'st',
    startedAt: 1000,
    origin: { x: 0, y: 0 },
    aim: { x: 1, y: 0 },
  });
  assert.equal(cast1.accepted, true);
  assert.equal(cast1.modifierSummary.effectiveCooldownMs, 5000);
  assert.equal(cast1.modifierSummary.magnitudeMultiplier, 1.15);

  // Cooldown enforced before readyAt (6000)
  assert.equal(
    p.castArtifact({ family: 'sword', mode: 'st', startedAt: 4000, origin: { x: 0, y: 0 }, aim: { x: 1, y: 0 } }).reason,
    'artifact-on-cooldown',
  );

  // Upgrade sword to Milestone II (Hứa Lập Quốc) and cast against target < 50% HP
  p.recordFact('fact_vg08_xu_liguo_subdued');
  const cast2 = p.castArtifact({
    family: 'sword',
    mode: 'st',
    startedAt: 7000,
    origin: { x: 0, y: 0 },
    aim: { x: 1, y: 0 },
    targetHpRatio: 0.35,
  });
  assert.equal(cast2.accepted, true);
  assert.equal(cast2.modifierSummary.milestoneTier, 2);
  // 1.35 (Milestone II) * 1.15 (sword_kill) * 1.25 (execute < 50% HP) = 1.940625 -> 1.9406
  assert.equal(cast2.modifierSummary.magnitudeMultiplier, 1.9406);
});

test('Boss 4 Hắc Ấn Chấp Sự: 90-degree safe sector geometry for Ấn Hồi and non-entity Phân Phù mirages', async () => {
  const fixtures = JSON.parse(
    await readFile(
      new URL('../../docs/design/gameplay/wang-lin-progression-loop-prototype-v1/fixtures.json', import.meta.url),
      'utf8',
    ),
  );
  for (const probe of fixtures.scenarios.annular_seal_90deg_sector_probes) {
    const res = evaluateAnnularSealSector(probe.playerPos, probe.bossOrigin, probe.lockedAim, 112, 90);
    assert.equal(res.inRing, probe.expected.inRing, `probe ${probe.id} inRing`);
    assert.equal(res.inSafeSector, probe.expected.inSafeSector, `probe ${probe.id} inSafeSector`);
    assert.equal(res.takesDamage, probe.expected.takesDamage, `probe ${probe.id} takesDamage`);
  }

  // Verify walking fairness: at 80 px/s during 1100ms telegraph, player walks 88px (more than enough to reach the 90° wedge)
  const boss = BOSS_ENCOUNTERS.boss_dark_seal_officer;
  assert.equal(boss.mirageIsEntityWithHpOrLoot, false);
  const maxWalkDistanceDuringTelegraphPx = (boss.annularTelegraphMs / 1000) * PROGRESSION_CONTRACTS.playerWalkSpeedPxPerS;
  assert.equal(maxWalkDistanceDuringTelegraphPx, 88);
  assert.ok(maxWalkDistanceDuringTelegraphPx >= 64);
});

test('Foundation Quality (Phàm Đạo -> Thiên Đạo) supports retroactive Bù Đắp Đạo Cơ without bricking', () => {
  const p = createProgressionPrototype({ avatarId: 'a' });
  p.gainCultivationExp(8000, 'fast-forward');
  p.recordFact('fact_vg01_qi_conduit_trial');
  p.recordFact('kill_cloud_wolf_king');
  p.recordFact('fact_vg03_black_seal_decoded');
  p.recordFact('kill_three_seal_construct');
  p.recordFact('kill_spirit_ward_elder_tree');
  assert.equal(p.cultivation.subStage, 15);

  // Defeat Dark Seal Officer after taking a hit (not flawless) and remove 2 boss proofs to simulate Mortal Foundation first
  p.simulateBossEncounter('boss_dark_seal_officer', {
    bossOrigin: { x: 0, y: 0 },
    lockedAim: { x: 1, y: 0 },
    playerPosAtCollapse: { x: 0, y: 90 }, // outside 90° safe sector
    flawless: false,
  });
  p.recordFact('fact_vg05_meet_li_muwan');
  p.runSandboxActivity('cluster_mushroom_woods');
  p.craftAlchemyRecipe('recipe_foundation_pill');

  // Force mortal breakthrough by only having 1 proof at breakthrough time
  const snap = p.snapshot();
  snap.ledger.inventory.proof_three_seal_core = 0;
  snap.ledger.inventory.proof_elder_tree_heart = 0;
  const mortalPlayer = restoreProgressionPrototype(snap);

  const bt = mortalPlayer.executeFoundationBreakthrough();
  assert.equal(bt.accepted, true);
  assert.equal(bt.foundationQuality, 'mortal');
  assert.equal(mortalPlayer.stats.jadeTalismanSlots, 1);

  // Now re-challenge bosses in Trial mode to earn missing proofs + flawless Dark Seal victory -> upgrade to Heaven Foundation!
  mortalPlayer.simulateBossEncounter('boss_three_seal_construct');
  mortalPlayer.simulateBossEncounter('boss_spirit_ward_elder_tree', { severedCorruptedRoots: 3 });
  mortalPlayer.simulateBossEncounter('boss_dark_seal_officer', {
    bossOrigin: { x: 0, y: 0 },
    lockedAim: { x: 1, y: 0 },
    playerPosAtCollapse: { x: 80, y: 0 }, // inside 90° safe sector
    flawless: true,
  });

  const upgrade = mortalPlayer.upgradeFoundationQuality();
  assert.equal(upgrade.accepted, true);
  assert.equal(upgrade.from, 'mortal');
  assert.equal(upgrade.to, 'heaven');
  assert.equal(mortalPlayer.stats.jadeTalismanSlots, 3);
  assert.equal(mortalPlayer.stats.cooldownReduction, 0.1);
});

for (const avatarId of ['a', 'b']) {
  test(`Full Stage 1 -> Stage 2 walkthrough (${avatarId}) completes VG01..VG11, reaches Kết Đan, and round-trips snapshot`, () => {
    const p = runFullStage1To2Walkthrough(avatarId);
    assert.equal(p.cultivation.avatarId, avatarId);
    assert.equal(p.cultivation.realmId, 'ket_dan');
    assert.equal(p.cultivation.subStage, 1);
    assert.equal(p.cultivation.foundationQuality, 'heaven');
    assert.equal(p.cultivation.coreAttribute, 'sword_core');
    assert.equal(p.ledger.completedActs.length, 11);
    for (const family of ['sword', 'banner', 'chariot', 'bead']) {
      assert.equal(p.loadout.families[family].ownership, 'refined');
      assert.equal(p.loadout.families[family].milestoneTier, 2);
    }
    assert.equal(p.noiGioi.unlocked, true);
    assert.equal(p.noiGioi.refinedCommanderSouls.includes('false_core_dark_seal_soul'), true);

    const restored = restoreProgressionPrototype(JSON.stringify(p.snapshot()));
    assert.deepEqual(restored.snapshot(), p.snapshot());
  });
}
