import { Progress } from '../ui/Progress';

export function AiScore({ score = 0, className }) {
  const value = Number.isFinite(score) ? Math.round(score) : 0;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Progress value={value} className="w-16" />
      <span className="text-xs font-semibold tabular-nums text-primary">{value}</span>
    </div>
  );
}