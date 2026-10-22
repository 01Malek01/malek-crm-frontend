import { MapPin } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useLanguage } from '../../i18n/LanguageContext';

export default function MapPanel({ titleKey, markers }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-ink">{t(titleKey)}</h3>
      </CardHeader>
      <CardBody>
        <div className="relative h-56 overflow-hidden rounded border border-line bg-canvas">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs uppercase tracking-wide text-line">{t(titleKey)}</span>
          </div>
          {markers.map((marker, index) => (
            <div
              key={index}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              <MapPin className="size-5 text-primary" />
              <span className="whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink shadow-sm">
                {marker.label}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}