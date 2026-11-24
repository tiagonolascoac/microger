import { Link, useOutletContext } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Dumbbell, Wallet, WandSparkles } from 'lucide-react';
import { TEMPLATES } from '../config/templates';

export default function OverviewPage() {
  const { space, orgId, spaceId } = useOutletContext();
  const base = `/org/${orgId}/spaces/${spaceId}`;
  return <>
    <div className="page-head"><span className="eyebrow">PAINEL DO ESPAÇO</span><h1>Olá! 👋</h1><p className="muted">Bem-vindo ao espaço <strong>{space.name}</strong>. Tudo começa por aqui.</p></div>
    <div className="welcome-banner"><div><span className="banner-tag">MODELO {TEMPLATES[space.templateId]?.label.toUpperCase()}</span><h2>Seu ambiente está pronto.</h2><p>Você já pode lançar entradas e saídas. Configure também a identidade visual deste espaço.</p><Link to={`${base}/settings`} className="button white">Personalizar espaço <ArrowUpRight size={17}/></Link></div><WandSparkles size={104} strokeWidth={1} className="banner-graphic"/></div>
    <h2 className="section-title">Seus módulos</h2>
    <div className="module-grid">
      {space.enabledModules.includes('finance') && <Link className="module-card card" to={`${base}/finance`}><div className="module-icon"><Wallet /></div><h3>Gestão financeira</h3><p>Registre lançamentos, acompanhe entradas, saídas e saldo do mês.</p><span>Acessar módulo <ArrowUpRight size={16}/></span></Link>}
      {space.enabledModules.includes('academy') && <Link className="module-card card" to={`${base}/academy`}><div className="module-icon"><Dumbbell /></div><h3>Gestão de academia</h3><p>Estrutura reservada para alunos, turmas, planos e renovações do JP Studio Fit.</p><span>Ver estrutura <ArrowUpRight size={16}/></span></Link>}
    </div>
    <div className="info-strip"><CheckCircle2 size={19}/><span>Seus dados financeiros estão isolados dos demais espaços da plataforma.</span></div>
  </>;
}
