
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className,
  duration = 1000,
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    
    const animate = (timestamp: number) => {
      if (startTime.current === null) {
        startTime.current = timestamp;
      }
      
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      setDisplayValue(progress * value);
      
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);
  
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
