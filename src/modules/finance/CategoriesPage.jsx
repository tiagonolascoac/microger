import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Check, FolderOpen, Pencil, Plus, RotateCcw, Archive, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { validateCategoryName } from './categoryHelpers';
import { createFinanceCategory, updateFinanceCategory, useFinanceCategories } from './financeCategories';

const TYPES = [
  { value: 'income', label: 'Entradas', hint: 'Receitas recebidas' },
  { value: 'expense', label: 'Saídas', hint: 'Despesas realizadas' },
];

export default function CategoriesPage() {
  const { orgId, spaceId } = useOutletContext();
  const { user } = useAuth();
  const { categories, loading, error: loadError } = useFinanceCategories(orgId, spaceId, user.uid);
  const [name, setName] = useState('');
  const [type, setType] = useState('income');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function create(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      const cleaned = validateCategoryName(categories, name, type);
      await createFinanceCategory(orgId, spaceId, user.uid, cleaned, type);
      setName('');
      setNotice(`Categoria “${cleaned}” criada.`);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  function startEdit(category) {
    setEditingId(category.id); setEditingName(category.name);
    setError(''); setNotice('');
  }

  async function rename(event, category) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      const cleaned = validateCategoryName(categories, editingName, category.type, category.id);
      await updateFinanceCategory(orgId, spaceId, category.id, { name: cleaned });
      setEditingId(null);
      setNotice('Categoria atualizada. Lançamentos vinculados também exibem o novo nome.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function toggleActive(category) {
    if (category.active && !window.confirm(`Arquivar “${category.name}”? Ela deixará de aparecer nos novos lançamentos. Os registros existentes serão preservados.`)) return;
    setError(''); setNotice(''); setBusy(true);
    try {
      await updateFinanceCategory(orgId, spaceId, category.id, { active: !category.active });
      setNotice(category.active ? 'Categoria arquivada sem excluir movimentações.' : 'Categoria reativada.');
      if (editingId === category.id) setEditingId(null);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return <>
    <div className="page-head category-page-head">
      <div><span className="eyebrow">MÓDULO FINANCEIRO</span><h1>Gerenciar categorias</h1><p className="muted">Organize as receitas e despesas apenas deste espaço.</p></div>
      <Link className="button outlined" to={`/org/${orgId}/spaces/${spaceId}/finance`}><ArrowLeft size={17}/> Voltar ao financeiro</Link>
    </div>
    <div className="category-layout">
      <section className="card category-create">
        <h2><Plus size={19}/> Nova categoria</h2>
        <p className="muted tiny">Crie categorias personalizadas para registrar suas movimentações.</p>
        <form onSubmit={create}>
          <label>Nome da categoria<input maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Material de escritório" required disabled={loading || busy || !!loadError}/></label>
          <label>Tipo<select value={type} onChange={e => setType(e.target.value)} disabled={loading || busy || !!loadError}><option value="income">Entrada</option><option value="expense">Saída</option></select></label>
          <button className="button primary full" disabled={loading || busy || !!loadError}><Plus size={17}/>{busy ? 'Salvando...' : 'Criar categoria'}</button>
        </form>
        <div className="category-hint"><FolderOpen size={18}/><span>Uma categoria é vinculada a entradas <strong>ou</strong> saídas. Você pode usar o mesmo nome nos dois tipos.</span></div>
      </section>
      <section className="category-main">
        <div className="category-list-toolbar"><div><h2>Categorias do espaço</h2><p className="muted tiny">{categories.filter(c => c.active).length} ativas · {categories.filter(c => !c.active).length} arquivadas</p></div><label className="category-checkbox"><input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)}/> Mostrar arquivadas</label></div>
        {loadError && <div className="error-message" role="alert">Erro ao carregar categorias: {loadError}. Verifique se as regras do Firestore foram publicadas.</div>}
        {error && <div className="error-message" role="alert">{error}</div>}
        {notice && <div className="success-message" role="status">{notice}</div>}
        {loading ? <div className="card category-loading">Carregando categorias...</div> : TYPES.map(group => {
          const items = categories.filter(c => c.type === group.value && (showArchived || c.active));
          return <div key={group.value} className="card category-group">
            <div className="category-group-head"><span className={`category-type-icon ${group.value}`}>{group.value === 'income' ? '+' : '−'}</span><div><h3>{group.label}</h3><span className="muted tiny">{group.hint}</span></div><span className="category-count">{items.length}</span></div>
            {items.length === 0 ? <p className="muted tiny category-none">Nenhuma categoria {showArchived ? 'cadastrada' : 'ativa'} deste tipo.</p> : items.map(category => <div className={`category-row ${category.active ? '' : 'archived'}`} key={category.id}>
              {editingId === category.id ? <form className="category-edit-form" onSubmit={event => rename(event, category)}>
                <input autoFocus aria-label="Editar nome da categoria" required maxLength={60} value={editingName} onChange={e => setEditingName(e.target.value)} disabled={busy}/>
                <button className="icon-button" title="Salvar nome" aria-label="Salvar nome" disabled={busy}><Check size={18}/></button>
                <button type="button" className="icon-button" title="Cancelar" aria-label="Cancelar edição" onClick={() => setEditingId(null)} disabled={busy}><X size={18}/></button>
              </form> : <><div className="category-row-label"><strong>{category.name}</strong>{!category.active && <span className="category-status">Arquivada</span>}</div>
                <div className="category-actions"><button type="button" className="icon-button" aria-label={`Renomear ${category.name}`} title="Renomear categoria" onClick={() => startEdit(category)} disabled={busy}><Pencil size={17}/></button>
                  <button type="button" className="icon-button" aria-label={`${category.active ? 'Arquivar' : 'Reativar'} ${category.name}`} title={category.active ? 'Arquivar categoria' : 'Reativar categoria'} onClick={() => toggleActive(category)} disabled={busy}>{category.active ? <Archive size={17}/> : <RotateCcw size={17}/>}</button></div></>}
            </div>)}
          </div>;
        })}
        <p className="muted tiny category-footnote">Arquivar uma categoria impede novos lançamentos nela, mas não apaga o histórico. Movimentações antigas sem vínculo por ID mantêm o nome original.</p>
      </section>
    </div>
  </>;
}
