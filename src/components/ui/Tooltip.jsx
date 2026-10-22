import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

/**
 * Lightweight hover/focus tooltip rendered in a portal so it is never clipped by
 * table overflow. `content` is a node; position auto-flips below/above the trigger.
 */
export function Tooltip({ content, children, side = 'bottom', className, contentClassName }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  const show = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 272;
    const gap = 8;
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 8), window.innerWidth - width - 8);
    const placeBelow = side === 'bottom' ? true : rect.top < 96;
    setPos({
      left,
      top: placeBelow ? rect.bottom + gap : rect.top - gap,
      flip: !placeBelow,
    });
  };

  const hide = () => setPos(null);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
        className={cn('inline-flex', className)}
      >
        {children}
      </span>
      {pos &&
        createPortal(
          <div
            role="tooltip"
            className={cn('pointer-events-none fixed z-50 w-[272px]', contentClassName)}
            style={{ left: pos.left, top: pos.top, transform: pos.flip ? 'translateY(-100%)' : undefined }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
