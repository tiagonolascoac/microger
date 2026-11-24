import { CalendarDays, CreditCard, Dumbbell, Users } from 'lucide-react';

const features = [
  {icon: Users, title: 'Alunos', desc: 'Cadastro, contato, situação e vínculo com turmas.'},
  {icon: CalendarDays, title: 'Turmas', desc: 'Horários, dias da semana e limite de vagas.'},
  {icon: CreditCard, title: 'Planos e mensalidades', desc: 'Valores por plano, pagamentos e comprovantes.'},
  {icon: Dumbbell, title: 'Renovações', desc: 'Alertas de mensalidades que exigem atenção.'},
];
export default function AcademyPage() {
  return <><div className="page-head"><span className="eyebrow">MÓDULO ACADEMIA</span><h1>Academia</h1><p className="muted">Base preparada para receber as funcionalidades migradas do JP Studio Fit.</p></div><div className="info-strip warm">Esta etapa é uma estrutura inicial. As telas de cadastro e as automações de pagamento ainda não foram implementadas.</div><div className="module-grid">{features.map(({icon:Icon, title, desc}) => <div className="card feature-card" key={title}><div className="module-icon"><Icon/></div><h3>{title}</h3><p className="muted">{desc}</p><span className="coming-soon">Próxima fase</span></div>)}</div></>;
}
