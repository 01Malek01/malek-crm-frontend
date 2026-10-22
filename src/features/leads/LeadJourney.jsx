import { Stepper } from '../../components/ui/Stepper';
import { useLanguage } from '../../i18n/LanguageContext';
import { STAGE_KEYS } from '../../config/constants';

const FLOW = STAGE_KEYS.filter((s) => s !== 'LOST');

/** Pipeline progress for one customer; LOST marks the reached stage as blocked. */
export default function LeadJourney({ stage }) {
  const { t } = useLanguage();
  const lost = stage === 'LOST';
  const currentIndex = lost ? -1 : FLOW.indexOf(stage);

  const steps = FLOW.map((key, index) => {
    let state = 'upcoming';
    if (stage === 'WON' || index < currentIndex) state = 'done';
    else if (index === currentIndex) state = 'current';
    return { key, label: t(`stage.${key}`), hint: t(`stageHint.${key}`), state };
  });

  if (lost) {
    steps.push({ key: 'LOST', label: t('stage.LOST'), hint: t('stageHint.LOST'), state: 'blocked' });
  }

  return <Stepper steps={steps} />;
}
