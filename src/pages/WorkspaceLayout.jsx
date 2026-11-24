import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Boxes, Dumbbell, Menu, Settings, Wallet, X, Users, FolderCog } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import Loading from '../components/Loading';
import { resolveLogo, workspaceRef } from '../lib/data';

export default function WorkspaceLayout() {
  const { orgId, spaceId } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    return onSnapshot(workspaceRef(orgId, spaceId), snap => {
      setSpace(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }, e => { setError(e.message); setLoading(false); });
  }, [orgId, spaceId]);

  useEffect(() => {
    let active = true;
    setLogoUrl(null);
    if (!space?.logoPath) return;
    resolveLogo(space.logoPath).then(url => { if (active) setLogoUrl(url); }).catch(() => {});
    return () => { active = false; };
  }, [space?.logoPath, space?.updatedAt?.seconds]);

  if (loading) return <Loading />;
  if (error || !space) return <div className="center-screen"><h2>Espaço indisponível</h2><p>{error || 'Este espaço não existe ou você não possui permissão.'}</p><Link className="button primary" to="/">Voltar ao início</Link></div>;

  const base = `/org/${orgId}/spaces/${spaceId}`;
  const items = [{ path: '', label: 'Visão geral', Icon: BarChart3 }];
  if (space.enabledModules.includes('finance')) {
    items.push({ path: 'finance', label: 'Financeiro', Icon: Wallet });
    items.push({ path: 'finance/categories', label: 'Categorias', Icon: FolderCog });
  }
  if (space.enabledModules.includes('academy')) items.push({ path: 'academy', label: 'Alunos e turmas', Icon: Users });
  items.push({ path: 'settings', label: 'Personalização', Icon: Settings });

  return (
    <div className="app-layout" style={{ '--brand': space.theme?.primary || '#155E52', '--brand-soft': space.theme?.accent || '#E9F5EF' }}>
      {menuOpen && <button className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}/>}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-top"><div className="wordmark"><Boxes size={22}/> Microger</div><button className="icon-button mobile-only" onClick={() => setMenuOpen(false)} aria-label="Fechar"><X/></button></div>
        <div className="sidebar-workspace"><BrandLogo url={logoUrl} name={space.name} size="large"/><div><strong>{space.name}</strong><span>{space.templateId === 'academy' ? 'Academia' : 'Financeiro'}</span></div></div>
        <div className="nav-label">MENU DO ESPAÇO</div>
        <nav className="sidebar-nav">{items.map(({path, label, Icon}) => <NavLink key={path} end={path === ''} onClick={() => setMenuOpen(false)} to={path ? `${base}/${path}` : base} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/>{label}</NavLink>)}</nav>
        <div className="sidebar-footer"><Link className="back-link" to="/"><ArrowLeft size={17}/> Todos os espaços</Link></div>
      </aside>
      <div className="main-column"><header className="workspace-header"><button className="icon-button mobile-only" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu/></button><span className="breadcrumb">Espaços <span>/</span> <strong>{space.name}</strong></span><div className="header-mark">{space.templateId === 'academy' ? <Dumbbell size={17}/> : <Wallet size={17}/>} {space.templateId === 'academy' ? 'Academia' : 'Financeiro'}</div></header><main className="workspace-content"><Outlet context={{ orgId, spaceId, space, logoUrl }}/></main></div>
    </div>
  );
}
