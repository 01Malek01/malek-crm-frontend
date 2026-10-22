import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Wrench } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EnumPill } from '../components/ui/StatusPill';
import { Stepper } from '../components/ui/Stepper';
import { LoadingState } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useDeal } from '../hooks/deal.hooks';
import { useServiceRequests } from '../hooks/serviceRequest.hooks';
import { useAuth } from '../hooks/useAuth';
import { printPage } from '../utils/actions';
import { useLanguage } from '../i18n/LanguageContext';
import { dealJourney } from '../features/deals/dealMath';
import DealActionPanel from '../features/deals/DealActionPanel';
import DealActionModal from '../features/deals/DealActionModal';
import InstallmentsTable from '../features/deals/InstallmentsTable';
import { MilestonesCard, PartiesCard, QuotationCard, TimelineCard } from '../features/deals/DealDetails';
import ServiceRequestsTable from '../features/service/ServiceRequestsTable';

export default function DealDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { isManager } = useAuth();
  const { data: deal, isLoading, isError } = useDeal(id);
  const { data: requests = [], isLoading: requestsLoading } = useServiceRequests({ deal: id });
  const [action, setAction] = useState(null); // { action, installment }

  if (isLoading) return <LoadingState />;
  if (isError || !deal) return <EmptyState title={t('dealDetail.notFound')} />;

  const steps = dealJourney(deal, { serviceCount: requests.length }).map((step) => ({
    ...step,
    label: t(`journey.${step.key}`),
    hint: step.key === 'RENEWAL' ? t(deal.dealType === 'LEASE' ? 'journeyHint.RENEWAL_LEASE' : 'journeyHint.RENEWAL_SALE') : t(`journeyHint.${step.key}`),
  }));
  const contracted = ['CONTRACTED', 'HANDED_OVER'].includes(deal.status);

  return (
    <div className="space-y-4">
      <PageHeader
        backTo="/deals"
        backLabel={t('deals.title')}
        title={t('dealDetail.title', { ref: deal.reference })}
        meta={
          <>
            <EnumPill prefix="dealStatus" value={deal.status} />
            <EnumPill prefix="dealType" value={deal.dealType} />
            {deal.renewalOf && <EnumPill prefix="dealDetail" value="renewalBadge" tone="dark" />}
          </>
        }
        subtitle={`${deal.lead?.clientName} · ${deal.property?.title} · ${deal.property?.project || ''}`}
        actions={
          <Button variant="outline" onClick={printPage} className="print:hidden">
            <Printer className="size-4" /> {t('deals.print')}
          </Button>
        }
      />

      <Card>
        <CardBody>
          <Stepper steps={steps} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <DealActionPanel deal={deal} onAction={(name) => setAction({ action: name })} />

          {(deal.installments?.length > 0 || contracted) && (
            <Card>
              <CardHeader className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{t('dealDetail.paymentPlan')}</h3>
                  <p className="text-xs text-muted">
                    {deal.paymentPlan?.frequency ? t(`frequency.${deal.paymentPlan.frequency}`) : t('dealDetail.noPlan')}
                  </p>
                </div>
              </CardHeader>
              <InstallmentsTable
                rows={deal.installments || []}
                context={{ client: deal.lead?.clientName, phone: deal.lead?.clientPhone, reference: deal.reference, unit: deal.property?.title }}
                onPay={isManager ? (installment) => setAction({ action: 'pay', installment }) : undefined}
              />
            </Card>
          )}

          {contracted && (
            <Card>
              <CardHeader className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{t('dealDetail.service')}</h3>
                  <p className="text-xs text-muted">{t('dealDetail.serviceHint')}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setAction({ action: 'service' })}>
                  <Wrench className="size-4" /> {t('dealPanel.btn.service')}
                </Button>
              </CardHeader>
              <ServiceRequestsTable requests={requests} isLoading={requestsLoading} compact />
            </Card>
          )}

          <TimelineCard deal={deal} />
        </div>

        <div className="space-y-4">
          <PartiesCard deal={deal} />
          <QuotationCard deal={deal} />
          <MilestonesCard deal={deal} />
        </div>
      </div>

      {action && (
        <DealActionModal deal={deal} action={action.action} installment={action.installment} onClose={() => setAction(null)} />
      )}
    </div>
  );
}
