import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDate, formatNumber, formatPrice } from '../../utils/format';
import { EnumPill, PriorityPill, StatusPill } from './StatusPill';

const get = (row, path) => path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), row);

function Cell({ column, row }) {
  if (column.render) return column.render(row);
  const value = get(row, column.field);

  switch (column.type) {
    case 'primary':
      return (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{value}</p>
          {column.subField && get(row, column.subField) && (
            <p className="truncate text-xs text-muted">
              {/phone/i.test(column.subField) ? <span dir="ltr">{get(row, column.subField)}</span> : get(row, column.subField)}
            </p>
          )}
        </div>
      );
    case 'muted':
      return <span className="text-muted">{value ?? '—'}</span>;
    case 'currency':
      return <span className="whitespace-nowrap tabular-nums">{formatPrice(value)}</span>;
    case 'number':
      return <span className="tabular-nums">{formatNumber(value)}</span>;
    case 'percent':
      return <span className="tabular-nums">{value}%</span>;
    case 'date':
      return <span className="whitespace-nowrap text-muted">{formatDate(value)}</span>;
    case 'enum':
      return <EnumPill prefix={column.prefix} value={value} />;
    case 'status':
      return <StatusPill value={value} />;
    case 'priority':
      return <PriorityPill value={value} />;
    default:
      return <span>{value ?? '—'}</span>;
  }
}

/**
 * Column-config table. Columns: `{ field, labelKey, type, subField, prefix, render }`.
 * `rowActions(row)` renders a trailing actions cell; `onRowClick(row)` makes rows navigable.
 */
export function DataTable({ columns, rows, rowActions, onRowClick, rowKey = '_id' }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            {columns.map((column) => (
              <th key={column.field || column.labelKey} className="whitespace-nowrap px-4 py-2.5 text-start font-medium">
                {t(column.labelKey)}
              </th>
            ))}
            {rowActions && <th className="px-4 py-2.5 text-end font-medium">{t('common.actions')}</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr
              key={row[rowKey] ?? index}
              className={cn('transition-colors hover:bg-canvas', onRowClick && 'cursor-pointer')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td
                  key={column.field || column.labelKey}
                  className={cn('px-4 py-2.5 align-middle', column.type === 'primary' && 'max-w-[16rem]')}
                >
                  <Cell column={column} row={row} />
                </td>
              ))}
              {rowActions && (
                <td className="px-4 py-2.5 text-end" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">{rowActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Small square icon button for table rows. */
export function IconAction({ icon: Icon, title, onClick, tone = 'default', disabled }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded p-1.5 text-muted transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'danger' ? 'hover:text-danger' : 'hover:text-primary'
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
