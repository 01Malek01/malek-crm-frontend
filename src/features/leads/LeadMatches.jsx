import { BedDouble, Eye, FileText, MapPin, Maximize, RefreshCw } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Pill, EnumPill } from '../../components/ui/StatusPill';
import { Progress } from '../../components/ui/Progress';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/Spinner';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatNumber, formatPrice } from '../../utils/format';

/** Ranked units that fit the customer requirement, with the next actions (viewing / quotation). */
export default function LeadMatches({ matchQuery, onViewing, onQuote, canQuote }) {
  const { t } = useLanguage();
  const { data, isLoading, isFetching, refetch } = matchQuery;
  const matches = data?.matches || [];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">{t('matches.title')}</h3>
          <p className="text-xs text-muted">{t('matches.subtitle')}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> {t('matches.refresh')}
        </Button>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <LoadingState />
        ) : !matches.length ? (
          <EmptyState title={t('matches.empty')} description={t('matches.emptyDesc')} />
        ) : (
          <ul className="space-y-3">
            {matches.map(({ property, matchScore, reasons }) => (
              <li key={property._id} className="rounded border border-line px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{property.title}</p>
                      <EnumPill prefix="listingType" value={property.listingType} />
                    </div>
                    <p className="text-xs text-muted">
                      {property.project} · {t(`propertyType.${property.type}`)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="font-semibold text-ink tabular-nums">
                        {formatPrice(property.price)}
                        {property.listingType === 'RENT' && ` ${t('units.perYear')}`}
                      </span>
                      {property.beds && (
                        <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> {property.beds}</span>
                      )}
                      {property.areaM2 && (
                        <span className="flex items-center gap-1"><Maximize className="size-3.5" /> {formatNumber(property.areaM2)} {t('units.sqm')}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" /> {[property.location?.district, property.location?.city].filter(Boolean).join('، ')}
                      </span>
                    </div>
                  </div>
                  <div className="w-28 shrink-0 space-y-1 text-end">
                    <p className="text-xs text-muted">{t('matches.fit')}</p>
                    <p className="text-lg font-semibold tabular-nums text-primary">{matchScore}%</p>
                    <Progress value={matchScore} />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {reasons.map((reason) => (
                      <Pill key={reason} tone={reason === 'BUDGET_NEAR' ? 'warn' : 'ok'}>
                        {t(`matchReason.${reason}`)}
                      </Pill>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onViewing(property)}>
                      <Eye className="size-4" /> {t('matches.bookViewing')}
                    </Button>
                    {canQuote && (
                      <Button size="sm" onClick={() => onQuote(property)}>
                        <FileText className="size-4" /> {t('matches.quote')}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
