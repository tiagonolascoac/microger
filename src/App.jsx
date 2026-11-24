import { BrowserRouter, Navigate, Outlet, Route, Routes, useOutletContext } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { firebaseReady } from './firebase/client';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import WorkspaceLayout from './pages/WorkspaceLayout';
import OverviewPage from './pages/OverviewPage';
import FinancePage from './modules/finance/FinancePage';
import CategoriesPage from './modules/finance/CategoriesPage';
import AcademyPage from './modules/academy/AcademyPage';
import SettingsPage from './pages/SettingsPage';
import Loading from './components/Loading';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireModule({ moduleId, children }) {
  const { space, orgId, spaceId } = useOutletContext();
  return space.enabledModules.includes(moduleId)
    ? children
    : <Navigate to={`/org/${orgId}/spaces/${spaceId}`} replace />;
}

function SetupNeeded() {
  return <div className="center-screen setup-needed"><h1>Configuração inicial do Firebase</h1><p>Crie o arquivo <code>.env</code> a partir de <code>.env.example</code> e preencha os dados do seu projeto Firebase.</p><p>Leia o README.md para continuar.</p></div>;
}

export default function App() {
  if (!firebaseReady) return <SetupNeeded />;
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<AuthPage/>}/>
    <Route element={<Protected/>}>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/org/:orgId/spaces/:spaceId" element={<WorkspaceLayout/>}>
        <Route index element={<OverviewPage/>}/>
        <Route path="finance" element={<RequireModule moduleId="finance"><FinancePage/></RequireModule>}/>
        <Route path="finance/categories" element={<RequireModule moduleId="finance"><CategoriesPage/></RequireModule>}/>
        <Route path="academy" element={<RequireModule moduleId="academy"><AcademyPage/></RequireModule>}/>
        <Route path="settings" element={<SettingsPage/>}/>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></BrowserRouter></AuthProvider>;
}
