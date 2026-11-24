import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Boxes, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'register') await register(name, email, password);
      else await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'E-mail ou senha inválidos.' :
        err.code === 'auth/email-already-in-use' ? 'Este e-mail já possui cadastro.' :
        err.code === 'auth/weak-password' ? 'Utilize uma senha mais forte.' :
        err.message || 'Não foi possível autenticar.');
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-screen">
      <div className="auth-hero">
        <span className="eyebrow light"><Boxes size={17} /> GESTÃO MODULAR</span>
        <h1>Um sistema.<br /><em>Infinitas possibilidades.</em></h1>
        <p>Monte seu ambiente de gestão com as ferramentas certas para o seu negócio.</p>
        <div className="hero-features"><span>Academia</span><span>Financeiro</span><span>Mais modelos em breve</span></div>
      </div>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand"><Boxes /> Microger</div>
          <span className="eyebrow">BEM-VINDO</span>
          <h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2>
          <p className="muted">{mode === 'login' ? 'Acesse os seus espaços de trabalho.' : 'Comece criando sua primeira organização.'}</p>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && <label>Seu nome<input value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={80} placeholder="Nome completo" /></label>}
            <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="voce@empresa.com" /></label>
            <label>Senha<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Sua senha" /><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="button primary full" disabled={busy}>{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
          </form>
          <p className="switch-mode">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} <button type="button" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Cadastre-se' : 'Entrar'}</button></p>
        </div>
      </section>
    </main>
  );
}
