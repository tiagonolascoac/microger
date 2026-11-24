import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FINANCE_CATEGORIES, categoryNameTaken, cleanCategoryName, validateCategoryName, visibleCategoryName } from './categoryHelpers.js';

test('categorias padrão têm IDs únicos e ambos os tipos', () => {
  assert.equal(new Set(DEFAULT_FINANCE_CATEGORIES.map(c => c.id)).size, DEFAULT_FINANCE_CATEGORIES.length);
  assert(DEFAULT_FINANCE_CATEGORIES.some(c => c.type === 'income'));
  assert(DEFAULT_FINANCE_CATEGORIES.some(c => c.type === 'expense'));
});
test('normaliza espaços e impede duplicidade ignorando caixa e acentos', () => {
  const categories = [{ id: '1', type: 'expense', name: 'Energia elétrica' }];
  assert.equal(cleanCategoryName('   Conta   de  luz '), 'Conta de luz');
  assert.equal(categoryNameTaken(categories, 'energia ELETRICA', 'expense'), true);
  assert.equal(categoryNameTaken(categories, 'energia eletrica', 'income'), false);
  assert.equal(validateCategoryName(categories, 'Energia elétrica', 'expense', '1'), 'Energia elétrica');
  assert.throws(() => validateCategoryName(categories, 'energia eletrica', 'expense'), /Já existe/);
});
test('usa o nome atualizado para transações vinculadas; preserva o histórico legado', () => {
  const categories = [{ id: 'abc', name: 'Receitas online' }];
  assert.equal(visibleCategoryName({ categoryId: 'abc', category: 'Vendas' }, categories), 'Receitas online');
  assert.equal(visibleCategoryName({ category: 'Mensalidade' }, categories), 'Mensalidade');
  assert.equal(visibleCategoryName({ categoryId: 'missing', category: 'Outros' }, categories), 'Outros');
});
