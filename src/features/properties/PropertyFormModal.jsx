import { useMemo } from 'react';
import { FormModal } from '../../components/common/FormModal';
import { useCreateProperty } from '../../hooks/property.hooks';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { LISTING_TYPES, PROPERTY_TYPES } from '../../config/constants';
import { apiError } from '../../utils/format';

export default function PropertyFormModal({ open, onClose }) {
  const create = useCreateProperty();
  const toast = useToast();
  const { t } = useLanguage();

  const fields = useMemo(
    () => [
      { name: 'title', label: t('propertyForm.titleField'), required: true, placeholder: t('propertyForm.titlePlaceholder'), span: 2 },
      { name: 'project', label: t('propertyForm.project'), required: true, placeholder: t('propertyForm.projectPlaceholder') },
      { name: 'unitNumber', label: t('propertyForm.unitNumber'), placeholder: 'A-1204' },
      { name: 'type', label: t('propertyForm.type'), type: 'select', required: true, options: PROPERTY_TYPES.map((v) => ({ value: v, label: t(`propertyType.${v}`) })) },
      { name: 'listingType', label: t('propertyForm.listingType'), type: 'select', required: true, options: LISTING_TYPES.map((v) => ({ value: v, label: t(`listingType.${v}`) })) },
      { name: 'price', label: t('propertyForm.price'), type: 'number', required: true, min: 1, hint: t('propertyForm.priceHint') },
      { name: 'areaM2', label: t('propertyForm.area'), type: 'number', min: 0 },
      { name: 'beds', label: t('propertyForm.beds'), type: 'number', min: 0 },
      { name: 'baths', label: t('propertyForm.baths'), type: 'number', min: 0 },
      { name: 'floor', label: t('propertyForm.floor'), type: 'number', min: -2 },
      { name: 'city', label: t('propertyForm.city'), required: true, placeholder: t('leadForm.cityPlaceholder') },
      { name: 'district', label: t('propertyForm.district'), required: true, placeholder: t('leadForm.districtPlaceholder') },
      { name: 'featuresRaw', label: t('propertyForm.features'), placeholder: t('propertyForm.featuresPlaceholder'), span: 2 },
    ],
    [t]
  );

  const onSubmit = (values) => {
    const payload = {
      title: values.title,
      project: values.project,
      unitNumber: values.unitNumber || undefined,
      type: values.type,
      listingType: values.listingType,
      price: values.price,
      areaM2: values.areaM2,
      beds: values.beds,
      baths: values.baths,
      floor: values.floor,
      location: { city: values.city, district: values.district, address: `${values.district}، ${values.city}` },
      features: values.featuresRaw ? values.featuresRaw.split(/[,،]/).map((s) => s.trim()).filter(Boolean) : [],
    };
    create.mutate(payload, {
      onSuccess: () => {
        toast.success(t('properties.created'));
        onClose();
      },
      onError: (err) => toast.error(apiError(err, t('properties.createFailed'))),
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('propertyForm.title')}
      fields={fields}
      defaultValues={{ type: 'APARTMENT', listingType: 'SALE', city: '', district: '', title: '', project: '', unitNumber: '', price: '', featuresRaw: '' }}
      submitLabel={t('propertyForm.create')}
      onSubmit={onSubmit}
      isPending={create.isPending}
    />
  );
}
