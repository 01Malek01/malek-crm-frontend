import { useState } from 'react';
import { Bath, BedDouble, Copy, Eye, FileText, Layers, MapPin, Maximize, Trash2 } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { EnumPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { IconAction } from '../../components/ui/DataTable';
import { SummaryRow } from '../../components/common/FormModal';
import { formatNumber, formatPrice } from '../../utils/format';
import { copyText } from '../../utils/actions';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PropertyCard({ property, onDelete, onQuote }) {
  const { isManager } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const location = [property.location?.district, property.location?.city].filter(Boolean).join('، ');
  const priceLabel = property.listingType === 'RENT' ? t('units.annualRent') : t('units.salePrice');

  const share = async () => {
    const lines = [
      `${property.title} — ${property.project}`,
      `${t(`propertyType.${property.type}`)} · ${t(`listingType.${property.listingType}`)}`,
      `${priceLabel}: ${formatPrice(property.price)}`,
      property.areaM2 ? `${t('propertyForm.area')}: ${formatNumber(property.areaM2)} ${t('units.sqm')}` : null,
      property.beds ? `${t('propertyForm.beds')}: ${property.beds}` : null,
      location,
      t('common.appName'),
    ].filter(Boolean);
    const ok = await copyText(lines.join('\n'));
    if (ok) toast.success(t('units.copied'));
    else toast.error(t('units.copyFailed'));
  };

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{property.title}</p>
          <p className="truncate text-xs text-muted">
            {property.project} · {t(`propertyType.${property.type}`)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <EnumPill prefix="propertyStatus" value={property.status} />
          <EnumPill prefix="listingType" value={property.listingType} />
        </div>
      </div>

      <CardBody className="flex-1 space-y-3">
        <div>
          <p className="text-xs text-muted">{priceLabel}</p>
          <p className="text-base font-semibold tabular-nums text-ink">{formatPrice(property.price)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          {property.beds && <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> {property.beds} {t('units.beds')}</span>}
          {property.baths && <span className="flex items-center gap-1"><Bath className="size-3.5" /> {property.baths}</span>}
          {property.areaM2 && <span className="flex items-center gap-1"><Maximize className="size-3.5" /> {formatNumber(property.areaM2)} {t('units.sqm')}</span>}
          {property.floor !== undefined && property.floor !== null && <span className="flex items-center gap-1"><Layers className="size-3.5" /> {t('units.floor', { floor: property.floor })}</span>}
          {location && <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {location}</span>}
        </div>

        {property.features?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.features.map((f) => (
              <span key={f} className="rounded bg-canvas px-1.5 py-0.5 text-xs text-muted">{f}</span>
            ))}
          </div>
        )}
      </CardBody>

      <div className="flex items-center gap-1 border-t border-line px-3 py-2">
        {property.status === 'AVAILABLE' && (
          <Button size="sm" onClick={() => onQuote(property)}>
            <FileText className="size-4" /> {t('matches.quote')}
          </Button>
        )}
        <div className="ms-auto flex items-center gap-1">
          <IconAction icon={Eye} title={t('units.details')} onClick={() => setDetailsOpen(true)} />
          <IconAction icon={Copy} title={t('units.share')} onClick={share} />
          {isManager && property.status === 'AVAILABLE' && (
            <IconAction icon={Trash2} tone="danger" title={t('units.delete')} onClick={() => onDelete(property._id)} />
          )}
        </div>
      </div>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={property.title} description={property.project}>
        <div className="divide-y divide-line/70">
          <SummaryRow label={t('propertyForm.unitNumber')} value={property.unitNumber || '—'} />
          <SummaryRow label={t('propertyForm.type')} value={t(`propertyType.${property.type}`)} />
          <SummaryRow label={t('propertyForm.listingType')} value={<EnumPill prefix="listingType" value={property.listingType} />} />
          <SummaryRow label={t('deals.colStatus')} value={<EnumPill prefix="propertyStatus" value={property.status} />} />
          <SummaryRow label={priceLabel} value={formatPrice(property.price)} strong />
          {property.areaM2 && (
            <SummaryRow label={t('units.pricePerSqm')} value={formatPrice(Math.round(property.price / property.areaM2))} />
          )}
          <SummaryRow label={t('propertyForm.area')} value={property.areaM2 ? `${formatNumber(property.areaM2)} ${t('units.sqm')}` : '—'} />
          <SummaryRow label={t('propertyForm.beds')} value={property.beds ?? '—'} />
          <SummaryRow label={t('propertyForm.baths')} value={property.baths ?? '—'} />
          <SummaryRow label={t('propertyForm.floor')} value={property.floor ?? '—'} />
          <SummaryRow label={t('leadFile.location')} value={location || '—'} />
          {property.features?.length > 0 && (
            <SummaryRow label={t('units.features')} value={property.features.join('، ')} />
          )}
        </div>
        {property.status === 'AVAILABLE' && (
          <div className="flex justify-end border-t border-line pt-3">
            <Button
              onClick={() => {
                setDetailsOpen(false);
                onQuote(property);
              }}
            >
              <FileText className="size-4" /> {t('matches.quote')}
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  );
}
