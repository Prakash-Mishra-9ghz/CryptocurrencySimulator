import { useEffect, useRef, useState } from "react";

/**
 * Tweens numeric value changes over ~600ms rather than snapping.
 * This is the app's one deliberate motion moment (portfolio value,
 * wallet balance, prices updating after a trade) — nothing else in
 * the app animates on scroll or hover.
 */
export default function AnimatedNumber({ value, format }) {
  const [displayValue, setDisplayValue] = useState(value ?? 0);
  const frameRef = useRef(null);
  const fromRef = useRef(value ?? 0);

  useEffect(() => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return;
    }
    const from = fromRef.current;
    const to = value;
    const duration = 600;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span>—</span>;
  }

  return <span className="tabular-nums">{format ? format(displayValue) : displayValue}</span>;
}
