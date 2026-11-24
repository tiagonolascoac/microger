import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Building2, ChevronRight, Dumbbell, LogOut, Plus, Wallet, Boxes, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { db } from '../firebase/client';
import { createOrganization, createWorkspace } from '../lib/data';
import { TEMPLATES } from '../config/templates';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [orgId, setOrgId] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [orgName, setOrgName] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [templateId, setTemplateId] = useState('academy');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'organizations'), where('ownerId', '==', user.uid));
    return onSnapshot(q, snapshot => {
      setOrgs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingOrgs(false);
    }, e => { setError(e.message); setLoadingOrgs(false); });
  }, [user.uid]);

  useEffect(() => {
    if (orgs.length && !orgs.some(o => o.id === orgId)) setOrgId(orgs[0].id);
  }, [orgs, orgId]);

  useEffect(() => {
    setSpaces([]);
    if (!orgId) return;
    return onSnapshot(collection(db, 'organizations', orgId, 'workspaces'), snapshot => {
      setSpaces(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, e => setError(e.message));
  }, [orgId]);

  async function handleCreateOrg(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await createOrganization(user.uid, orgName);
      setOrgId(result.id); setOrgName('');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function handleCreateSpace(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await createWorkspace(orgId, templateId, spaceName, user.uid);
      navigate(`/org/${orgId}/spaces/${result.id}`);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="home-page">
      <header className="home-header"><div className="home-header-inner"><div className="wordmark"><Boxes size={23}/> Microger</div><div className="account-actions"><span>{user.email}</span><button className="icon-button" aria-label="Sair" title="Sair" onClick={logout}><LogOut size={20}/></button></div></div></header>
      <main className="home-content">
        <span className="eyebrow">ÁREA DE TRABALHO</span>
        <h1>Seus espaços de gestão</h1>
        <p className="muted">Organize diferentes negócios com seus próprios módulos, identidade visual e dados.</p>
        {error && <p className="error-message" role="alert">{error}</p>}
        {loadingOrgs ? <p className="muted">Carregando organizações...</p> : (
          <>
            <div className="section-head"><h2>Organizações</h2></div>
            <div className="org-list">
              {orgs.map(org => <button key={org.id} className={`org-chip ${orgId === org.id ? 'active' : ''}`} onClick={() => setOrgId(org.id)}><Building2 size={17}/>{org.name}</button>)}
            </div>
            <form className="inline-create card" onSubmit={handleCreateOrg}>
              <div><strong>Adicionar organização</strong><p className="muted tiny">Uma empresa ou proprietário de espaços.</p></div>
              <input aria-label="Nome da organização" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Nome da empresa" required maxLength={80}/>
              <button className="button outlined" disabled={busy}><Plus size={16}/> Criar</button>
            </form>
            {orgId && <>
              <div className="section-head spaced"><h2>Espaços desta organização</h2><span className="muted tiny">{spaces.length} espaço(s)</span></div>
              {spaces.length > 0 ? <div className="spaces-grid">{spaces.map(space => <Link className="space-card card" to={`/org/${orgId}/spaces/${space.id}`} key={space.id}>
                <div className={`space-icon ${space.templateId === 'financial' ? 'blue' : ''}`}>{space.templateId === 'academy' ? <Dumbbell/> : <Wallet/>}</div>
                <strong>{space.name}</strong><p className="muted tiny">{TEMPLATES[space.templateId]?.label || space.templateId}</p>
                <span className="space-open">Abrir espaço <ArrowRight size={15}/></span>
              </Link>)}</div> : <div className="empty-state">Ainda não há espaços nesta organização. Crie o primeiro abaixo.</div>}
              <div className="section-head spaced"><h2>Criar espaço</h2></div>
              <form className="create-space card" onSubmit={handleCreateSpace}>
                <p className="muted">Escolha o modelo. Você poderá adicionar sua logo e mudar as cores depois.</p>
                <div className="template-grid">
                  {Object.values(TEMPLATES).map(template => <button key={template.id} className={`template-choice ${templateId === template.id ? 'selected' : ''}`} type="button" onClick={() => setTemplateId(template.id)}>
                    <div className="template-icon">{template.id === 'academy' ? <Dumbbell/> : <Wallet/>}</div>
                    <strong>{template.label}</strong><span>{template.description}</span>
                  </button>)}
                </div>
                <div className="create-space-bottom"><label>Nome do espaço<input value={spaceName} onChange={e => setSpaceName(e.target.value)} placeholder="Ex.: Academia Performance" required maxLength={80}/></label><button className="button primary" disabled={busy}>Criar espaço <ChevronRight size={17}/></button></div>
              </form>
            </>}
          </>
        )}
      </main>
    </div>
  );
}
