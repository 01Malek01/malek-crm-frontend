import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useLanguage } from '../../i18n/LanguageContext';

export default function BarChart({ titleKey, data }) {
  const { t } = useLanguage();
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-ink">{t(titleKey)}</h3>
      </CardHeader>
      <CardBody>
        <div className="flex h-40 items-end gap-3">
          {data.map((item) => {
            const pct = Math.round((item.value / max) * 100);
            return (
              <div key={item.labelKey} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium tabular-nums text-muted">{item.value}{t('demo.millionShort')}</span>
                <div className="flex h-full w-full items-end rounded bg-canvas">
                  <div className="w-full rounded bg-primary" style={{ height: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted">{t(item.labelKey)}</span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}