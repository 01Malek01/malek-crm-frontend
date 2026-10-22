import { useEffect, useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useAttachConversation } from '../../hooks/lead.hooks';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiError } from '../../utils/format';

/**
 * Attaches a WhatsApp conversation to a lead (paste the transcript or upload the
 * exported `.txt`). The backend re-scores the lead from the chat signals.
 */
export default function ConversationModal({ open, onClose, lead }) {
  const { t } = useLanguage();
  const toast = useToast();
  const attach = useAttachConversation();
  const [transcript, setTranscript] = useState('');
  const [source, setSource] = useState('PASTED');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTranscript('');
      setSource('PASTED');
      setFileName('');
    }
  }, [open]);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTranscript(String(reader.result || ''));
      setSource('WHATSAPP_EXPORT');
      setFileName(file.name);
    };
    reader.readAsText(file, 'utf-8');
  };

  const submit = () => {
    if (!transcript.trim()) {
      toast.error(t('conversation.required'));
      return;
    }
    attach.mutate(
      { id: lead._id, payload: { transcript, source } },
      {
        onSuccess: () => {
          toast.success(t('conversation.success'));
          onClose();
        },
        onError: (err) => toast.error(apiError(err, t('conversation.failed'))),
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={t('conversation.title')} description={lead?.clientName} size="lg">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">{t('conversation.hint')}</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            <FileUp className="size-4" /> {t('conversation.upload')}
          </Button>
          <input ref={fileRef} type="file" accept=".txt,text/plain" className="hidden" onChange={onFile} />
          {fileName && (
            <span className="truncate text-xs text-muted" dir="ltr">
              {fileName}
            </span>
          )}
        </div>
        <Textarea
          rows={10}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setSource('PASTED');
            setFileName('');
          }}
          placeholder={t('conversation.placeholder')}
        />
        <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={submit} disabled={attach.isPending}>
            {attach.isPending ? t('common.saving') : t('conversation.submit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
