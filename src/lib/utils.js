export const brl = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function parseAmountCents(input) {
  const cleaned = String(input).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const value = Number(cleaned);
  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned) || !Number.isFinite(value) || value <= 0) {
    throw new Error('Informe um valor positivo, como 120,50.');
  }
  const cents = Math.round(value * 100);
  if (!Number.isSafeInteger(cents)) throw new Error('Valor muito alto.');
  return cents;
}
