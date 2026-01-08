
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialSeconds: number, onTimeUp?: () => void) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(() => setIsActive(true), []);
  const stop = useCallback(() => setIsActive(false), []);
  const reset = useCallback((newSeconds?: number) => {
    setSeconds(newSeconds ?? initialSeconds);
    setIsActive(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      onTimeUp?.();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, onTimeUp]);

  return { seconds, isActive, start, stop, reset, setSeconds };
};
