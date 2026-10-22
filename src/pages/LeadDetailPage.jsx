import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, CalendarPlus, CheckCircle2, Eye, FileText, FileUp, ListChecks, Mail, MessageCircle, Pencil, Phone, TrendingUp, UserX } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EnumPill } from '../components/ui/StatusPill';
import { Select } from '../components/ui/Select';
import { LoadingState } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import LeadPotential from '../components/common/LeadPotential';
import { SummaryRow, FormModal } from '../components/common/FormModal';
import { useAssignLead, useLead, useLeadMatches, useUpdateLeadStage } from '../hooks/lead.hooks';
import { useDeals } from '../hooks/deal.hooks';
import { useProperties } from '../hooks/property.hooks';
import { useUsers } from '../hooks/user.hooks';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { apiError, formatDate, formatPrice } from '../utils/format';
import LeadJourney from '../features/leads/LeadJourney';
import LeadMatches from '../features/leads/LeadMatches';
import LeadFormModal from '../features/leads/LeadFormModal';
import ConversationModal from '../features/leads/ConversationModal';
import ActivityTimeline, { ActivityFormModal } from '../features/leads/ActivityTimeline';
import { budgetText, whatsappLink } from '../features/leads/LeadTable';
import QuotationModal from '../features/deals/QuotationModal';

function RequirementCard({ lead, onEdit }) {
  const { t } = useLanguage();
  const r = lead.requirements || {};
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{t('leadFile.requirement')}</h3>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="size-4" /> {t('common.edit')}
        </Button>
      </CardHeader>
      <CardBody className="divide-y divide-line/70">
        <SummaryRow label={t('leadForm.purpose')} value={<EnumPill prefix="purpose" value={r.purpose} />} />
        <SummaryRow label={t('leadFile.budget')} value={budgetText(r)} />
        <SummaryRow label={t('leadForm.preferredTypes')} value={r.preferredTypes?.length ? r.preferredTypes.map((v) => t(`propertyType.${v}`)).join('، ') : '—'} />
        <SummaryRow label={t('leadForm.bedrooms')} value={r.bedrooms || '—'} />
        <SummaryRow label={t('leadFile.location')} value={[r.district, r.city].filter(Boolean).join('، ') || '—'} />
        {r.notes && <p className="py-2 text-sm text-ink">{r.notes}</p>}
      </CardBody>
    </Card>
  );
}

function ReadinessCard({ lead }) {
  const { t } = useLanguage();
  const r = lead.requirements || {};
  const factors = [
    { key: 'contact', ok: Boolean(lead.clientPhone && lead.clientEmail) },
    { key: 'budget', ok: Boolean(r.budgetMin || r.budgetMax) },
    { key: 'types', ok: Boolean(r.preferredTypes?.length) },
    { key: 'location', ok: Boolean(r.city || r.district) },
    { key: 'engagement', ok: !['NEW', 'LOST'].includes(lead.pipelineStage) },
  ];
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-ink">{t('leadFile.readiness')}</h3>
        <p className="text-xs text-muted">{t('leadFile.readinessHint')}</p>
      </CardHeader>
      <CardBody className="space-y-3">
        <LeadPotential lead={lead} />
        <ul className="space-y-1 text-sm">
          {factors.map((f) => (
            <li key={f.key} className="flex items-center justify-between">
              <span className="text-muted">{t(`leadFile.factor.${f.key}`)}</span>
              <span className={f.ok ? 'text-ok' : 'text-warn'}>{f.ok ? t('leadFile.captured') : t('leadFile.missing')}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

function LeadDeals({ deals, onQuote, canQuote }) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">{t('leadFile.deals')}</h3>
          <p className="text-xs text-muted">{t('leadFile.dealsHint')}</p>
        </div>
        {canQuote && (
          <Button size="sm" onClick={onQuote}>
            <FileText className="size-4" /> {t('matches.quote')}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {!deals.length ? (
          <EmptyState title={t('leadFile.noDeals')} />
        ) : (
          <ul className="divide-y divide-line">
            {deals.map((deal) => (
              <li key={deal._id}>
                <Link to={`/deals/${deal._id}`} className="flex flex-wrap items-center justify-between gap-2 py-2 hover:bg-canvas">
                  <div className="min-w-0 text-sm">
                    <p className="font-medium text-ink">{deal.property?.title}</p>
                    <p className="text-xs text-muted">
                      {deal.reference} · {formatDate(deal.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums text-ink">{formatPrice(deal.quotation?.totalAmount)}</span>
                    <EnumPill prefix="dealStatus" value={deal.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/** Guides the user to the next scenario step for this customer. */
function LeadNextStep({ lead, deals, onAdvance, onEdit, onViewing, onQuote, isPending }) {
  const { t } = useLanguage();
  const openDeal = deals.find((d) => !['REJECTED', 'CANCELLED'].includes(d.status));
  const stage = lead.pipelineStage;

  const actions = {
    NEW: [
      { key: 'confirm', icon: CheckCircle2, onClick: () => onAdvance('CONTACTED') },
      { key: 'editRequirement', icon: Pencil, onClick: onEdit, variant: 'outline' },
    ],
    CONTACTED: [{ key: 'shortlist', icon: ListChecks, onClick: () => onAdvance('MATCHING') }],
    MATCHING: [{ key: 'viewing', icon: Eye, onClick: onViewing }],
    VIEWING: [{ key: 'quote', icon: FileText, onClick: onQuote }],
    QUOTATION: openDeal ? [{ key: 'openDeal', icon: ArrowUpRight, to: `/deals/${openDeal._id}` }] : [{ key: 'quote', icon: FileText, onClick: onQuote }],
    RESERVED: openDeal ? [{ key: 'openDeal', icon: ArrowUpRight, to: `/deals/${openDeal._id}` }] : [],
    WON: openDeal ? [{ key: 'openDeal', icon: TrendingUp, to: `/deals/${openDeal._id}` }] : [],
    LOST: [{ key: 'reopen', icon: CheckCircle2, onClick: () => onAdvance('CONTACTED'), variant: 'outline' }],
  }[stage] || [];

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded border border-primary/30 bg-primary-soft/40 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-muted">{t('dealPanel.nextStep')}</p>
        <p className="text-sm text-ink">{t(`leadNext.${stage}`)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map(({ key, icon: Icon, onClick, to, variant }) =>
          to ? (
            <Link key={key} to={to} className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark">
              <Icon className="size-4" /> {t(`leadNext.btn.${key}`)}
            </Link>
          ) : (
            <Button key={key} variant={variant || 'primary'} onClick={onClick} disabled={isPending}>
              <Icon className="size-4" /> {t(`leadNext.btn.${key}`)}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const toast = useToast();
  const { isManager } = useAuth();
  const { data: lead, isLoading, isError } = useLead(id);
  const matchQuery = useLeadMatches(id, Boolean(lead));
  const { data: deals = [] } = useDeals({ lead: id });
  const { data: available = [] } = useProperties({ status: 'AVAILABLE' });
  const { data: users = [] } = useUsers(undefined, isManager);
  const assign = useAssignLead();
  const stage = useUpdateLeadStage();

  const [editOpen, setEditOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [activity, setActivity] = useState(null); // { type, property }
  const [quote, setQuote] = useState(null); // { property }

  if (isLoading) return <LoadingState />;
  if (isError || !lead) return <EmptyState title={t('leadFile.notFound')} />;

  const closed = ['WON', 'LOST'].includes(lead.pipelineStage);
  const canQuote = lead.pipelineStage !== 'LOST';
  const matchedUnits = (matchQuery.data?.matches || []).map((m) => m.property);
  const activityUnits = [...matchedUnits, ...available.filter((u) => !matchedUnits.some((m) => m._id === u._id))];

  const onAssign = (e) =>
    assign.mutate(
      { id: lead._id, assignedTo: e.target.value || null },
      { onSuccess: () => toast.success(t('leadFile.assigned')), onError: (err) => toast.error(apiError(err, t('leads.updateFailed'))) }
    );

  return (
    <div className="space-y-4">
      <PageHeader
        backTo="/leads"
        backLabel={t('leads.title')}
        title={lead.clientName}
        meta={
          <>
            <Badge value={lead.pipelineStage} />
            <EnumPill prefix="source" value={lead.source} tone="neutral" />
          </>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1"><Phone className="size-3.5" /> <span dir="ltr">{lead.clientPhone}</span></span>
            {lead.clientEmail && <span className="flex items-center gap-1"><Mail className="size-3.5" /> {lead.clientEmail}</span>}
            <span>{t('leadFile.createdOn', { date: formatDate(lead.createdAt) })}</span>
            {lead.parentDeal && (
              <Link to={`/deals/${lead.parentDeal._id}`} className="text-primary hover:underline">
                {t('leadFile.upsellFrom', { ref: lead.parentDeal.reference })}
              </Link>
            )}
          </span>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => window.open(whatsappLink(lead.clientPhone), '_blank', 'noopener')}>
              <MessageCircle className="size-4" /> {t('leads.whatsapp')}
            </Button>
            <Button variant="outline" onClick={() => setConversationOpen(true)}>
              <FileUp className="size-4" /> {t('conversation.import')}
            </Button>
            <Button variant="outline" onClick={() => setActivity({ type: 'FOLLOW_UP' })}>
              <CalendarPlus className="size-4" /> {t('activity.log')}
            </Button>
            {!closed && (
              <Button variant="ghost" className="text-danger" onClick={() => setLostOpen(true)}>
                <UserX className="size-4" /> {t('leadFile.markLost')}
              </Button>
            )}
          </>
        }
      />

      <Card>
        <CardBody>
          <LeadJourney stage={lead.pipelineStage} />
          <LeadNextStep
            lead={lead}
            deals={deals}
            isPending={stage.isPending}
            onEdit={() => setEditOpen(true)}
            onViewing={() => setActivity({ type: 'VIEWING', property: matchedUnits[0]?._id })}
            onQuote={() => setQuote({ property: matchedUnits[0] })}
            onAdvance={(next) =>
              stage.mutate(
                { id: lead._id, stage: next },
                {
                  onSuccess: () => toast.success(t('leads.moveTo', { stage: t(`stage.${next}`) })),
                  onError: (err) => toast.error(apiError(err, t('leads.moveFailed'))),
                }
              )
            }
          />
          {lead.pipelineStage === 'LOST' && lead.lostReason && (
            <p className="mt-2 text-sm text-danger">{t('leadFile.lostReason', { reason: lead.lostReason })}</p>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <LeadMatches
            matchQuery={matchQuery}
            canQuote={canQuote}
            onViewing={(property) => setActivity({ type: 'VIEWING', property: property._id })}
            onQuote={(property) => setQuote({ property })}
          />
          <ActivityTimeline lead={lead} onLog={() => setActivity({ type: 'FOLLOW_UP' })} />
          <LeadDeals deals={deals} canQuote={canQuote} onQuote={() => setQuote({})} />
        </div>

        <div className="space-y-4">
          <RequirementCard lead={lead} onEdit={() => setEditOpen(true)} />
          <ReadinessCard lead={lead} />
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{t('leadFile.owner')}</h3>
            </CardHeader>
            <CardBody>
              {isManager ? (
                <Select value={lead.assignedTo?._id || ''} onChange={onAssign} disabled={assign.isPending}>
                  <option value="">{t('common.unassigned')}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {t(`role.${u.role}`)}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-ink">{lead.assignedTo?.name || t('common.unassigned')}</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <LeadFormModal open={editOpen} onClose={() => setEditOpen(false)} lead={lead} />
      <ConversationModal open={conversationOpen} onClose={() => setConversationOpen(false)} lead={lead} />
      {activity && (
        <ActivityFormModal
          open
          onClose={() => setActivity(null)}
          lead={lead}
          units={activityUnits}
          initialType={activity.type}
          initialProperty={activity.property}
        />
      )}
      {quote && <QuotationModal open onClose={() => setQuote(null)} lead={lead} property={quote.property} />}
      <FormModal
        open={lostOpen}
        onClose={() => setLostOpen(false)}
        title={t('leadFile.markLost')}
        description={lead.clientName}
        fields={[{ name: 'lostReason', label: t('dealAction.reason'), type: 'textarea', required: true, placeholder: t('leadFile.lostPlaceholder') }]}
        defaultValues={{ lostReason: '' }}
        submitLabel={t('leadFile.markLost')}
        danger
        isPending={stage.isPending}
        onSubmit={({ lostReason }) =>
          stage.mutate(
            { id: lead._id, stage: 'LOST', lostReason },
            {
              onSuccess: () => {
                toast.success(t('leads.stageUpdated'));
                setLostOpen(false);
              },
              onError: (err) => toast.error(apiError(err, t('leads.moveFailed'))),
            }
          )
        }
      />
    </div>
  );
}
