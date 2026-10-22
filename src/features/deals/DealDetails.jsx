import { Link } from 'react-router-dom';
import { Building2, User } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EnumPill } from '../../components/ui/StatusPill';
import { Progress } from '../../components/ui/Progress';
import { SummaryRow } from '../../components/common/FormModal';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDate, formatDateTime, formatNumber, formatPrice } from '../../utils/format';

function Section({ title, children, action }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {action}
      </CardHeader>
      <CardBody className="divide-y divide-line/70">{children}</CardBody>
    </Card>
  );
}

export function PartiesCard({ deal }) {
  const { t } = useLanguage();
  const p = deal.property || {};
  return (
    <Section title={t('dealDetail.parties')}>
      <div className="flex items-start gap-3 py-2">
        <User className="mt-0.5 size-4 text-muted" />
        <div className="min-w-0 text-sm">
          <Link to={`/leads/${deal.lead?._id}`} className="font-medium text-primary hover:underline">
            {deal.lead?.clientName}
          </Link>
          <p className="text-xs text-muted"><span dir="ltr">{deal.lead?.clientPhone}</span> {deal.lead?.clientEmail && `· ${deal.lead.clientEmail}`}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 py-2">
        <Building2 className="mt-0.5 size-4 text-muted" />
        <div className="min-w-0 text-sm">
          <p className="font-medium text-ink">{p.title}</p>
          <p className="text-xs text-muted">
            {p.project} · {t(`propertyType.${p.type}`)} · {[p.location?.district, p.location?.city].filter(Boolean).join('، ')}
          </p>
          <p className="text-xs text-muted">
            {p.areaM2 && `${formatNumber(p.areaM2)} ${t('units.sqm')}`} {p.beds && `· ${p.beds} ${t('units.beds')}`}
          </p>
          <div className="mt-1"><EnumPill prefix="propertyStatus" value={p.status} /></div>
        </div>
      </div>
      <SummaryRow label={t('dealDetail.agent')} value={deal.agent?.name || '—'} />
      {deal.renewalOf && (
        <SummaryRow label={t('dealDetail.renewalOf')} value={<Link className="text-primary hover:underline" to={`/deals/${deal.renewalOf._id}`}>{deal.renewalOf.reference}</Link>} />
      )}
      {deal.renewedBy && (
        <SummaryRow label={t('dealDetail.renewedBy')} value={<Link className="text-primary hover:underline" to={`/deals/${deal.renewedBy._id}`}>{deal.renewedBy.reference}</Link>} />
      )}
    </Section>
  );
}

export function QuotationCard({ deal }) {
  const { t } = useLanguage();
  const q = deal.quotation || {};
  const expired = deal.status === 'QUOTATION' && q.validUntil && new Date(q.validUntil) < new Date();
  return (
    <Section title={t('dealDetail.quotation')} action={<span className="text-xs text-muted">{q.number}</span>}>
      <SummaryRow label={deal.dealType === 'LEASE' ? t('quotation.annualRent') : t('quotation.listPrice')} value={formatPrice(q.listPrice)} />
      {deal.dealType === 'LEASE' && <SummaryRow label={t('quotation.termMonths')} value={t(`quotation.term.${q.termMonths}`)} />}
      {deal.dealType === 'LEASE' && <SummaryRow label={t('quotation.rentForTerm')} value={formatPrice(q.grossAmount)} />}
      <SummaryRow label={t('quotation.discount')} value={`- ${formatPrice(q.discount)}`} />
      <SummaryRow label={`${t(`taxType.${q.taxType || 'NONE'}`)} (${q.taxRate || 0}%)`} value={formatPrice(q.taxAmount)} />
      <SummaryRow label={t('quotation.total')} value={formatPrice(q.totalAmount)} strong />
      <SummaryRow label={t('dealDetail.issued')} value={formatDate(q.issuedAt)} />
      <SummaryRow label={t('dealDetail.validUntil')} value={<span className={expired ? 'text-danger' : ''}>{formatDate(q.validUntil)}</span>} />
    </Section>
  );
}

export function MilestonesCard({ deal }) {
  const { t } = useLanguage();
  const r = deal.reservation;
  const a = deal.approval;
  const c = deal.contract;
  const h = deal.handover;
  const fin = deal.financials || {};
  if (!r?.reservedAt && !a?.requestedAt && !c?.number && !h?.handedOverAt) return null;

  return (
    <Section title={t('dealDetail.milestones')}>
      {r?.reservedAt && (
        <div className="py-1">
          <p className="pt-1 text-xs font-semibold uppercase text-muted">{t('journey.RESERVATION')}</p>
          <SummaryRow label={t('dealAction.reserve.deposit')} value={formatPrice(r.depositAmount)} />
          <SummaryRow label={t('dealDetail.reservedAt')} value={formatDate(r.reservedAt)} />
          <SummaryRow label={t('dealDetail.holdUntil')} value={formatDate(r.expiresAt)} />
        </div>
      )}
      {a?.requestedAt && (
        <div className="py-1">
          <p className="pt-1 text-xs font-semibold uppercase text-muted">{t('journey.APPROVAL')}</p>
          <SummaryRow label={t('dealDetail.requestedBy')} value={`${a.requestedBy || '—'} · ${formatDate(a.requestedAt)}`} />
          {a.decision && <SummaryRow label={t('dealDetail.decision')} value={<EnumPill prefix="dealStatus" value={a.decision} />} />}
          {a.decidedBy && <SummaryRow label={t('dealDetail.decidedBy')} value={`${a.decidedBy} · ${formatDate(a.decidedAt)}`} />}
          {a.notes && <p className="py-1 text-xs text-muted">{a.notes}</p>}
        </div>
      )}
      {c?.number && (
        <div className="py-1">
          <p className="pt-1 text-xs font-semibold uppercase text-muted">{t('journey.CONTRACT')}</p>
          <SummaryRow label={t('dealDetail.contractNo')} value={c.number} />
          <SummaryRow label={t('dealDetail.signedAt')} value={formatDate(c.signedAt)} />
          <SummaryRow label={t('dealDetail.period')} value={c.endDate ? `${formatDate(c.startDate)} → ${formatDate(c.endDate)}` : formatDate(c.startDate)} />
          {c.ejarNumber && <SummaryRow label={t('dealAction.contract.ejar')} value={c.ejarNumber} />}
        </div>
      )}
      {deal.installments?.length > 0 && (
        <div className="space-y-1 py-2">
          <p className="text-xs font-semibold uppercase text-muted">{t('journey.COLLECTION')}</p>
          <Progress value={fin.progress} />
          <SummaryRow label={t('dealDetail.collected')} value={`${formatPrice(fin.collected)} (${fin.progress}%)`} />
          <SummaryRow label={t('dealDetail.outstanding')} value={formatPrice(fin.outstanding)} />
          {fin.overdue > 0 && <SummaryRow label={t('dealDetail.overdue')} value={<span className="text-danger">{formatPrice(fin.overdue)}</span>} />}
        </div>
      )}
      {h?.handedOverAt && (
        <div className="py-1">
          <p className="pt-1 text-xs font-semibold uppercase text-muted">{t('journey.HANDOVER')}</p>
          <SummaryRow label={t('dealAction.handover.date')} value={`${formatDate(h.handedOverAt)} · ${h.handedOverBy || ''}`} />
          {h.keysCount !== undefined && h.keysCount !== null && <SummaryRow label={t('dealAction.handover.keys')} value={h.keysCount} />}
          {h.electricityMeter && <SummaryRow label={t('dealAction.handover.electricity')} value={h.electricityMeter} />}
          {h.waterMeter && <SummaryRow label={t('dealAction.handover.water')} value={h.waterMeter} />}
          {h.notes && <p className="py-1 text-xs text-muted">{h.notes}</p>}
        </div>
      )}
    </Section>
  );
}

export function TimelineCard({ deal }) {
  const { t } = useLanguage();
  const entries = [...(deal.timeline || [])].reverse();
  return (
    <Section title={t('dealDetail.timeline')}>
      <ol className="space-y-3 py-1">
        {entries.map((entry, index) => (
          <li key={index} className="flex gap-3">
            <span className="mt-1.5 size-2 shrink-0 rounded-sm bg-primary" />
            <div className="min-w-0 text-sm">
              <p className="text-ink">{t(`timeline.${entry.action}`)}</p>
              <p className="text-xs text-muted">
                {formatDateTime(entry.at)} · {entry.by}
                {entry.note && ` · ${entry.note}`}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
