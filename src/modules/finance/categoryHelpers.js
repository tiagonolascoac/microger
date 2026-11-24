// Os IDs iniciais são estáveis para que a inicialização seja idempotente.
export const DEFAULT_FINANCE_CATEGORIES = Object.freeze([
  { id: 'income_mensalidade', name: 'Mensalidade', type: 'income' },
  { id: 'income_vendas', name: 'Vendas', type: 'income' },
  { id: 'income_servicos', name: 'Serviços', type: 'income' },
  { id: 'income_outros', name: 'Outros', type: 'income' },
  { id: 'expense_aluguel', name: 'Aluguel', type: 'expense' },
  { id: 'expense_energia', name: 'Energia', type: 'expense' },
  { id: 'expense_manutencao', name: 'Manutenção', type: 'expense' },
  { id: 'expense_outros', name: 'Outros', type: 'expense' },
]);

export function cleanCategoryName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function key(value) {
  return cleanCategoryName(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function categoryNameTaken(categories, name, type, skipId = null) {
  return categories.some(c => c.id !== skipId && c.type === type && key(c.name) === key(name));
}

export function validateCategoryName(categories, name, type, skipId = null) {
  const cleaned = cleanCategoryName(name);
  if (!cleaned || cleaned.length > 60) throw new Error('Informe uma categoria de 1 a 60 caracteres.');
  if (!['income', 'expense'].includes(type)) throw new Error('Tipo de categoria inválido.');
  if (categoryNameTaken(categories, cleaned, type, skipId)) {
    throw new Error('Já existe uma categoria com esse nome para este tipo de movimentação.');
  }
  return cleaned;
}

export function visibleCategoryName(transaction, categories) {
  if (transaction.categoryId) {
    return categories.find(c => c.id === transaction.categoryId)?.name || transaction.category;
  }
  return transaction.category;
}
