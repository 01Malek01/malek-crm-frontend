import { useMemo, useState } from 'react';
import { CheckCircle2, Download, Eye, Pencil, Plus, Printer, Search, ToggleRight } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, IconAction } from '../../components/ui/DataTable';
import { Progress } from '../../components/ui/Progress';
import { StatGrid } from '../../components/ui/StatCard';
import { FormModal, SummaryRow } from '../../components/common/FormModal';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDate, formatNumber, formatPrice, toInputDate } from '../../utils/format';
import { exportCsv, printPage } from '../../utils/actions';
import { MODULE_DEMO } from './demoData';
import BarChart from './BarChart';
import MapPanel from './MapPanel';

const STATUS_OPTIONS = ['active', 'pending', 'approved', 'draft', 'available', 'reserved', 'occupied', 'expired', 'revenue', 'expense'];

function Highlights({ items }) {
  const { t } = useLanguage();
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-ink">{t('demo.highlights')}</h3>
      </CardHeader>
      <CardBody className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-ink">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {item.format === 'currency' ? formatPrice(item.value) : formatNumber(item.value)}
              </span>
            </div>
            <Progress value={item.value} max={max} />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/** Plain-text value of a cell, used for details, export and forms. */
const subLabel = (column, t) => (column.subLabelKey ? t(column.subLabelKey) : `${t(column.labelKey)} — ${t('demo.details')}`);

function displayValue(column, row, t) {
  const value = row[column.field];
  if (value === null || value === undefined || value === '') return '—';
  switch (column.type) {
    case 'currency':
      return formatPrice(value);
    case 'number':
      return formatNumber(value);
    case 'percent':
      return `${value}%`;
    case 'date':
      return formatDate(value);
    case 'status':
      return t(`demo.status.${value}`);
    case 'priority':
      return t(`demo.priority.${value}`);
    default:
      return value;
  }
}

/** Form fields derived from the table columns (primary columns also edit their sub-line). */
function buildFields(columns, statuses, t) {
  const fields = [];
  for (const column of columns) {
    const label = t(column.labelKey);
    if (['currency', 'number', 'percent'].includes(column.type)) {
      fields.push({ name: column.field, label, type: 'number', min: 0, required: column.type !== 'percent' });
    } else if (column.type === 'date') {
      fields.push({ name: column.field, label, type: 'date' });
    } else if (column.type === 'status') {
      fields.push({ name: column.field, label, type: 'select', required: true, options: statuses.map((s) => ({ value: s, label: t(`demo.status.${s}`) })) });
    } else {
      fields.push({ name: column.field, label, required: column.type === 'primary' });
      if (column.subField) fields.push({ name: column.subField, label: subLabel(column, t) });
    }
  }
  return fields;
}

export default function ModuleDemo({ module }) {
  const { t } = useLanguage();
  const toast = useToast();
  const data = MODULE_DEMO[module.key];
  const [rows, setRows] = useState(() => data.rows.map((row, i) => ({ ...row, _id: `${module.key}-${i}` })));
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null); // row or {} for new

  const statuses = useMemo(() => {
    const present = rows.map((row) => row.status).filter(Boolean);
    return Array.from(new Set([...present, ...STATUS_OPTIONS.filter((s) => present.includes(s))]));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (!q) return true;
      return Object.values(row).some((value) => String(value).toLowerCase().includes(q));
    });
  }, [rows, query, status]);

  const fields = useMemo(() => buildFields(data.columns, statuses.length ? statuses : STATUS_OPTIONS, t), [data.columns, statuses, t]);

  const save = (values) => {
    if (editing?._id) {
      setRows((current) => current.map((row) => (row._id === editing._id ? { ...row, ...values } : row)));
      toast.success(t('demo.saved'));
    } else {
      setRows((current) => [{ ...values, _id: `${module.key}-${Date.now()}` }, ...current]);
      toast.success(t('demo.added'));
    }
    setEditing(null);
  };

  const setRowStatus = (row, next, messageKey) => {
    setRows((current) => current.map((r) => (r._id === row._id ? { ...r, status: next } : r)));
    toast.success(t(messageKey));
  };

  const exportRows = () =>
    exportCsv(
      module.key,
      data.columns.flatMap((column) => [
        { label: t(column.labelKey), value: (row) => displayValue(column, row, t) },
        ...(column.subField ? [{ label: subLabel(column, t), value: (row) => row[column.subField] }] : []),
      ]),
      filtered
    );

  const rowActions = data.rowActions || ['view', 'edit'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(module.titleKey)}
        subtitle={t(`moduleSubtitle.${module.key}`)}
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="ghost" onClick={printPage}>
              <Printer className="size-4" /> {t('common.print')}
            </Button>
            <Button variant="outline" onClick={exportRows}>
              <Download className="size-4" /> {t('common.export')}
            </Button>
            {data.actions?.primary && (
              <Button onClick={() => setEditing({})}>
                <Plus className="size-4" /> {t(data.actions.primary)}
              </Button>
            )}
          </div>
        }
      />

      <StatGrid stats={data.stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">{t(data.tableTitleKey || 'demo.records')}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('demo.searchPlaceholder')}
                    className="h-9 w-44 rounded border border-line bg-white ps-8 pe-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none sm:w-52"
                  />
                </div>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-9 rounded border border-line bg-white px-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  <option value="all">{t('demo.allStatuses')}</option>
                  {statuses.map((value) => (
                    <option key={value} value={value}>
                      {t(`demo.status.${value}`)}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            {filtered.length ? (
              <DataTable
                columns={data.columns}
                rows={filtered}
                onRowClick={setViewing}
                rowActions={(row) => (
                  <>
                    {rowActions.includes('approve') && row.status === 'pending' && (
                      <IconAction icon={CheckCircle2} title={t('demo.row.approve')} onClick={() => setRowStatus(row, 'approved', 'demo.approvedMsg')} />
                    )}
                    {rowActions.includes('toggle') && (
                      <IconAction
                        icon={ToggleRight}
                        title={t('demo.row.toggle')}
                        onClick={() => setRowStatus(row, row.status === 'active' ? 'draft' : 'active', row.status === 'active' ? 'demo.disabledMsg' : 'demo.enabledMsg')}
                      />
                    )}
                    <IconAction icon={Eye} title={t('demo.row.view')} onClick={() => setViewing(row)} />
                    {rowActions.includes('edit') && <IconAction icon={Pencil} title={t('demo.row.edit')} onClick={() => setEditing(row)} />}
                  </>
                )}
              />
            ) : (
              <p className="px-4 py-10 text-center text-sm text-muted">{t('demo.noResults')}</p>
            )}
            <div className="border-t border-line px-4 py-2 text-xs text-muted">
              {t('demo.showing', { shown: filtered.length, total: rows.length })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {data.chart && <BarChart titleKey={data.chart.titleKey} data={data.chart.data} />}
          {data.map && <MapPanel titleKey={data.map.titleKey} markers={data.map.markers} />}
          <Highlights items={data.highlights} />
        </div>
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? String(viewing[data.columns[0].field] ?? '') : ''}>
        {viewing && (
          <div className="divide-y divide-line/70">
            {data.columns.map((column) => (
              <div key={column.field}>
                <SummaryRow label={t(column.labelKey)} value={displayValue(column, viewing, t)} />
                {column.subField && viewing[column.subField] && (
                  <SummaryRow label={subLabel(column, t)} value={viewing[column.subField]} />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {editing && (
        <FormModal
          open
          onClose={() => setEditing(null)}
          title={editing._id ? t('demo.editTitle') : t(data.actions?.primary || 'demo.addTitle')}
          fields={fields}
          defaultValues={Object.fromEntries(
            fields.map((f) => {
              const value = editing[f.name];
              if (f.type === 'date') return [f.name, value ? toInputDate(value) : toInputDate()];
              if (f.type === 'select') return [f.name, value || f.options[0]?.value || ''];
              return [f.name, value ?? ''];
            })
          )}
          submitLabel={editing._id ? t('common.saveChanges') : t('demo.add')}
          onSubmit={save}
        />
      )}
    </div>
  );
}
