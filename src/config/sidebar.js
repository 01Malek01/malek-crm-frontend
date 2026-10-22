import {
  LayoutDashboard,
  UserPlus,
  Columns3,
  FileSignature,
  BadgeCheck,
  Handshake,
  Building2,
  Map,
  PieChart,
  ScrollText,
  Banknote,
  Landmark,
  Package,
  KeyRound,
  Wrench,
  Workflow,
  FolderArchive,
  Globe,
} from 'lucide-react';
import { ROLES } from './constants';

const ALL = [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.AGENT];
const MANAGERS = [ROLES.ADMIN, ROLES.SALES_MANAGER];
const ADMINS = [ROLES.ADMIN];

export const SIDEBAR_CATEGORIES = [
  { key: 'overview', labelKey: 'category.overview' },
  { key: 'sales', labelKey: 'category.sales' },
  { key: 'assets', labelKey: 'category.assets' },
  { key: 'finance', labelKey: 'category.finance' },
  { key: 'operations', labelKey: 'category.operations' },
  { key: 'governance', labelKey: 'category.governance' },
];

/**
 * Order follows the customer journey: lead -> deal -> contract -> collection -> handover -> service.
 * `demo: true` modules render the shared ModulePage with sample data; the rest are live pages.
 */
export const SIDEBAR_MODULES = [
  { key: 'execDashboard', titleKey: 'nav.execDashboard', icon: LayoutDashboard, href: '/', category: 'overview', roles: ALL },

  { key: 'leads', titleKey: 'nav.leads', icon: UserPlus, href: '/leads', category: 'sales', roles: ALL },
  { key: 'pipeline', titleKey: 'nav.pipeline', icon: Columns3, href: '/pipeline', category: 'sales', roles: ALL },
  { key: 'deals', titleKey: 'nav.deals', icon: FileSignature, href: '/deals', category: 'sales', roles: ALL },
  { key: 'approvals', titleKey: 'nav.approvals', icon: BadgeCheck, href: '/approvals', category: 'sales', roles: MANAGERS },
  { key: 'brokers', titleKey: 'nav.brokers', icon: Handshake, href: '/brokers', category: 'sales', roles: MANAGERS, demo: true },

  { key: 'properties', titleKey: 'nav.properties', icon: Building2, href: '/properties', category: 'assets', roles: ALL },
  { key: 'portfolio', titleKey: 'nav.portfolio', icon: PieChart, href: '/portfolio', category: 'assets', roles: MANAGERS },
  { key: 'gis', titleKey: 'nav.gis', icon: Map, href: '/gis', category: 'assets', roles: ADMINS, demo: true },

  { key: 'contracts', titleKey: 'nav.contracts', icon: ScrollText, href: '/contracts', category: 'finance', roles: MANAGERS },
  { key: 'collections', titleKey: 'nav.collections', icon: Banknote, href: '/collections', category: 'finance', roles: MANAGERS },
  { key: 'financials', titleKey: 'nav.financials', icon: Landmark, href: '/financials', category: 'finance', roles: MANAGERS, demo: true },
  { key: 'procurement', titleKey: 'nav.procurement', icon: Package, href: '/procurement', category: 'finance', roles: ADMINS, demo: true },

  { key: 'handover', titleKey: 'nav.handover', icon: KeyRound, href: '/handover', category: 'operations', roles: MANAGERS },
  { key: 'maintenance', titleKey: 'nav.maintenance', icon: Wrench, href: '/maintenance', category: 'operations', roles: MANAGERS },

  { key: 'workflow', titleKey: 'nav.workflow', icon: Workflow, href: '/workflow', category: 'governance', roles: MANAGERS, demo: true },
  { key: 'documents', titleKey: 'nav.documents', icon: FolderArchive, href: '/documents', category: 'governance', roles: MANAGERS, demo: true },
  { key: 'portals', titleKey: 'nav.portals', icon: Globe, href: '/portals', category: 'governance', roles: MANAGERS, demo: true },
];

export const moduleByKey = (key) => SIDEBAR_MODULES.find((m) => m.key === key);
