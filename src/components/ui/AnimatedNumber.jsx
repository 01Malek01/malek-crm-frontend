import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../utils/format';

/**
 * Counts up from 0 to `value` once on mount (and when `value` changes),
 * using an ease-out curve. Falls back to a static render when reduced-motion
 * is preferred.
 */
export default function AnimatedNumber({ value, format = formatNumber, duration = 700 }) {
  const [display, setDisplay] = useState(value);
  const raf = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReduced) {
      setDisplay(target);
      return undefined;
    }

    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(from + (target - from) * eased);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <span className="tabular-nums">{format(display)}</span>;
}
