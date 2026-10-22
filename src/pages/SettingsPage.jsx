import { useState } from 'react';
import { KeyRound, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useChangePassword, useCreateUser, useUsers } from '../hooks/user.hooks';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RoleBadge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { LoadingState } from '../components/ui/Spinner';
import { FormModal, SummaryRow } from '../components/common/FormModal';
import { MAX_DISCOUNT_PCT, RETT_RATE, ROLES, VAT_RATE } from '../config/constants';
import { apiError } from '../utils/format';

export default function SettingsPage() {
  const { user, isManager, isAdmin } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const { data: users = [], isLoading } = useUsers();
  const changePassword = useChangePassword();
  const createUser = useCreateUser();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const onChangePassword = ({ currentPassword, newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.passwordMismatch'));
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success(t('settings.passwordChanged'));
          setPasswordOpen(false);
        },
        onError: (err) => toast.error(err?.response?.status === 400 ? t('settings.passwordWrong') : apiError(err, t('settings.passwordFailed'))),
      }
    );
  };

  const onInvite = (values) =>
    createUser.mutate(values, {
      onSuccess: (created) => {
        toast.success(t('settings.memberAdded', { name: created.name }));
        setInviteOpen(false);
      },
      onError: (err) => toast.error(apiError(err, t('settings.memberFailed'))),
    });

  return (
    <div className="space-y-4">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-ink">{t('settings.account')}</h3>
          </CardHeader>
          <CardBody className="divide-y divide-line/70">
            <SummaryRow label={t('settings.signedInAs')} value={user?.name} />
            <SummaryRow label={t('settings.email')} value={user?.email} />
            <SummaryRow label={t('settings.role')} value={<RoleBadge role={user?.role} />} />
            <SummaryRow label={t('settings.privileges')} value={isManager ? t('settings.manageAll') : t('settings.manageAssigned')} />
            <div className="pt-3">
              <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
                <KeyRound className="size-4" /> {t('settings.changePassword')}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-ink">{t('settings.policies')}</h3>
          </CardHeader>
          <CardBody className="divide-y divide-line/70">
            <SummaryRow label={t('settings.discountAgent')} value={`${MAX_DISCOUNT_PCT.AGENT}%`} />
            <SummaryRow label={t('settings.discountManager')} value={`${MAX_DISCOUNT_PCT.SALES_MANAGER}%`} />
            <SummaryRow label={t('taxType.RETT')} value={`${RETT_RATE}%`} />
            <SummaryRow label={t('settings.vatCommercial')} value={`${VAT_RATE}%`} />
            <SummaryRow label={t('settings.approvalRule')} value={t('settings.approvalRuleValue')} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-ink">{t('settings.team')}</h3>
            <p className="text-xs text-muted">{t('settings.teamHint')}</p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" /> {t('settings.invite')}
            </Button>
          )}
        </CardHeader>
        {isLoading ? (
          <LoadingState />
        ) : (
          <DataTable
            rowKey="id"
            columns={[
              { field: 'name', labelKey: 'settings.colName', type: 'primary', subField: 'email' },
              { field: 'phone', labelKey: 'settings.colPhone', render: (u) => <span dir="ltr" className="text-muted">{u.phone || '—'}</span> },
              { field: 'role', labelKey: 'settings.role', render: (u) => <RoleBadge role={u.role} /> },
            ]}
            rows={users}
          />
        )}
      </Card>

      <FormModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title={t('settings.changePassword')}
        fields={[
          { name: 'currentPassword', label: t('settings.currentPassword'), type: 'password', required: true, span: 2 },
          { name: 'newPassword', label: t('settings.newPassword'), type: 'password', required: true, hint: t('settings.passwordHint') },
          { name: 'confirmPassword', label: t('settings.confirmPassword'), type: 'password', required: true },
        ]}
        defaultValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        submitLabel={t('settings.changePassword')}
        isPending={changePassword.isPending}
        onSubmit={onChangePassword}
      />

      <FormModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t('settings.invite')}
        description={t('settings.inviteHint')}
        fields={[
          { name: 'name', label: t('settings.colName'), required: true, span: 2 },
          { name: 'email', label: t('settings.email'), required: true, placeholder: 'name@company.sa' },
          { name: 'phone', label: t('settings.colPhone'), placeholder: '+966 5X XXX XXXX' },
          { name: 'role', label: t('settings.role'), type: 'select', required: true, options: Object.values(ROLES).map((r) => ({ value: r, label: t(`role.${r}`) })) },
          { name: 'password', label: t('settings.tempPassword'), type: 'password', required: true, hint: t('settings.passwordHint') },
        ]}
        defaultValues={{ name: '', email: '', phone: '', role: ROLES.AGENT, password: '' }}
        submitLabel={t('settings.invite')}
        isPending={createUser.isPending}
        onSubmit={onInvite}
      />
    </div>
  );
}
