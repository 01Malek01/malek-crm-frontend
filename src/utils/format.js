// Formatting follows the active UI language (set on <html lang> by LanguageProvider).
const isArabic = () => typeof document !== 'undefined' && document.documentElement.lang === 'ar';

const NUMBER_LOCALE = 'en-US';

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(NUMBER_LOCALE, { maximumFractionDigits: digits });
}

// Saudi Riyal. Latin digits are kept in Arabic for readability of financial figures.
export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '—';
  const amount = formatNumber(value, 2);
  return isArabic() ? `${amount} ر.س` : `SAR ${amount}`;
}

export function formatCompactPrice(value) {
  if (value === null || value === undefined) return '—';
  const abs = Math.abs(value);
  let scaled = formatNumber(value);
  let unit = '';
  if (abs >= 1_000_000) {
    scaled = formatNumber(value / 1_000_000, 1);
    unit = isArabic() ? ' مليون' : 'M';
  } else if (abs >= 1_000) {
    scaled = formatNumber(value / 1_000, 0);
    unit = isArabic() ? ' ألف' : 'K';
  }
  return isArabic() ? `${scaled}${unit} ر.س` : `SAR ${scaled}${unit}`;
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(value, 1)}%`;
}

const dateLocale = () => (isArabic() ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB');

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(dateLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Value for <input type="date"> / <input type="datetime-local">.
export function toInputDate(value = new Date(), withTime = false) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

export function capitalize(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const apiError = (err, fallback) => err?.response?.data?.message || fallback;
