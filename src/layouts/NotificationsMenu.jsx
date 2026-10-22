import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, Bell, CalendarClock, Wrench } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/activity.hooks';
import { useDeals, useInstallments } from '../hooks/deal.hooks';
import { useServiceRequests } from '../hooks/serviceRequest.hooks';
import { useLanguage } from '../i18n/LanguageContext';
import { formatDateTime, formatPrice } from '../utils/format';

/** Live alerts for the signed-in user, built from the same data as the worklists. */
export default function NotificationsMenu() {
  const { isManager } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: activities = [] } = useActivities({ upcoming: true });
  const { data: approvals = [] } = useDeals(isManager ? { status: 'PENDING_APPROVAL' } : { status: '__none__' });
  const { data: overdue = [] } = useInstallments(isManager ? { status: 'OVERDUE' } : { status: '__none__' });
  const { data: requests = [] } = useServiceRequests(isManager ? { status: 'OPEN,ASSIGNED,IN_PROGRESS' } : { status: '__none__' });

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const items = [
    ...approvals.map((d) => ({
      key: `a-${d._id}`,
      icon: BadgeCheck,
      tone: 'text-warn',
      to: `/deals/${d._id}`,
      title: t('notifications.approval', { name: d.lead?.clientName }),
      body: `${d.property?.title} · ${formatPrice(d.quotation?.totalAmount)}`,
    })),
    ...requests
      .filter((r) => r.priority === 'URGENT' || r.priority === 'HIGH')
      .map((r) => ({
        key: `s-${r._id}`,
        icon: Wrench,
        tone: 'text-danger',
        to: '/maintenance',
        title: t('notifications.service', { ref: r.reference, priority: t(`servicePriority.${r.priority}`) }),
        body: `${r.property?.title} · ${r.description}`,
      })),
    ...overdue.map((r) => ({
      key: `o-${r.dealId}-${r.seq}`,
      icon: AlertTriangle,
      tone: 'text-danger',
      to: `/deals/${r.dealId}`,
      title: t('notifications.overdue', { name: r.client }),
      body: `${r.property?.title} · ${formatPrice(r.amount - r.paidAmount)}`,
    })),
    ...activities
      .filter((a) => new Date(a.scheduledAt) <= endOfToday)
      .map((a) => ({
        key: `c-${a._id}`,
        icon: CalendarClock,
        tone: 'text-primary',
        to: `/leads/${a.lead?._id}`,
        title: t('notifications.activity', { type: t(`activityType.${a.type}`), name: a.lead?.clientName }),
        body: formatDateTime(a.scheduledAt),
      })),
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded p-1.5 text-muted hover:bg-canvas hover:text-ink"
        title={t('topbar.notifications')}
        aria-label={t('topbar.notifications')}
      >
        <Bell className="size-5" />
        {items.length > 0 && (
          <span className="absolute -end-0.5 -top-0.5 min-w-4 rounded-sm bg-danger px-1 text-[10px] font-semibold leading-4 text-white tabular-nums">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-80 rounded border border-line bg-white shadow">
          <div className="border-b border-line px-3 py-2 text-sm font-semibold text-ink">{t('topbar.notifications')}</div>
          {!items.length ? (
            <p className="px-3 py-6 text-center text-sm text-muted">{t('notifications.empty')}</p>
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {items.map(({ key, icon: Icon, tone, to, title, body }) => (
                <li key={key}>
                  <Link to={to} onClick={() => setOpen(false)} className="flex gap-2.5 px-3 py-2.5 hover:bg-canvas">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-ink">{title}</p>
                      <p className="truncate text-xs text-muted">{body}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
