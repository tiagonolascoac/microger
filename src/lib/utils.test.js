import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmountCents } from './utils.js';

test('Converte valores brasileiros para centavos', () => {
  assert.equal(parseAmountCents('1.234,50'), 123450);
  assert.equal(parseAmountCents('90'), 9000);
  assert.equal(parseAmountCents('0,01'), 1);
});

test('Rejeita zeros e casas decimais adicionais', () => {
  assert.throws(() => parseAmountCents('0'));
  assert.throws(() => parseAmountCents('1,999'));
});
