"use client";
import { useEffect, useRef, useState } from "react";

interface LoadingBarProps {
  progress: number;
  onComplete?: () => void;
}

export default function LoadingBar({ progress, onComplete }: LoadingBarProps) {
  const [displayed, setDisplayed] = useState(0);
  const targetRef = useRef(progress);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    targetRef.current = progress;
  }, [progress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let raf = 0;
    let current = 0;
    let done = false;
    const tick = () => {
      const target = targetRef.current;
      current += (target - current) * 0.08;
      const snapped =
        target >= 1 && Math.abs(1 - current) < 0.005 ? 1 : current;
      setDisplayed(snapped);
      if (snapped >= 1 && !done) {
        done = true;
        onCompleteRef.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black">
      <div className="w-48 h-px bg-white/20 overflow-hidden">
        <div
          className="h-full bg-white"
          style={{ width: `${displayed * 100}%` }}
        />
      </div>
    </div>
  );
}
