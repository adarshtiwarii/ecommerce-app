import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutoSlider({ total, config }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);
  const safeTotal = Math.max(Number(total) || 0, 0);
  const sliderConfig = config || {};

  const next = useCallback(() => {
    if (safeTotal <= 0) return;
    setCurrent(value => sliderConfig.loop ? (value + 1) % safeTotal : Math.min(value + 1, safeTotal - 1));
  }, [safeTotal, sliderConfig.loop]);

  const prev = useCallback(() => {
    if (safeTotal <= 0) return;
    setCurrent(value => sliderConfig.loop ? (value - 1 + safeTotal) % safeTotal : Math.max(value - 1, 0));
  }, [safeTotal, sliderConfig.loop]);

  const goTo = useCallback((index) => {
    if (safeTotal <= 0) return;
    setCurrent(Math.max(0, Math.min(index, safeTotal - 1)));
  }, [safeTotal]);

  const pause = useCallback(() => { pausedRef.current = true; }, []);
  const resume = useCallback(() => { pausedRef.current = false; }, []);

  useEffect(() => {
    if (!sliderConfig.autoPlay || safeTotal <= 1) return undefined;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) next();
    }, sliderConfig.interval);
    return () => clearInterval(timerRef.current);
  }, [next, safeTotal, sliderConfig.autoPlay, sliderConfig.interval]);

  useEffect(() => {
    if (current > safeTotal - 1) setCurrent(0);
  }, [current, safeTotal]);

  return { current, next, prev, goTo, pause, resume };
}
