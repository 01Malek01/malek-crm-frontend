import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, TextInput } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../i18n/LanguageContext';

const emptyToUndefined = (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : v);

function buildSchema(fields, t) {
  const required = t('common.required');
  const shape = {};

  for (const field of fields) {
    let rule;
    switch (field.type) {
      case 'number': {
        let n = z.number({ required_error: required, invalid_type_error: required }).min(field.min ?? 0, t('common.minValue', { min: field.min ?? 0 }));
        if (field.max !== undefined) n = n.max(field.max, t('common.maxValue', { max: field.max }));
        rule = z.preprocess((v) => emptyToUndefined(v === '' ? v : Number(v)), field.required ? n : n.optional());
        break;
      }
      case 'checkboxes':
        rule = z.preprocess((v) => (Array.isArray(v) ? v : v ? [v] : []), z.array(z.string()));
        break;
      default:
        rule = field.required ? z.string({ required_error: required }).trim().min(1, required) : z.string().optional();
    }
    shape[field.name] = rule;
  }
  return z.object(shape);
}

function FieldControl({ field, register }) {
  const { t } = useLanguage();
  const props = register(field.name);
  switch (field.type) {
    case 'select':
      return (
        <Select {...props}>
          {field.required ? (
            <option value="" disabled>
              {t('common.choose')}
            </option>
          ) : (
            <option value="">—</option>
          )}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    case 'textarea':
      return <Textarea rows={field.rows || 3} placeholder={field.placeholder} {...props} />;
    case 'checkboxes':
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-2 rounded border border-line px-3 py-2">
          {field.options.map((o) => (
            <label key={o.value} className="flex items-center gap-1.5 text-sm text-ink">
              <input type="checkbox" value={o.value} className="accent-primary" {...props} />
              {o.label}
            </label>
          ))}
        </div>
      );
    case 'date':
      return <TextInput type="date" {...props} />;
    case 'datetime':
      return <TextInput type="datetime-local" {...props} />;
    case 'password':
      return <TextInput type="password" autoComplete="new-password" {...props} />;
    case 'number':
      return <TextInput type="number" step="any" min={field.min} max={field.max} placeholder={field.placeholder} {...props} />;
    default:
      return <TextInput placeholder={field.placeholder} {...props} />;
  }
}

/**
 * Config-driven form used by every workflow step (reserve, contract, payment, handover…).
 * Fields: `{ name, label, type, required, min, max, options, placeholder, hint, span }`.
 * `preview(values)` renders live content under the form (e.g. price breakdown).
 */
export function FormModal({
  open,
  onClose,
  title,
  description,
  fields,
  defaultValues,
  submitLabel,
  onSubmit,
  isPending,
  preview,
  intro,
  size = 'md',
  danger = false,
}) {
  const { t } = useLanguage();
  const schema = useMemo(() => buildSchema(fields, t), [fields, t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const values = watch();

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size={size}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {intro}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <Field
              key={field.name}
              label={field.required ? `${field.label} *` : field.label}
              error={errors[field.name]?.message}
              className={cn(field.span === 2 || ['textarea', 'checkboxes'].includes(field.type) ? 'sm:col-span-2' : '')}
            >
              <FieldControl field={field} register={register} />
              {field.hint && <p className="text-xs text-muted">{field.hint}</p>}
            </Field>
          ))}
        </div>

        {preview && preview(values)}

        <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant={danger ? 'danger' : 'primary'} disabled={isPending}>
            {isPending ? t('common.saving') : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Label/value row used inside previews and summary cards. */
export function SummaryRow({ label, value, strong, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 py-1 text-sm', className)}>
      <span className="text-muted">{label}</span>
      <span className={cn('tabular-nums', strong ? 'font-semibold text-ink' : 'text-ink')}>{value}</span>
    </div>
  );
}
