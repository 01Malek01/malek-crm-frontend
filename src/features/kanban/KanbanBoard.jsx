import { useRef, useState } from 'react';
import { useLeads } from '../../hooks/lead.hooks';
import { PIPELINE_STAGES } from '../../config/constants';
import { LoadingState } from '../../components/ui/Spinner';
import PipelineColumn from './PipelineColumn';

export default function KanbanBoard({ onSelectLead }) {
  const { data: leads = [], isLoading } = useLeads();
  const draggingId = useRef(null);
  const [dropTarget, setDropTarget] = useState(null);

  const byStage = leads.reduce((acc, lead) => {
    const list = acc[lead.pipelineStage] || [];
    list.push(lead);
    acc[lead.pipelineStage] = list;
    return acc;
  }, {});

  const handleDragStart = (leadId) => {
    draggingId.current = leadId;
  };

  const handleDragEnd = () => {
    draggingId.current = null;
    setDropTarget(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {PIPELINE_STAGES.map((stage) => (
        <PipelineColumn
          key={stage.key}
          stage={stage}
          leads={byStage[stage.key] || []}
          isTarget={dropTarget === stage.key}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDescribeDrop={() => setDropTarget(stage.key)}
          onAbortDrop={() => setDropTarget(null)}
          onSelectLead={onSelectLead}
        />
      ))}
    </div>
  );
}