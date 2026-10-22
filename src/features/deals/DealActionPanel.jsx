import {
  BadgeCheck,
  Ban,
  CalendarRange,
  FilePen,
  FileSignature,
  KeyRound,
  Lock,
  Printer,
  RefreshCcw,
  Send,
  TrendingUp,
  Wrench,
  XCircle,
  Info,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { printPage } from '../../utils/actions';
import { useLanguage } from '../../i18n/LanguageContext';

/** Decides the next business step for a deal and offers the matching buttons. */
function nextStep(deal, isManager) {
  const hasPlan = deal.installments?.length > 0;
  const upsellDone = deal.timeline?.some((e) => e.action === 'UPSELL_OPPORTUNITY_CREATED');

  switch (deal.status) {
    case 'QUOTATION':
      return deal.renewalOf
        ? { key: 'renewalQuote', primary: [{ action: 'submit-approval', icon: Send }], secondary: [{ action: 'cancel', icon: Ban }] }
        : { key: 'quotation', primary: [{ action: 'reserve', icon: Lock }], secondary: [{ action: 'cancel', icon: Ban }], print: [{ labelKey: 'dealPanel.printQuote', icon: Printer }] };
    case 'RESERVED':
      return { key: 'reserved', primary: [{ action: 'submit-approval', icon: Send }], secondary: [{ action: 'cancel', icon: Ban }] };
    case 'PENDING_APPROVAL':
      return isManager
        ? { key: 'pendingManager', primary: [{ action: 'approve', icon: BadgeCheck }], secondary: [{ action: 'reject', icon: XCircle }] }
        : { key: 'pendingAgent', primary: [], secondary: [] };
    case 'APPROVED':
      return isManager
        ? { key: 'approved', primary: [{ action: 'contract', icon: FileSignature }], secondary: [{ action: 'cancel', icon: Ban }] }
        : { key: 'approvedAgent', primary: [], secondary: [] };
    case 'CONTRACTED':
      if (!isManager) return { key: 'contractedAgent', primary: [], secondary: [] };
      return hasPlan
        ? { key: 'readyHandover', primary: [{ action: 'handover', icon: KeyRound }], secondary: [], print: [{ labelKey: 'dealPanel.printContract', icon: Printer }] }
        : { key: 'contracted', primary: [{ action: 'payment-plan', icon: CalendarRange }], secondary: [], print: [{ labelKey: 'dealPanel.printContract', icon: Printer }] };
    case 'HANDED_OVER': {
      const primary = [];
      if (isManager && !hasPlan) primary.push({ action: 'payment-plan', icon: CalendarRange });
      if (deal.dealType === 'LEASE' && !deal.renewedBy) primary.push({ action: 'renew', icon: RefreshCcw });
      if (!upsellDone) primary.push({ action: 'upsell', icon: TrendingUp });
      return { key: 'handedOver', primary, secondary: [{ action: 'service', icon: Wrench }] };
    }
    case 'REJECTED':
      return { key: 'rejected', primary: [], secondary: [] };
    case 'CANCELLED':
      return { key: 'cancelled', primary: [], secondary: [] };
    default:
      return null;
  }
}

export default function DealActionPanel({ deal, onAction }) {
  const { isManager } = useAuth();
  const { t } = useLanguage();
  const step = nextStep(deal, isManager);
  if (!step) return null;

  const stopped = ['REJECTED', 'CANCELLED'].includes(deal.status);

  return (
    <Card className={`print:hidden ${stopped ? 'border-danger/30' : 'border-primary/30'}`}>
      <CardBody className="space-y-3">
        <div className="flex items-start gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded ${stopped ? 'bg-danger/10 text-danger' : 'bg-primary-soft text-primary'}`}>
            {stopped ? <XCircle className="size-5" /> : step.primary.length ? <FilePen className="size-5" /> : <Info className="size-5" />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted">{t('dealPanel.nextStep')}</p>
            <p className="text-sm font-semibold text-ink">{t(`dealPanel.${step.key}.title`)}</p>
            <p className="text-sm text-muted">
              {t(`dealPanel.${step.key}.body`, { reason: deal.cancelReason || deal.approval?.notes || '—' })}
            </p>
          </div>
        </div>
        {(step.primary.length > 0 || step.secondary.length > 0 || step.print) && (
          <div className="flex flex-wrap gap-2">
            {step.primary.map(({ action, icon: Icon }) => (
              <Button key={action} onClick={() => onAction(action)}>
                <Icon className="size-4" /> {t(`dealPanel.btn.${action}`)}
              </Button>
            ))}
            {step.secondary.map(({ action, icon: Icon }) => (
              <Button key={action} variant="outline" onClick={() => onAction(action)}>
                <Icon className="size-4" /> {t(`dealPanel.btn.${action}`)}
              </Button>
            ))}
            {step.print?.map(({ labelKey, icon: Icon }) => (
              <Button key={labelKey} variant="ghost" onClick={printPage}>
                <Icon className="size-4" /> {t(labelKey)}
              </Button>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
