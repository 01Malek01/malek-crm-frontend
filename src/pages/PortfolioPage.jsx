import { useNavigate } from 'react-router-dom';
import { Building2, Download, Home, Landmark, Percent, PieChart, Star, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { KpiGrid } from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/Spinner';
import { usePortfolioReport } from '../hooks/report.hooks';
import { printPage } from '../utils/actions';
import { useLanguage } from '../i18n/LanguageContext';
import { formatCompactPrice, formatDateTime, formatPercent } from '../utils/format';
import {
  CollectionsTrend,
  PipelineFunnel,
  ProjectPerformance,
  RenewalsDue,
  SourceBreakdown,
} from '../features/reports/ReportWidgets';

export default function PortfolioPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: report, isLoading } = usePortfolioReport();

  if (isLoading || !report) return <LoadingState />;
  const { units, revenue, collections, pipeline, service } = report;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('portfolio.title')}
        subtitle={t('portfolio.subtitle', { time: formatDateTime(report.generatedAt) })}
        actions={
          <Button variant="outline" onClick={printPage} className="print:hidden">
            <Download className="size-4" /> {t('portfolio.exportBoard')}
          </Button>
        }
      />

      <KpiGrid
        items={[
          { label: t('portfolio.units'), value: units.total, hint: t('portfolio.unitsHint', { available: units.byStatus.AVAILABLE, reserved: units.byStatus.RESERVED }), icon: Building2 },
          { label: t('portfolio.inventory'), value: formatCompactPrice(units.inventoryValue), hint: t('portfolio.inventoryHint'), icon: Landmark },
          { label: t('portfolio.sellThrough'), value: formatPercent(units.sellThroughRate), hint: t('portfolio.sellThroughHint', { sold: units.byStatus.SOLD }), icon: TrendingUp, tone: 'text-ok' },
          { label: t('portfolio.occupancy'), value: formatPercent(units.occupancyRate), hint: t('portfolio.occupancyHint', { rented: units.byStatus.RENTED }), icon: Home },
          { label: t('portfolio.salesValue'), value: formatCompactPrice(revenue.salesValue), hint: t('portfolio.salesValueHint', { deals: revenue.contractedDeals }), icon: PieChart, tone: 'text-ok' },
          { label: t('portfolio.rentRoll'), value: formatCompactPrice(revenue.annualRentRoll), hint: t('portfolio.rentRollHint'), icon: Wallet },
          { label: t('portfolio.collectionRate'), value: formatPercent(collections.collectionRate), hint: t('portfolio.collectionRateHint', { overdue: formatCompactPrice(collections.overdue) }), icon: Percent, tone: collections.overdue ? 'text-warn' : 'text-ok' },
          { label: t('portfolio.satisfaction'), value: service.satisfaction ? `${service.satisfaction} / 5` : '—', hint: t('portfolio.satisfactionHint', { open: service.open }), icon: Star },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CollectionsTrend monthly={collections.monthly} />
        </div>
        <PipelineFunnel byStage={pipeline.byStage} conversionRate={pipeline.conversionRate} />
      </div>

      <ProjectPerformance rows={report.byProject} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RenewalsDue items={report.renewalsDue} onRenew={(item) => navigate(`/deals/${item.dealId}`)} />
        <SourceBreakdown bySource={pipeline.bySource} />
      </div>
    </div>
  );
}
