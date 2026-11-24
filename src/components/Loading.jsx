export default function Loading({ message = 'Carregando...' }) {
  return <div className="center-screen"><div className="spinner" /><p>{message}</p></div>;
}
