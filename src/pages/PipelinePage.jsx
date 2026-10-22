import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import KanbanBoard from '../features/kanban/KanbanBoard';
import LeadFormModal from '../features/leads/LeadFormModal';

export default function PipelinePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t('pipeline.title')}
        subtitle={t('pipeline.subtitle')}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> {t('leads.newLead')}
          </Button>
        }
      />

      <KanbanBoard onSelectLead={(lead) => navigate(`/leads/${lead._id}`)} />

      <LeadFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
