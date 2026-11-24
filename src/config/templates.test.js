import test from 'node:test';
import assert from 'node:assert/strict';
import { makeWorkspace, TEMPLATES } from './templates.js';

test('Academia herda financeiro; Financeiro não herda academia', () => {
  assert.deepEqual(TEMPLATES.academy.enabledModules, ['academy', 'finance']);
  assert.deepEqual(TEMPLATES.financial.enabledModules, ['finance']);
});

test('Cada criação obtém sua própria configuração', () => {
  const a = makeWorkspace('academy', 'Academia A', 'uid');
  const b = makeWorkspace('academy', 'Academia B', 'uid');
  a.enabledModules.push('outro');
  a.theme.primary = '#000000';
  assert.deepEqual(b.enabledModules, ['academy', 'finance']);
  assert.equal(b.theme.primary, '#155E52');
});

test('Modelos e nomes inválidos são rejeitados', () => {
  assert.throws(() => makeWorkspace('inventado', 'Teste', 'uid'));
  assert.throws(() => makeWorkspace('academy', '   ', 'uid'));
});
