import { useMemo, useState } from 'react';
import { Phone, MessageCircle, Users, Eye, CalendarClock, StickyNote, Plus, Check, X } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EnumPill } from '../../components/ui/StatusPill';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/Spinner';
import { FormModal } from '../../components/common/FormModal';
import { useActivities, useCreateActivity, useUpdateActivity } from '../../hooks/activity.hooks';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ACTIVITY_OUTCOMES, ACTIVITY_TYPES } from '../../config/constants';
import { apiError, formatDateTime, toInputDate } from '../../utils/format';

export const ACTIVITY_ICONS = {
  CALL: Phone,
  WHATSAPP: MessageCircle,
  MEETING: Users,
  VIEWING: Eye,
  FOLLOW_UP: CalendarClock,
  NOTE: StickyNote,
};

/** Log a call / WhatsApp / meeting / viewing / follow-up for a lead. */
export function ActivityFormModal({ open, onClose, lead, units = [], initialType = 'FOLLOW_UP', initialProperty }) {
  const create = useCreateActivity();
  const toast = useToast();
  const { t } = useLanguage();

  const fields = useMemo(
    () => [
      { name: 'type', label: t('activity.type'), type: 'select', required: true, options: ACTIVITY_TYPES.map((v) => ({ value: v, label: t(`activityType.${v}`) })) },
      { name: 'scheduledAt', label: t('activity.when'), type: 'datetime', required: true },
      {
        name: 'property',
        label: t('activity.unit'),
        type: 'select',
        span: 2,
        hint: t('activity.unitHint'),
        options: units.map((u) => ({ value: u._id, label: `${u.title} — ${u.project || ''}` })),
      },
      { name: 'status', label: t('activity.status'), type: 'select', required: true, options: ['SCHEDULED', 'COMPLETED'].map((v) => ({ value: v, label: t(`activityStatus.${v}`) })) },
      { name: 'outcome', label: t('activity.outcome'), type: 'select', options: ACTIVITY_OUTCOMES.map((v) => ({ value: v, label: t(`outcome.${v}`) })) },
      { name: 'notes', label: t('activity.notes'), type: 'textarea', placeholder: t('activity.notesPlaceholder') },
    ],
    [t, units]
  );

  const onSubmit = (values) => {
    if (values.type === 'VIEWING' && !values.property) {
      toast.error(t('activity.viewingNeedsUnit'));
      return;
    }
    create.mutate(
      {
        lead: lead._id,
        type: values.type,
        property: values.property || undefined,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        status: values.status,
        outcome: values.outcome || undefined,
        notes: values.notes,
      },
      {
        onSuccess: () => {
          toast.success(t('activity.saved'));
          onClose();
        },
        onError: (err) => toast.error(apiError(err, t('activity.saveFailed'))),
      }
    );
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={t('activity.logTitle')}
      description={lead?.clientName}
      fields={fields}
      defaultValues={{
        type: initialType,
        scheduledAt: toInputDate(initialType === 'VIEWING' ? tomorrow : new Date(), true),
        property: initialProperty || '',
        status: 'SCHEDULED',
        outcome: '',
        notes: '',
      }}
      submitLabel={t('activity.save')}
      onSubmit={onSubmit}
      isPending={create.isPending}
    />
  );
}

export default function ActivityTimeline({ lead, onLog }) {
  const { data: activities = [], isLoading } = useActivities({ lead: lead._id });
  const update = useUpdateActivity();
  const toast = useToast();
  const { t } = useLanguage();
  const [completing, setCompleting] = useState(null);

  const setStatus = (activity, payload) =>
    update.mutate(
      { id: activity._id, payload },
      {
        onSuccess: () => {
          toast.success(t('activity.updated'));
          setCompleting(null);
        },
        onError: (err) => toast.error(apiError(err, t('activity.saveFailed'))),
      }
    );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">{t('activity.title')}</h3>
          <p className="text-xs text-muted">{t('activity.subtitle')}</p>
        </div>
        <Button size="sm" variant="outline" onClick={onLog}>
          <Plus className="size-4" /> {t('activity.log')}
        </Button>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <LoadingState />
        ) : !activities.length ? (
          <EmptyState title={t('activity.empty')} description={t('activity.emptyDesc')} />
        ) : (
          <ol className="space-y-3">
            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] || StickyNote;
              return (
                <li key={activity._id} className="flex gap-3 rounded border border-line px-3 py-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded bg-primary-soft text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-ink">{t(`activityType.${activity.type}`)}</p>
                      <EnumPill prefix="activityStatus" value={activity.status} />
                      {activity.outcome && <EnumPill prefix="outcome" value={activity.outcome} />}
                    </div>
                    <p className="text-xs text-muted">
                      {formatDateTime(activity.scheduledAt)}
                      {activity.property && ` · ${activity.property.title}`}
                      {activity.createdBy?.name && ` · ${activity.createdBy.name}`}
                    </p>
                    {activity.notes && <p className="text-sm text-ink">{activity.notes}</p>}
                  </div>
                  {activity.status === 'SCHEDULED' && (
                    <div className="flex shrink-0 items-start gap-1">
                      <Button size="sm" variant="outline" onClick={() => setCompleting(activity)}>
                        <Check className="size-4" /> {t('activity.markDone')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title={t('activity.cancel')}
                        onClick={() => setStatus(activity, { status: 'CANCELLED' })}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>

      <FormModal
        open={Boolean(completing)}
        onClose={() => setCompleting(null)}
        title={t('activity.completeTitle')}
        description={completing ? t(`activityType.${completing.type}`) : ''}
        fields={[
          { name: 'outcome', label: t('activity.outcome'), type: 'select', required: true, options: ACTIVITY_OUTCOMES.map((v) => ({ value: v, label: t(`outcome.${v}`) })) },
          { name: 'notes', label: t('activity.notes'), type: 'textarea' },
        ]}
        defaultValues={{ outcome: 'INTERESTED', notes: completing?.notes || '' }}
        submitLabel={t('activity.markDone')}
        onSubmit={(values) => setStatus(completing, { status: 'COMPLETED', ...values })}
        isPending={update.isPending}
      />
    </Card>
  );
}
