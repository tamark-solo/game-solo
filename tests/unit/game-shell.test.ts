import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gameShellPhase, type GameShellState } from '../../client/src/game-shell';

const state = (patch: Partial<GameShellState> = {}): GameShellState =>
  ({ ready: true, opening: false, status: 'idle', ownConnected: false, ...patch });

test('game shell never opens entry or gameplay before assets are ready', () => {
  assert.equal(gameShellPhase(state({ ready: false })), 'loading');
  assert.equal(gameShellPhase(state({ ready: false, status: 'connected', ownConnected: true })), 'loading');
});
test('fresh and failed connections return to entry without treating a cached player as connected', () => {
  assert.equal(gameShellPhase(state()), 'entry');
  assert.equal(gameShellPhase(state({ status: 'error', ownConnected: true })), 'entry');
});
test('joining, leaving and reconnecting keep gameplay blocked until the own player is confirmed', () => {
  assert.equal(gameShellPhase(state({ opening: true })), 'connecting');
  assert.equal(gameShellPhase(state({ status: 'connecting' })), 'connecting');
  assert.equal(gameShellPhase(state({ status: 'reconnecting', ownConnected: true })), 'connecting');
  assert.equal(gameShellPhase(state({ status: 'connected' })), 'connecting');
});
test('only a connected own player enables the game screen; opening still takes precedence', () => {
  assert.equal(gameShellPhase(state({ status: 'connected', ownConnected: true })), 'playing');
  assert.equal(gameShellPhase(state({ opening: true, status: 'connected', ownConnected: true })), 'connecting');
});
