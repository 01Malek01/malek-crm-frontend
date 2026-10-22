import { Routes, Route } from 'react-router-dom';
import { useLanguage } from './i18n/LanguageContext';
import { SIDEBAR_MODULES, moduleByKey } from './config/sidebar';
import { MANAGER_ROLES } from './config/constants';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PipelinePage from './pages/PipelinePage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import DealsPage from './pages/DealsPage';
import DealDetailPage from './pages/DealDetailPage';
import ApprovalsPage from './pages/ApprovalsPage';
import PropertiesPage from './pages/PropertiesPage';
import PortfolioPage from './pages/PortfolioPage';
import ContractsPage from './pages/ContractsPage';
import CollectionsPage from './pages/CollectionsPage';
import HandoverPage from './pages/HandoverPage';
import MaintenancePage from './pages/MaintenancePage';
import SettingsPage from './pages/SettingsPage';
import ModulePage from './pages/ModulePage';
import DemoLayout from './pages/demo/DemoLayout';
import DemoHome from './pages/demo/DemoHome';
import DemoModulePage from './pages/demo/DemoModulePage';

// Live pages of the demo scenario, keyed by sidebar module.
const LIVE_PAGES = {
  leads: LeadsPage,
  pipeline: PipelinePage,
  deals: DealsPage,
  approvals: ApprovalsPage,
  properties: PropertiesPage,
  portfolio: PortfolioPage,
  contracts: ContractsPage,
  collections: CollectionsPage,
  handover: HandoverPage,
  maintenance: MaintenancePage,
};

const demoModules = SIDEBAR_MODULES.filter((module) => module.demo);

function NotFound() {
  const { t } = useLanguage();
  return <div className="flex h-screen items-center justify-center text-muted">{t('common.notFound')}</div>;
}

const guarded = (key, element) => <RoleRoute roles={moduleByKey(key).roles}>{element}</RoleRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/demo" element={<DemoLayout />}>
        <Route index element={<DemoHome />} />
        <Route path=":key" element={<DemoModulePage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        {Object.entries(LIVE_PAGES).map(([key, Page]) => (
          <Route key={key} path={moduleByKey(key).href.slice(1)} element={guarded(key, <Page />)} />
        ))}
        <Route path="leads/:id" element={guarded('leads', <LeadDetailPage />)} />
        <Route path="deals/:id" element={guarded('deals', <DealDetailPage />)} />
        {demoModules.map((module) => (
          <Route
            key={module.key}
            path={module.href.slice(1)}
            element={
              <RoleRoute roles={module.roles}>
                <ModulePage module={module} />
              </RoleRoute>
            }
          />
        ))}
        <Route
          path="settings"
          element={
            <RoleRoute roles={MANAGER_ROLES}>
              <SettingsPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
