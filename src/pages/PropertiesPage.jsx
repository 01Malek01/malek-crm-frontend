import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Map as MapIcon, Plus } from 'lucide-react';
import { useProperties, useDeleteProperty } from '../hooks/property.hooks';
import { useAuth } from '../hooks/useAuth';
import { exportCsv } from '../utils/actions';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { FilterTabs } from '../components/ui/FilterTabs';
import { LoadingState } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { PROPERTY_STATUS } from '../config/constants';
import { apiError } from '../utils/format';
import PropertyCard from '../features/properties/PropertyCard';
import PropertyFormModal from '../features/properties/PropertyFormModal';
import QuotationModal from '../features/deals/QuotationModal';

export default function PropertiesPage() {
  const { data: properties = [], isLoading } = useProperties();
  const deleteProperty = useDeleteProperty();
  const { isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [createOpen, setCreateOpen] = useState(false);
  const [quoteFor, setQuoteFor] = useState(null);
  const [listing, setListing] = useState('all');
  const [status, setStatus] = useState('');
  const [project, setProject] = useState('');

  const projects = useMemo(() => [...new Set(properties.map((p) => p.project).filter(Boolean))], [properties]);
  const filtered = properties.filter(
    (p) => (listing === 'all' || p.listingType === listing) && (!status || p.status === status) && (!project || p.project === project)
  );

  const handleDelete = (id) => {
    if (!window.confirm(t('common.deleteConfirmProperty'))) return;
    deleteProperty.mutate(id, {
      onSuccess: () => toast.success(t('properties.deleted')),
      onError: (err) => toast.error(apiError(err, t('properties.deleteFailed'))),
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('properties.title')}
        subtitle={t('properties.subtitle')}
        actions={
          <>
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate('/gis')}>
                <MapIcon className="size-4" /> {t('properties.mapView')}
              </Button>
            )}
            <Button variant="outline" onClick={() =>
                exportCsv('units', [
                  { label: t('propertyForm.titleField'), value: (p) => p.title },
                  { label: t('propertyForm.project'), value: (p) => p.project },
                  { label: t('propertyForm.type'), value: (p) => t(`propertyType.${p.type}`) },
                  { label: t('propertyForm.listingType'), value: (p) => t(`listingType.${p.listingType}`) },
                  { label: t('propertyForm.price'), value: (p) => p.price },
                  { label: t('propertyForm.area'), value: (p) => p.areaM2 },
                  { label: t('propertyForm.beds'), value: (p) => p.beds },
                  { label: t('propertyForm.city'), value: (p) => p.location?.city },
                  { label: t('propertyForm.district'), value: (p) => p.location?.district },
                  { label: t('deals.colStatus'), value: (p) => t(`propertyStatus.${p.status}`) },
                ], filtered)
              }>
              <Download className="size-4" /> {t('common.export')}
            </Button>
            {isManager && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" /> {t('properties.newProperty')}
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterTabs
          options={[
            { value: 'all', label: t('properties.all'), count: properties.length },
            { value: 'SALE', label: t('listingType.SALE'), count: properties.filter((p) => p.listingType === 'SALE').length },
            { value: 'RENT', label: t('listingType.RENT'), count: properties.filter((p) => p.listingType === 'RENT').length },
          ]}
          value={listing}
          onChange={setListing}
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="">{t('properties.anyStatus')}</option>
          {Object.keys(PROPERTY_STATUS).map((s) => (
            <option key={s} value={s}>{t(`propertyStatus.${s}`)}</option>
          ))}
        </Select>
        <Select value={project} onChange={(e) => setProject(e.target.value)} className="w-56">
          <option value="">{t('properties.anyProject')}</option>
          {projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('properties.empty')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p._id} property={p} onDelete={handleDelete} onQuote={setQuoteFor} />
          ))}
        </div>
      )}

      {isManager && <PropertyFormModal open={createOpen} onClose={() => setCreateOpen(false)} />}
      {quoteFor && <QuotationModal open onClose={() => setQuoteFor(null)} property={quoteFor} />}
    </div>
  );
}
