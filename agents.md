# Real Estate Platform (MERN) — Frontend Source of Truth

This file documents the frontend architecture. Treat it as the source of truth for component
structure, colors, state management, and UI identity. Keep it in sync with code changes.

## Tech Stack

- Vite + React 19 (JavaScript)
- Tailwind CSS v4 (CSS-first config via `@theme` in `src/index.css`)
- `react-hook-form` + `@hookform/resolvers/zod` + `zod` for form validation
- `@tanstack/react-query` for server state (queries + mutations)
- `axios` (thin singleton in `src/services/api.js`)
- `react-router-dom` for routing
- `lucide-react` for icons ONLY. NO emojis anywhere.
- Custom lightweight i18n (no react-i18next): English + Arabic with automatic RTL. Default language
  is Arabic (`DEFAULT_LANG = 'ar'`) — the client demo is Arabic-first; toggle to English still works.

## Project Structure (STRICT modularity)

```
frontend/src/
├── main.jsx                    # ReactDOM + QueryClient + Router bootstrap
├── App.jsx                     # live pages keyed by sidebar module + /leads/:id + /deals/:id + demo modules
├── index.css                   # Tailwind + design tokens (@theme) + RTL rules
├── config/
│   ├── constants.js            # roles, stages, unit types/statuses, deal/payment/activity/service enums,
│   │                           # discount limits (MAX_DISCOUNT_PCT), tax rates (RETT_RATE, VAT_RATE)
│   └── sidebar.js              # SIDEBAR_MODULES (key/titleKey/icon/href/category/roles/demo) + moduleByKey()
├── i18n/
│   ├── translations.js         # en + ar flat dotted keys; tr(lang, key, vars)
│   └── LanguageContext.jsx     # LanguageProvider, useLanguage() -> { lang, t, toggleLang, isRTL }
├── services/                   # api, auth, lead, property, deal, activity, serviceRequest, report, user (no JSX)
├── utils/actions.js            # exportCsv (Excel-safe UTF-8), printPage, printDocument (receipts), openWhatsApp, copyText
├── hooks/
│   ├── invalidate.js           # invalidateWorkflow(): refresh leads/properties/deals/installments/activities/service-requests/reports
│   ├── lead / property / deal / activity / serviceRequest / report / user .hooks.js
│   ├── useAuth.js
│   └── (no demo-only handlers — every button performs a real action)
├── context/
│   ├── AuthContext.jsx         # cookie-based session, in-memory user, login/logout, role helpers
│   └── ToastContext.jsx        # success / error / info toasts
├── components/
│   ├── ui/                     # Pure presentational primitives (no data fetching)
│   │   ├── Button, Card, Input (TextInput, Field), Select, Textarea, Progress, Spinner, EmptyState
│   │   ├── Modal.jsx           # sizes md / lg / xl, optional description
│   │   ├── Badge.jsx           # Badge (pipeline stage or any enum via prefix), RoleBadge
│   │   ├── StatusPill.jsx      # Pill (tone), EnumPill (translated enum + tone), StatusPill/PriorityPill (demo data)
│   │   ├── DataTable.jsx       # column config (primary/muted/currency/number/percent/date/enum/status/priority/render),
│   │   │                       # rowActions, onRowClick; IconAction button
│   │   ├── StatCard.jsx        # StatCard, KpiGrid (translated items), StatGrid (demo stats by i18n key)
│   │   ├── AnimatedNumber.jsx  # count-up numeric (ease-out, prefers-reduced-motion aware)
│   │   ├── Stepper.jsx         # process tracker (done / current / blocked / upcoming)
│   │   ├── FilterTabs.jsx      # segmented filter with counts
│   │   └── PageHeader.jsx      # title, subtitle, meta pills, actions, back link
│   └── common/
│       ├── FormModal.jsx       # config-driven RHF + zod form modal; SummaryRow
│       ├── AiScore.jsx, ErrorBanner.jsx, UserChip.jsx
├── features/
│   ├── auth/LoginForm.jsx
│   ├── leads/                  # LeadFormModal (create/edit), LeadTable, LeadMatches, LeadJourney,
│   │                           # ActivityTimeline (+ ActivityFormModal)
│   ├── deals/                  # dealMath (computeQuote, dealJourney), QuotationModal, DealActionModal (every step),
│   │                           # DealActionPanel (next step), DealDetails (parties/quotation/milestones/timeline),
│   │                           # DealsTable, InstallmentsTable
│   ├── service/ServiceRequestsTable.jsx
│   ├── reports/ReportWidgets.jsx   # WidgetCard, CollectionsTrend, PipelineFunnel, SourceBreakdown,
│   │                               # ProjectPerformance, RenewalsDue, CollectionsAging
│   ├── kanban/                 # KanbanBoard, PipelineColumn, LeadCard
│   ├── properties/             # PropertyCard, PropertyFormModal
│   └── modules/                # demoData, ModuleDemo, BarChart, MapPanel (sample-data modules, /demo only)
├── components/
│   └── CommandPalette.jsx      # ⌘K jump-to-module overlay
├── layouts/
│   ├── DashboardLayout.jsx     # app shell + ⌘K listener
│   ├── Sidebar.jsx             # categorized, RBAC-filtered nav (demo modules get a "Preview" badge)
│   ├── Topbar.jsx              # ⌘K search button, language, user, sign out
│   ├── NotificationsMenu.jsx   # live alerts: approvals, urgent service, overdue installments, today's activities
│   └── AuthLayout.jsx
├── routes/                     # ProtectedRoute, RoleRoute
└── pages/
    ├── LoginPage.jsx
    ├── DashboardPage.jsx       # KPIs + 14-step customer journey map + upcoming activities + approvals + overdue
    ├── LeadsPage.jsx           # stage groups, search, table
    ├── LeadDetailPage.jsx      # customer file: journey, next step, matches, activities, deals, requirement, readiness
    ├── PipelinePage.jsx        # Kanban (cards open the customer file)
    ├── DealsPage.jsx           # status groups (?status=), new quotation
    ├── DealDetailPage.jsx      # deal journey stepper, next-step panel, installments, service, audit trail
    ├── ApprovalsPage.jsx, ContractsPage.jsx, CollectionsPage.jsx, HandoverPage.jsx, MaintenancePage.jsx, PortfolioPage.jsx
    ├── PropertiesPage.jsx      # units inventory with filters; "Issue quotation" on available units
    ├── SettingsPage.jsx        # account, sales & tax policies, team (no credentials shown)
    ├── ModulePage.jsx          # live app: demo modules → empty state + "preview in demo" CTA (no sample data)
    └── demo/                   # public showcase (the only place sample data is rendered)
        ├── DemoLayout.jsx      # top bar + role switcher + RBAC-filtered nav
        ├── DemoHome.jsx        # hero + grid of every module
        └── DemoModulePage.jsx  # /demo/:key → ModuleDemo (demo) or sign-in panel (live)
```

Layering rule: `pages -> features -> hooks/services -> components/ui`. Components in `components/ui` and
`components/common` never fetch data. Features may use hooks. Pages compose features.

## Demo Scenario (live, end-to-end)

Lead → Customer Requirement → Unit Matching → Viewing/Follow-up → Quotation → Reservation → Approval → Contract →
Payment Plan → Collection → Handover/Occupancy → Service & Maintenance → Renewal/Upselling → Portfolio Performance.

- Customer file (`/leads/:id`): the next-step bar moves NEW → CONTACTED → MATCHING; matched units offer
  "Book viewing" and "Issue quotation". Issuing a quotation navigates to the deal file.
- Deal file (`/deals/:id`): `DealActionPanel` shows the next step for the deal status and the user's role; each
  button opens `DealActionModal`. The installments table has "Collect"; contracted deals list service requests.
- Manager worklists reuse the same modal: Approvals (approve/reject), Contracts (contract / payment plan / renew),
  Collections (collect), Handover (handover / payment plan / service), Maintenance (update), Portfolio (renewals).
- Presenter flow: sign in as `faisal@malek-crm.sa` for lead → reservation, then `noura@malek-crm.sa` for approval → portfolio.
  The seeded fresh lead is **خالد العتيبي**. See `VIDEO_SCRIPT.md` at the repo root.
- The UI must never show demo/sample wording. Brand is `common.appName` ("Malek-CRM", fictional).

## Design System — "Enterprise Flat Design"

### Color palette (Tailwind tokens via @theme)

| Token                  | Hex       | Usage                             |
| ---------------------- | --------- | --------------------------------- |
| `--color-canvas`       | `#F8FAFC` | Page background (Slate 50)        |
| `--color-ink`          | `#1E293B` | Primary text (Midnight Slate)     |
| `--color-muted`        | `#64748B` | Secondary text                    |
| `--color-line`         | `#E2E8F0` | Borders, dividers                 |
| `--color-primary`      | `#0F766E` | Brand teal/pine green             |
| `--color-primary-dark` | `#115E59` | Primary hover/pressed             |
| `--color-primary-soft` | `#CCFBF1` | Primary tint fills (badges, bars) |
| `--color-warn`         | `#B45309` | Terracotta/amber accents, alerts  |
| `--color-warn-soft`    | `#FEF3C7` | Warn tint fills                   |
| `--color-danger`       | `#B91C1C` | Destructive actions               |
| `--color-ok`           | `#047857` | Success states                    |

### Styling rules (enforced)

- NO gradients — solid fills only.
- NO glowing borders, NO stars, NO "AI sparkles", NO neon/purple.
- Corners: `rounded`/`rounded-md` at most (4px). Never rounded-lg/xl/full pills for containers.
- Shadows: `shadow-sm` or `shadow` on cards only. Never heavy shadows.
- Scoring is presented as a background utility: teal progress bar + numeric badge, muted text for reasons.

### State colors

- Kanban column tints: `NEW` slate-600, `CONTACTED` primary, `MATCHING` teal-600, `VIEWING` teal-800,
  `QUOTATION` warn, `RESERVED` primary-dark, `WON` ok, `LOST` danger.
- Every enum pill uses `EnumPill prefix="…" value="…"`: one tone per business state
  (ok / primary / dark / warn / danger / neutral / ink) defined in `StatusPill.jsx`, label from `${prefix}.${value}`.

### Formatting (`utils/format.js`)

- Money is **SAR**: `1,150,000 ر.س` (ar) / `SAR 1,150,000` (en); compact `2.6 مليون ر.س` / `SAR 2.6M`.
- Dates are Gregorian with Latin digits in Arabic (`ar-SA-u-ca-gregory-nu-latn`).
- `apiError(err, fallback)` extracts the backend message for toasts.

## State Management

- **Server state**: React Query. Query keys: `['leads', params|id]`, `['leads', id, 'matches']`,
  `['properties', params]`, `['deals', params|id]`, `['installments', params]`, `['activities', params]`,
  `['service-requests', params]`, `['reports', 'portfolio']`, `['users', params]`.
- **Mutations** call `invalidateWorkflow(queryClient)` because one scenario step changes leads, units, deals and
  reports together. Errors surface via toast.
- **Kanban drag & drop** uses native HTML5 DnD: the dragged lead id lives in a `ref` (NOT state) so the drag source
  is never re-rendered mid-drag. Drop-target highlight uses `dropTarget` state + an enter/leave depth counter.
  Dropping patches `PATCH /leads/:id/stage`.
- **Auth state**: sessions are **httpOnly cookies** (`crm_access` + `crm_refresh`); the client never reads or
  stores a token. `AuthContext` keeps only a sanitized public user (`id, name, email, phone, role`) in memory,
  bootstrapped from `GET /auth/me` on load. Exposes `user`, `isLoading`, `login()`, `logout()`, `isAdmin`,
  `isManager`, `hasRole()`. Stale `crm_token`/`crm_user` localStorage keys from older builds are cleared.
- **Passwords**: never stored, logged or displayed. The login form keeps the password masked by default (show/hide
  toggle) and clears it after a failed attempt.
- **UI state**: local `useState`/`useForm` for modals and forms. No global UI store.

## RBAC UI Rules

Backend roles: `ADMIN`, `SALES_MANAGER`, `AGENT`.

- Routes are guarded by `ProtectedRoute` + `RoleRoute roles=[module.roles]` (from `SIDEBAR_MODULES`).
- Manager-only actions render only when `isManager`: delete/assign lead, create/delete unit, approve/reject,
  contract, payment plan, record payment, handover, update service request, Settings & Team.
- Agents see the "awaiting management" state instead of approval/contract buttons.
- Unit status is never changed directly from the UI — it follows the deal workflow (reserve/contract/reject/cancel).

## Shell Layout & Sidebar Modules

`DashboardLayout` is the protected app shell: collapsible `Sidebar` + `Topbar` + `<Outlet/>`.

- `SIDEBAR_MODULES` order follows the customer journey, grouped by `SIDEBAR_CATEGORIES`:
  `overview`, `sales`, `assets`, `finance`, `operations`, `governance`. Empty groups are skipped per role.
- Names are the business Arabic used by Saudi developers / property managers:

| Key           | Arabic                  | English                   | Route        | Roles    | Type |
| ------------- | ----------------------- | ------------------------- | ------------ | -------- | ---- |
| execDashboard | لوحة المؤشرات التنفيذية | Executive Dashboard       | /            | ALL      | live |
| leads         | العملاء المحتملون       | Leads & Customers         | /leads       | ALL      | live |
| pipeline      | مسار المبيعات           | Sales Pipeline            | /pipeline    | ALL      | live |
| deals         | عروض الأسعار والحجوزات  | Quotations & Reservations | /deals       | ALL      | live |
| approvals     | طلبات الاعتماد          | Approvals                 | /approvals   | MANAGERS | live |
| brokers       | الوسطاء والمسوقون       | Brokers & Marketers       | /brokers     | MANAGERS | demo |
| properties    | مخزون الوحدات           | Units Inventory           | /properties  | ALL      | live |
| portfolio     | أداء المحفظة العقارية   | Portfolio Performance     | /portfolio   | MANAGERS | live |
| gis           | خريطة المشاريع          | Projects Map              | /gis         | ADMIN    | demo |
| contracts     | عقود البيع والإيجار     | Sale & Lease Contracts    | /contracts   | MANAGERS | live |
| collections   | الدفعات والتحصيل        | Installments & Collection | /collections | MANAGERS | live |
| financials    | التقارير المالية        | Financial Reports         | /financials  | MANAGERS | demo |
| procurement   | المشتريات والموردون     | Procurement & Vendors     | /procurement | ADMIN    | demo |
| handover      | التسليم والإشغال        | Handover & Occupancy      | /handover    | MANAGERS | live |
| maintenance   | الصيانة وخدمة العملاء   | Maintenance & Service     | /maintenance | MANAGERS | live |
| workflow      | أتمتة الإجراءات         | Workflow Automation       | /workflow    | MANAGERS | demo |
| documents     | الأرشيف الإلكتروني      | Documents Archive         | /documents   | MANAGERS | demo |
| portals       | بوابات العملاء والملاك  | Customer & Owner Portals  | /portals     | MANAGERS | demo |

- Demo modules (`demo: true`) **do NOT render sample data in the live app**. Their `ModulePage` shows an honest
  empty state ("available in the live workspace") with a "Preview in demo" CTA. The live app relies only on real
  endpoints and the database.
- All sample/demo data lives **only** under the public `/demo` showcase (`pages/demo/DemoLayout|DemoHome|DemoModulePage`):
  - `/demo` — hero + grid of every module; `/demo/:key` — `ModuleDemo` (from `features/modules/demoData.js`) for
    `demo` modules, or a "sign in" panel for live modules. A role switcher (Admin / Sales Manager / Agent) filters
    the nav to demonstrate RBAC. Nothing touches the database; no auth required.
- Settings & Team link renders at the sidebar footer only for managers.
- Responsive: fixed off-canvas drawer on mobile (`md:` static); closed translate direction is RTL-aware.

## UX polish

- **⌘K command palette** (`components/CommandPalette.jsx`, wired in `DashboardLayout` + `Topbar`): jump to any module
  (role-filtered), the demo, or Settings. Opened with `Ctrl/Cmd+K` or the topbar search button.
- **Animated counters** (`components/ui/AnimatedNumber.jsx`): numeric `KpiGrid`/`StatCard` values count up (ease-out,
  respects `prefers-reduced-motion`); strings render statically.
- **Collections aging** (`features/reports/ReportWidgets.jsx` `CollectionsAging`): outstanding installments bucketed
  0-30 / 31-60 / 61-90 / 90+ days, shown on the dashboard for managers.

## API Integration

- Base URL: `import.meta.env.VITE_API_URL` defaults to `http://localhost:5000/api/v1`.
- `services/api.js` sends cookies (`withCredentials: true`); no `Authorization` header. On `401` (except on auth
  paths) it refreshes once via `POST /auth/refresh`, replays the original request, and redirects to `/login` if
  refresh fails. Concurrent 401s share a single in-flight refresh.
- All hooks consume services; components never call axios directly.

## Forms & Validation (zod)

- Workflow forms use `components/common/FormModal.jsx`: pass `fields`
  (`text | number | date | datetime | select | textarea | checkboxes`, with `required`, `min`, `max`, `options`,
  `hint`, `span`) and it builds the zod schema with localized messages. `preview(values)` renders live content
  (quotation price breakdown, payment schedule, renewal rent).
- `LoginForm`: email + password required (own schema).
- Lead form: name, phone, source, purpose required; budgets/bedrooms ≥ 0; preferred types as checkboxes.
- Unit form: title, project, type, listingType, price, city, district required.
- Server errors surface as toasts.

## i18n (English + Arabic, RTL)

- `src/i18n/translations.js` holds both dictionaries as flat dotted keys. Never add English text directly to a
  component — add the key to BOTH `en` and `ar`.
- `useLanguage()` returns `{ lang, setLang, toggleLang, t, isRTL }`. `t('key', { var })` interpolates `{{var}}`.
- Language persists in `localStorage['crm_lang']` (`ar` default); the provider sets `lang`/`dir` on `<html>` and
  localizes `document.title`. `index.html` ships with `lang="ar" dir="rtl"`.
- Dynamic key families: `stage.*`, `stageHint.*`, `propertyType.*`, `listingType.*`, `propertyStatus.*`, `source.*`,
  `purpose.*`, `dealStatus.*`, `dealType.*`, `frequency.*`, `paymentMethod.*`, `installmentStatus.*`,
  `installmentLabel.*`, `activityType.*`, `activityStatus.*`, `outcome.*`, `serviceCategory.*`, `servicePriority.*`,
  `serviceStatus.*`, `taxType.*`, `matchReason.*`, `timeline.*`, `journey.*`, `journeyHint.*`, `scenario.*`,
  `scenarioHint.*`, `leadNext.*`, `dealPanel.*`, `dealAction.*`, `moduleSubtitle.*`, `quotation.term.*`, `quotation.period.*`.
- Arabic counts use explicit keys where grammar depends on the number (`quotation.term.6` = "6 أشهر",
  `quotation.period.14` = "14 يوماً").
- RTL: prefer logical utilities (`text-start`, `ms-*`, `me-*`, `start-*`, `end-*`, `border-e`, `ps-*`).
  Wrap phone numbers in `dir="ltr"` (DataTable does this automatically for `*Phone` sub-fields).
- Verify after editing dictionaries: run `npm run build` and check that every `t('...')` key exists in both maps.

## Seed identity / test users

- `admin@malek-crm.sa` (admin), `noura@malek-crm.sa` (sales manager), `faisal@malek-crm.sa`, `reem@malek-crm.sa`,
  `sultan@malek-crm.sa`, `mona@malek-crm.sa` (consultants) — password from the backend seed (`SEED_PASSWORD`,
  default `password123`). Never render credentials in the UI.
