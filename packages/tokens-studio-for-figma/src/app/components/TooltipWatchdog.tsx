import { useEffect } from 'react';

// Radix Tooltip dispatches this event on `document` whenever any tooltip opens; every
// mounted tooltip listens for it and closes itself so only one can ever be visible. We
// reuse it as a force-close for tooltips that have become stranded — e.g. the trigger
// unmounted while hovered (no pointerleave fires), focus was restored to a hidden
// trigger after a modal closed, or a long main-thread task blocked the pointer handlers.
// In all of those cases the tooltip stays painted with no path back to closed; this
// watchdog gives it one, tied to the next pointer move or scroll.
const TOOLTIP_OPEN_EVENT = 'tooltip.open';
const OPEN_TRIGGER_SELECTOR = '[data-state="instant-open"], [data-state="delayed-open"]';
const POINTER_THROTTLE_MS = 150;

function hasOpenTooltip() {
  return document.querySelector('[role="tooltip"]') as HTMLElement | null;
}

function closeOpenTooltips() {
  if (hasOpenTooltip()) {
    document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN_EVENT));
  }
}

export default function TooltipWatchdog() {
  useEffect(() => {
    let lastPointerCheck = 0;

    const handlePointerMove = (event: PointerEvent) => {
      const now = Date.now();
      if (now - lastPointerCheck < POINTER_THROTTLE_MS) return;
      lastPointerCheck = now;

      const openTooltip = hasOpenTooltip();
      if (!openTooltip) return;

      // Keep the tooltip while the pointer is genuinely over its trigger or the tooltip
      // content itself; close it once the pointer has moved away and nothing reopened it.
      const target = event.target as Element | null;
      const overTrigger = target?.closest(OPEN_TRIGGER_SELECTOR);
      const overTooltip = target ? openTooltip.contains(target) : false;
      if (!overTrigger && !overTooltip) {
        closeOpenTooltips();
      }
    };

    window.addEventListener('scroll', closeOpenTooltips, { capture: true, passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', closeOpenTooltips, { capture: true } as EventListenerOptions);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return null;
}
