import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ImagePlus, Palette, Save } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { updateWorkspace, uploadWorkspaceLogo } from '../lib/data';

const palettes = [
  {name: 'Floresta', primary:'#155E52', accent:'#E9F5EF'},
  {name: 'Azul', primary:'#3454B4', accent:'#EDF2FF'},
  {name: 'Violeta', primary:'#6743AC', accent:'#F2ECFF'},
  {name: 'Terracota', primary:'#A14D32', accent:'#FFF0E7'},
  {name: 'Grafite', primary:'#303846', accent:'#EDF0F4'},
];

export default function SettingsPage() {
  const {orgId, spaceId, space, logoUrl} = useOutletContext();
  const [name, setName] = useState(space.name);
  const [primary, setPrimary] = useState(space.theme.primary);
  const [accent, setAccent] = useState(space.theme.accent);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function save(event) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      if (!name.trim() || name.trim().length > 80) throw new Error('Informe um nome válido de até 80 caracteres.');
      await updateWorkspace(orgId, spaceId, {name: name.trim(), theme: {primary, accent}});
      if (file) await uploadWorkspaceLogo(orgId, spaceId, file);
      setFile(null); setSuccess('Personalização salva com sucesso.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return <><div className="page-head"><span className="eyebrow">CONFIGURAÇÕES</span><h1>Identidade do espaço</h1><p className="muted">As alterações são exclusivas deste espaço.</p></div><form className="settings-card card" onSubmit={save}>
    <h2><Palette size={20}/> Identidade visual</h2>
    <div className="logo-field"><BrandLogo url={logoUrl} name={space.name} size="large"/><div><strong>Logo da empresa</strong><p className="muted tiny">PNG, JPG ou WebP, com menos de 2 MB.</p><label className="upload-label"><ImagePlus size={16}/> {file ? file.name : 'Selecionar imagem'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] || null)}/></label></div></div>
    <label>Nome do espaço<input maxLength={80} required value={name} onChange={e => setName(e.target.value)}/></label>
    <div className="field-heading"><strong>Paleta de cores</strong><span className="muted tiny">Escolha uma combinação pronta</span></div>
    <div className="palette-options">{palettes.map(p => <button type="button" aria-pressed={primary === p.primary && accent === p.accent} key={p.name} onClick={() => {setPrimary(p.primary); setAccent(p.accent);}} className={`palette-choice ${primary === p.primary && accent === p.accent ? 'selected':''}`}><span className="palette-swatches"><i style={{background:p.primary}}/><i style={{background:p.accent}}/></span><span>{p.name}</span></button>)}</div>
    <div className="colors-row"><label>Cor principal<input type="color" value={primary} onChange={e => setPrimary(e.target.value)}/></label><label>Cor secundária<input type="color" value={accent} onChange={e => setAccent(e.target.value)}/></label></div>
    {error && <div className="error-message" role="alert">{error}</div>}{success && <div className="success-message" role="status">{success}</div>}
    <div><button className="button primary" disabled={busy}><Save size={17}/>{busy ? 'Salvando...' : 'Salvar alterações'}</button></div>
  </form></>;
}
