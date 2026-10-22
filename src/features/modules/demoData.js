/**
 * Content for the secondary modules (records are editable in the page session).
 * Structural labels are i18n keys; row values are literal Saudi sample data.
 * `actions.primary`: add-record button label; `rowActions`: view / edit / approve / toggle.
 */
export const MODULE_DEMO = {
  brokers: {
    actions: { primary: 'demo.action.addBroker' },
    rowActions: ['view', 'edit'],
    stats: [
      { labelKey: 'demo.stat.activeBrokers', value: '5', hintKey: 'demo.hint.falLicensed' },
      { labelKey: 'demo.stat.closedDeals', value: '57', hintKey: 'demo.hint.thisQuarter', tone: 'text-ok' },
      { labelKey: 'demo.stat.commission', value: 1090500, format: 'compactCurrency', hintKey: 'demo.hint.thisQuarter', tone: 'text-warn' },
    ],
    columns: [
      { field: 'name', labelKey: 'demo.field.brokerOffice', type: 'primary', subField: 'license', subLabelKey: 'demo.field.license' },
      { field: 'channel', labelKey: 'demo.field.channel', type: 'muted' },
      { field: 'deals', labelKey: 'demo.field.deals', type: 'number' },
      { field: 'amount', labelKey: 'demo.field.salesValue', type: 'currency' },
      { field: 'commission', labelKey: 'demo.field.commissionRate', type: 'percent' },
      { field: 'status', labelKey: 'demo.field.status', type: 'status' },
    ],
    rows: [
      { name: 'مكتب دار الإعمار العقاري', license: 'رخصة فال 1100023456', channel: 'وسيط معتمد', deals: 14, amount: 18600000, commission: 2.5, status: 'active' },
      { name: 'شركة مفاتيح الغرب للتسويق', license: 'رخصة فال 1100031877', channel: 'مسوّق حصري', deals: 9, amount: 11400000, commission: 2, status: 'active' },
      { name: 'مكتب ديار الشرقية', license: 'رخصة فال 1100019002', channel: 'شراكة', deals: 11, amount: 9900000, commission: 2.5, status: 'active' },
      { name: 'منصة سكن الرقمية', license: 'رخصة فال 1100045120', channel: 'منصة إلكترونية', deals: 16, amount: 7200000, commission: 1.5, status: 'active' },
      { name: 'مكتب أبعاد العقار', license: 'رخصة فال 1100052214', channel: 'إحالة', deals: 7, amount: 4200000, commission: 1, status: 'pending' },
    ],
    highlights: [
      { label: 'مكتب دار الإعمار العقاري', value: 18600000, format: 'currency' },
      { label: 'شركة مفاتيح الغرب للتسويق', value: 11400000, format: 'currency' },
      { label: 'مكتب ديار الشرقية', value: 9900000, format: 'currency' },
      { label: 'منصة سكن الرقمية', value: 7200000, format: 'currency' },
    ],
  },

  gis: {
    actions: { primary: 'demo.action.addLayer' },
    rowActions: ['view', 'edit'],
    stats: [
      { labelKey: 'demo.stat.mappedUnits', value: '42', hintKey: 'demo.hint.acrossProjects' },
      { labelKey: 'demo.stat.projects', value: '6', hintKey: 'demo.hint.threeCities' },
      { labelKey: 'demo.stat.coverage', value: '100%', hintKey: 'demo.hint.geoTagged', tone: 'text-ok' },
    ],
    columns: [
      { field: 'zone', labelKey: 'demo.field.project', type: 'primary', subField: 'district', subLabelKey: 'demo.field.location' },
      { field: 'units', labelKey: 'demo.field.units', type: 'number' },
      { field: 'usage', labelKey: 'demo.field.usage', type: 'muted' },
      { field: 'status', labelKey: 'demo.field.status', type: 'status' },
    ],
    rows: [
      { zone: 'سدرة النرجس', district: 'النرجس، الرياض', units: 8, usage: 'سكني — فلل وتاون هاوس', status: 'available' },
      { zone: 'أبراج الملقا السكنية', district: 'الملقا، الرياض', units: 12, usage: 'سكني — شقق', status: 'available' },
      { zone: 'مركز العليا للأعمال', district: 'العليا، الرياض', units: 6, usage: 'مكتبي', status: 'occupied' },
      { zone: 'مجمع روضة الشاطئ', district: 'الشاطئ، جدة', units: 8, usage: 'سكني — إيجار', status: 'occupied' },
      { zone: 'واجهة الخبر التجارية', district: 'الكورنيش، الخبر', units: 4, usage: 'تجاري', status: 'available' },
      { zone: 'أراضي شمال الرياض', district: 'القيروان، الرياض', units: 4, usage: 'أراضٍ سكنية', status: 'available' },
    ],
    map: {
      titleKey: 'demo.spatialCoverage',
      markers: [
        { x: 50, y: 28, label: 'سدرة النرجس' },
        { x: 38, y: 40, label: 'أبراج الملقا' },
        { x: 46, y: 55, label: 'مركز العليا' },
        { x: 18, y: 70, label: 'روضة الشاطئ — جدة' },
        { x: 82, y: 38, label: 'واجهة الخبر' },
        { x: 44, y: 18, label: 'أراضي شمال الرياض' },
      ],
    },
    highlights: [
      { label: 'الرياض', value: 30, format: 'number' },
      { label: 'جدة', value: 8, format: 'number' },
      { label: 'الخبر', value: 4, format: 'number' },
    ],
  },

  financials: {
    actions: { primary: 'demo.action.newJournal' },
    rowActions: ['view', 'edit'],
    stats: [
      { labelKey: 'demo.stat.revenue', value: 1319000, format: 'compactCurrency', hintKey: 'demo.hint.thisMonth', tone: 'text-ok' },
      { labelKey: 'demo.stat.expenses', value: 575000, format: 'compactCurrency', hintKey: 'demo.hint.thisMonth', tone: 'text-warn' },
      { labelKey: 'demo.stat.netIncome', value: 744000, format: 'compactCurrency', hintKey: 'demo.hint.thisMonth', tone: 'text-ok' },
    ],
    columns: [
      { field: 'date', labelKey: 'demo.field.date', type: 'date' },
      { field: 'reference', labelKey: 'demo.field.reference', type: 'primary', subField: 'description', subLabelKey: 'demo.field.description' },
      { field: 'type', labelKey: 'demo.field.type', type: 'status' },
      { field: 'amount', labelKey: 'demo.field.amount', type: 'currency' },
      { field: 'status', labelKey: 'demo.field.status', type: 'status' },
    ],
    rows: [
      { date: '2026-09-02', reference: 'JV-9001', description: 'إيرادات بيع فيلا V-14 — سدرة النرجس', type: 'revenue', amount: 1250000, status: 'approved' },
      { date: '2026-09-03', reference: 'JV-9002', description: 'مستخلص مقاول — أبراج الملقا', type: 'expense', amount: 340000, status: 'approved' },
      { date: '2026-09-05', reference: 'JV-9003', description: 'إيجارات مركز العليا للأعمال — الربع الثالث', type: 'revenue', amount: 69000, status: 'pending' },
      { date: '2026-09-07', reference: 'JV-9004', description: 'رسوم إدارة المرافق', type: 'expense', amount: 120000, status: 'pending' },
      { date: '2026-09-09', reference: 'JV-9005', description: 'ضريبة التصرفات العقارية — توريد', type: 'expense', amount: 115000, status: 'approved' },
    ],
    chart: {
      titleKey: 'demo.revenueTrend',
      data: [
        { labelKey: 'demo.month.apr', value: 2.6 },
        { labelKey: 'demo.month.may', value: 1.1 },
        { labelKey: 'demo.month.jun', value: 0.4 },
        { labelKey: 'demo.month.jul', value: 0.8 },
        { labelKey: 'demo.month.aug', value: 1.2 },
        { labelKey: 'demo.month.sep', value: 1.3 },
      ],
    },
    highlights: [
      { label: 'مبيعات الوحدات', value: 13193250, format: 'currency' },
      { label: 'إيرادات الإيجار السنوية', value: 1150000, format: 'currency' },
      { label: 'رسوم إدارة المرافق', value: 240000, format: 'currency' },
    ],
  },

  procurement: {
    actions: { primary: 'demo.action.newPO' },
    rowActions: ['view', 'approve', 'edit'],
    stats: [
      { labelKey: 'demo.stat.openPOs', value: '3', hintKey: 'demo.hint.awaitingApproval' },
      { labelKey: 'demo.stat.spend', value: 1135000, format: 'compactCurrency', hintKey: 'demo.hint.thisQuarter', tone: 'text-warn' },
      { labelKey: 'demo.stat.suppliers', value: '5', hintKey: 'demo.hint.qualified', tone: 'text-ok' },
    ],
    columns: [
      { field: 'reference', labelKey: 'demo.field.reference', type: 'muted' },
      { field: 'supplier', labelKey: 'demo.field.supplier', type: 'primary', subField: 'project', subLabelKey: 'demo.field.project' },
      { field: 'category', labelKey: 'demo.field.category', type: 'muted' },
      { field: 'amount', labelKey: 'demo.field.amount', type: 'currency' },
      { field: 'status', labelKey: 'demo.field.status', type: 'status' },
    ],
    rows: [
      { reference: 'PO-8801', supplier: 'مؤسسة الإمداد لمواد البناء', project: 'أبراج الملقا السكنية', category: 'مواد بناء', amount: 520000, status: 'approved' },
      { reference: 'PO-8802', supplier: 'شركة برودة للتكييف', project: 'مركز العليا للأعمال', category: 'صيانة تكييف', amount: 180000, status: 'pending' },
      { reference: 'PO-8803', supplier: 'دار الأثاث الحديث', project: 'مجمع روضة الشاطئ', category: 'تأثيث', amount: 96000, status: 'draft' },
      { reference: 'PO-8804', supplier: 'شركة النقاء لخدمات النظافة', project: 'جميع المشاريع', category: 'خدمات', amount: 64000, status: 'approved' },
      { reference: 'PO-8805', supplier: 'شركة المصاعد المتحدة', project: 'أبراج الملقا السكنية', category: 'مصاعد', amount: 275000, status: 'pending' },
    ],
    highlights: [
      { label: 'مواد بناء', value: 795000, format: 'currency' },
      { label: 'مصاعد', value: 275000, format: 'currency' },
      { label: 'صيانة تكييف', value: 180000, format: 'currency' },
      { label: 'تأثيث', value: 96000, format: 'currency' },
    ],
  },

  documents: {
    tableTitleKey: 'demo.recentDocuments',
    actions: { primary: 'demo.action.upload' },
    rowActions: ['view', 'edit'],
    stats: [
      { labelKey: 'demo.stat.totalDocs', value: '1,284', hintKey: 'demo.hint.linkedToRecords' },
      { labelKey: 'demo.stat.expiringDocs', value: '14', hintKey: 'demo.hint.next30Days', tone: 'text-warn' },
      { labelKey: 'demo.stat.storage', value: '38 GB', hintKey: 'demo.hint.encrypted' },
    ],
    columns: [
      { field: 'name', labelKey: 'demo.field.document', type: 'primary', subField: 'related', subLabelKey: 'demo.field.related' },
      { field: 'category', labelKey: 'demo.field.category', type: 'muted' },
      { field: 'date', labelKey: 'demo.field.expiry', type: 'date' },
      { field: 'status', labelKey: 'demo.field.status', type: 'status' },
    ],
    rows: [
      { name: 'عقد إيجار موحد (منصة إيجار) — مكتب O-701', related: 'شركة مسارات التقنية', category: 'عقود إيجار', date: '2027-04-10', status: 'active' },
      { name: 'صك ملكية إلكتروني — أرض P-44', related: 'أراضي شمال الرياض', category: 'صكوك', date: null, status: 'approved' },
      { name: 'رخصة بناء — أبراج الملقا', related: 'أمانة منطقة الرياض', category: 'تراخيص', date: '2026-10-05', status: 'pending' },
      { name: 'شهادة إتمام البناء — سدرة النرجس', related: 'سدرة النرجس', category: 'تراخيص', date: null, status: 'approved' },
      { name: 'السجل التجاري — شركة مسارات التقنية', related: 'عميل', category: 'مستندات العملاء', date: '2026-09-30', status: 'expired' },
    ],
    highlights: [
      { label: 'عقود بيع وإيجار', value: 412, format: 'number' },
      { label: 'مستندات العملاء', value: 538, format: 'number' },
      { label: 'صكوك وتراخيص', value: 196, format: 'number' },
      { label: 'محاضر تسليم', value: 138, format: 'number' },
    ],
  },

  workflow: {
    actions: { primary: 'demo.action.newRule' },
    rowActions: ['view', 'edit', 'toggle'],
    stats: [
      { labelKey: 'demo.stat.activeWorkflows', value: '4', hintKey: 'demo.hint.activeNow', tone: 'text-ok' },
      { labelKey: 'demo.stat.runsToday', value: '342', hintKey: 'demo.hint.today' },
      { labelKey: 'demo.stat.successRate', value: '99.2%', hintKey: 'demo.hint.last30Days', tone: 'text-ok' },
    ],
    columns: [
      { field: 'name', labelKey: 'demo.field.rule', type: 'primary', subField: 'effect', subLabelKey: 'demo.field.effect' },
      { field: 'trigger', labelKey: 'demo.field.trigger', type: 'muted' },
      { field: 'status', labelKey: 'demo.field.status', type: 'status' },
    ],
    rows: [
      { name: 'توزيع العملاء المحتملين آلياً', effect: 'إسناد بالتناوب على مستشاري المبيعات', trigger: 'عميل محتمل جديد', status: 'active' },
      { name: 'اعتماد الخصم الاستثنائي', effect: 'تحويل لمدير المبيعات عند خصم أعلى من 5%', trigger: 'إصدار عرض سعر', status: 'active' },
      { name: 'تنبيه تجديد عقود الإيجار', effect: 'رسالة للمستأجر ومهمة للمسؤول', trigger: 'قبل 90 يوماً من الانتهاء', status: 'active' },
      { name: 'تذكير سداد الدفعات عبر SMS', effect: 'رسالة قبل 3 أيام ويوم الاستحقاق', trigger: 'دفعة مستحقة', status: 'active' },
      { name: 'فتح طلب صيانة من بوابة المستأجر', effect: 'إنشاء أمر عمل وتحديد الأولوية', trigger: 'بلاغ مستأجر', status: 'draft' },
    ],
    highlights: [
      { label: 'توزيع العملاء المحتملين', value: 128, format: 'number' },
      { label: 'تذكير السداد', value: 94, format: 'number' },
      { label: 'تنبيه التجديد', value: 61, format: 'number' },
      { label: 'اعتماد الخصم', value: 37, format: 'number' },
    ],
  },

  portals: {
    actions: { primary: 'demo.action.inviteUsers' },
    rowActions: ['view', 'edit'],
    stats: [
      { labelKey: 'demo.stat.clientPortals', value: '1,670', hintKey: 'demo.hint.activeNow' },
      { labelKey: 'demo.stat.ownerPortals', value: '148', hintKey: 'demo.hint.thisMonth' },
      { labelKey: 'demo.stat.selfServiceRequests', value: '73%', hintKey: 'demo.hint.viaPortal', tone: 'text-ok' },
    ],
    columns: [
      { field: 'name', labelKey: 'demo.field.portal', type: 'primary', subField: 'audience', subLabelKey: 'demo.field.audience' },
      { field: 'users', labelKey: 'demo.field.users', type: 'number' },
      { field: 'status', labelKey: 'demo.field.status', type: 'status' },
    ],
    rows: [
      { name: 'بوابة المشترين', audience: 'متابعة الدفعات والتسليم', users: 1240, status: 'active' },
      { name: 'بوابة المستأجرين', audience: 'سداد الإيجار وطلبات الصيانة', users: 430, status: 'active' },
      { name: 'بوابة الملاك والمستثمرين', audience: 'تقارير الأداء والتوزيعات', users: 148, status: 'active' },
      { name: 'بوابة الوسطاء', audience: 'تسجيل العملاء والعمولات', users: 210, status: 'active' },
      { name: 'بوابة الموردين', audience: 'أوامر الشراء والفواتير', users: 0, status: 'draft' },
    ],
    highlights: [
      { label: 'بوابة المشترين', value: 1240, format: 'number' },
      { label: 'بوابة المستأجرين', value: 430, format: 'number' },
      { label: 'بوابة الوسطاء', value: 210, format: 'number' },
      { label: 'بوابة الملاك والمستثمرين', value: 148, format: 'number' },
    ],
  },
};
