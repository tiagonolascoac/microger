import { useEffect, useState } from 'react';
import { addDoc, deleteDoc, doc, onSnapshot, orderBy, query, where, serverTimestamp } from 'firebase/firestore';
import { ArrowDownLeft, ArrowUpRight, FolderCog, Plus, Trash2, Wallet } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { transactionsRef } from '../../lib/data';
import { brl, localToday, parseAmountCents } from '../../lib/utils';
import { visibleCategoryName } from './categoryHelpers';
import { useFinanceCategories } from './financeCategories';

export default function FinancePage() {
  const { orgId, spaceId } = useOutletContext();
  const { user } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError } = useFinanceCategories(orgId, spaceId, user.uid);
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(localToday().slice(0, 7));
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [occurredOn, setOccurredOn] = useState(localToday());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!month) { setTransactions([]); return undefined; }
    return onSnapshot(query(transactionsRef(orgId, spaceId), where('occurredOn', '>=', `${month}-01`), where('occurredOn', '<=', `${month}-31`), orderBy('occurredOn', 'desc')),
      snapshot => setTransactions(snapshot.docs.map(d => ({id:d.id, ...d.data()}))),
      e => setError(e.message));
  }, [orgId, spaceId, month]);

  const available = categories.filter(c => c.active && c.type === type);
  const selectedCategory = available.find(c => c.id === categoryId) || available[0];
  const incomes = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amountCents, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amountCents, 0);
  const categoryManagementUrl = `/org/${orgId}/spaces/${spaceId}/finance/categories`;

  async function saveTransaction(event) {
    event.preventDefault(); setError('');
    if (!selectedCategory) { setError('Crie uma categoria ativa antes de registrar lançamentos.'); return; }
    setBusy(true);
    try {
      const amountCents = parseAmountCents(amount);
      await addDoc(transactionsRef(orgId, spaceId), {
        type, amountCents,
        categoryId: selectedCategory.id,
        category: selectedCategory.name, // Snapshot legível para transações antigas e exportações.
        description: description.trim(),
        occurredOn, createdBy: user.uid, createdAt: serverTimestamp(),
      });
      setAmount(''); setDescription('');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function removeTransaction(id) {
    if (!window.confirm('Excluir este lançamento? Esta operação não poderá ser desfeita.')) return;
    try { await deleteDoc(doc(transactionsRef(orgId, spaceId), id)); }
    catch(e) { setError(e.message); }
  }

  return <>
    <div className="page-head finance-header">
      <div><span className="eyebrow">MÓDULO COMPARTILHADO</span><h1>Financeiro</h1><p className="muted">Lançamentos exclusivos deste espaço.</p></div>
      <div className="finance-tools"><Link className="button outlined" to={categoryManagementUrl}><FolderCog size={17}/> Gerenciar categorias</Link><label className="month-filter">Competência <input type="month" value={month} onChange={e => setMonth(e.target.value)}/></label></div>
    </div>
    <div className="stats-grid">
      <div className="stat-card card"><div className="stat-icon income"><ArrowDownLeft/></div><span>Entradas do mês</span><strong>{brl(incomes)}</strong></div>
      <div className="stat-card card"><div className="stat-icon expense"><ArrowUpRight/></div><span>Saídas do mês</span><strong>{brl(expenses)}</strong></div>
      <div className="stat-card card"><div className="stat-icon balance"><Wallet/></div><span>Saldo do mês</span><strong>{brl(incomes - expenses)}</strong></div>
    </div>
    <div className="finance-columns">
      <section className="card transaction-form"><h2><Plus size={19}/> Novo lançamento</h2><p className="muted tiny">Informe a entrada ou saída efetivamente realizada.</p><form onSubmit={saveTransaction}>
        <label>Tipo<select value={type} onChange={e => { setType(e.target.value); setCategoryId(''); }}><option value="income">Entrada</option><option value="expense">Saída</option></select></label>
        <label>Valor (R$)<input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Ex.: 150,00" required/></label>
        <label>Categoria<select value={selectedCategory?.id || ''} onChange={e => setCategoryId(e.target.value)} disabled={categoriesLoading || !available.length || !!categoriesError}>
          {categoriesLoading ? <option value="">Carregando categorias...</option> : available.length === 0 ? <option value="">Nenhuma categoria ativa</option> : available.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
        </select></label>
        {!categoriesLoading && available.length === 0 && <p className="muted tiny">Sem categorias disponíveis. <Link className="inline-link" to={categoryManagementUrl}>Crie uma categoria</Link> para continuar.</p>}
        <label>Data<input type="date" value={occurredOn} onChange={e => setOccurredOn(e.target.value)} required/></label>
        <label>Descrição (opcional)<input maxLength={250} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes do lançamento"/></label>
        {(error || categoriesError) && <div className="error-message" role="alert">{error || `Não foi possível carregar categorias: ${categoriesError}. Publique as novas regras do Firestore.`}</div>}
        <button className="button primary full" disabled={busy || categoriesLoading || !selectedCategory || !!categoriesError}>{busy ? 'Salvando...' : 'Registrar lançamento'}</button>
      </form></section>
      <section className="card transactions-list"><div className="list-head"><h2>Movimentações</h2><span className="muted tiny">{transactions.length} registros</span></div>
        {transactions.length === 0 ? <div className="transactions-empty"><Wallet size={32}/><strong>Nenhum lançamento neste mês</strong><p className="muted tiny">Comece registrando sua primeira movimentação.</p></div> : <div className="transaction-items">{transactions.map(t => <div className="transaction-item" key={t.id}><div className={`transaction-icon ${t.type === 'income' ? 'income' : 'expense'}`}>{t.type === 'income' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}</div><div className="transaction-meta"><strong>{visibleCategoryName(t, categories)}</strong><span>{t.description || 'Sem descrição'} · {t.occurredOn.split('-').reverse().join('/')}</span></div><strong className={t.type === 'income' ? 'green-text' : 'red-text'}>{t.type === 'income' ? '+' : '−'} {brl(t.amountCents)}</strong><button className="icon-button delete-btn" title="Excluir lançamento" aria-label={`Excluir ${visibleCategoryName(t, categories)}`} onClick={() => removeTransaction(t.id)}><Trash2 size={16}/></button></div>)}</div>}
      </section>
    </div>
  </>;
}
