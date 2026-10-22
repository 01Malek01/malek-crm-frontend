// Browser-side actions used by page buttons: export, print, share. No JSX, no data fetching.

const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value).replace(/"/g, '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
};

/**
 * Downloads rows as CSV (UTF-8 with BOM so Excel renders Arabic correctly).
 * `columns`: [{ label, value: (row) => any }]
 */
export function exportCsv(filename, columns, rows) {
  const lines = [columns.map((c) => csvCell(c.label)).join(',')];
  for (const row of rows) lines.push(columns.map((c) => csvCell(c.value(row))).join(','));
  const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const printPage = () => window.print();

export function openWhatsApp(phone = '', text = '') {
  const digits = String(phone).replace(/\D/g, '');
  window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * Opens a printable document (receipt, statement) in a new window.
 * `rows`: [[label, value]]
 */
export function printDocument({ title, subtitle, company, rows, footer, dir = 'rtl' }) {
  const win = window.open('', '_blank', 'width=720,height=860');
  if (!win) return;
  const body = rows
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join('');
  win.document.write(`<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#1e293b;margin:40px}
header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f766e;padding-bottom:12px;margin-bottom:24px}
h1{font-size:20px;margin:0}h2{font-size:14px;color:#0f766e;margin:0}p{margin:4px 0;color:#64748b;font-size:13px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:start}
th{width:40%;color:#64748b;font-weight:500}footer{margin-top:40px;font-size:12px;color:#64748b}
</style></head><body>
<header><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle || '')}</p></div><h2>${escapeHtml(company)}</h2></header>
<table>${body}</table><footer>${escapeHtml(footer || '')}</footer>
<script>window.onload=function(){window.print()}</script></body></html>`);
  win.document.close();
}
