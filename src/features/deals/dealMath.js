import { RETT_RATE, VAT_RATE } from '../../config/constants';

const round = (v) => Math.round(v * 100) / 100;

/** Client-side mirror of the backend quotation calculation, used for live previews. */
export function computeQuote(property, { discount = 0, termMonths = 12 } = {}) {
  if (!property) return null;
  const dealType = property.listingType === 'RENT' ? 'LEASE' : 'SALE';
  const grossAmount = dealType === 'SALE' ? property.price : round((property.price * termMonths) / 12);
  const netAmount = round(grossAmount - (Number(discount) || 0));
  let taxType = 'NONE';
  let taxRate = 0;
  if (dealType === 'SALE') {
    taxType = 'RETT';
    taxRate = RETT_RATE;
  } else if (['OFFICE', 'COMMERCIAL'].includes(property.type)) {
    taxType = 'VAT';
    taxRate = VAT_RATE;
  }
  const taxAmount = round((netAmount * taxRate) / 100);
  return { dealType, grossAmount, discount: Number(discount) || 0, netAmount, taxType, taxRate, taxAmount, totalAmount: round(netAmount + taxAmount) };
}

export const JOURNEY_STEPS = ['QUOTATION', 'RESERVATION', 'APPROVAL', 'CONTRACT', 'PAYMENT_PLAN', 'COLLECTION', 'HANDOVER', 'SERVICE', 'RENEWAL'];

/** Derives the state of each step of the deal journey from the deal document. */
export function dealJourney(deal, { serviceCount = 0 } = {}) {
  const fin = deal.financials || {};
  const stopped = ['REJECTED', 'CANCELLED'].includes(deal.status);
  const hasUpsell = deal.timeline?.some((e) => e.action === 'UPSELL_OPPORTUNITY_CREATED');

  const done = {
    QUOTATION: Boolean(deal.quotation?.issuedAt) && deal.status !== 'QUOTATION',
    RESERVATION: Boolean(deal.reservation?.reservedAt) || (Boolean(deal.renewalOf) && !['QUOTATION'].includes(deal.status)),
    APPROVAL: deal.approval?.decision === 'APPROVED',
    CONTRACT: Boolean(deal.contract?.number),
    PAYMENT_PLAN: deal.installments?.length > 0,
    COLLECTION: deal.installments?.length > 0 && fin.outstanding === 0,
    HANDOVER: Boolean(deal.handover?.handedOverAt),
    SERVICE: serviceCount > 0,
    RENEWAL: Boolean(deal.renewedBy) || hasUpsell,
  };

  // Collection runs in parallel with handover and service, so "current" is the first open core step.
  const core = ['QUOTATION', 'RESERVATION', 'APPROVAL', 'CONTRACT', 'PAYMENT_PLAN', 'HANDOVER'];
  let current = core.find((key) => !done[key]);
  if (!current) current = done.COLLECTION ? (done.SERVICE ? 'RENEWAL' : 'SERVICE') : 'COLLECTION';

  return JOURNEY_STEPS.map((key) => {
    let state = done[key] ? 'done' : 'upcoming';
    if (key === current && !done[key]) state = stopped ? 'blocked' : 'current';
    if (key === 'COLLECTION' && !done[key] && fin.collected > 0) state = 'current';
    return { key, state };
  });
}
