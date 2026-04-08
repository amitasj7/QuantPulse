"use client";

import { memo, useRef, useEffect } from 'react';
import { IChartApi } from 'lightweight-charts';

interface ChartCanvasProps {
  chart: IChartApi | null;
  onCanvasReady?: (container: HTMLDivElement) => void;
}

export const ChartCanvas = memo(function ChartCanvas({ chart, onCanvasReady }: ChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && onCanvasReady) {
      onCanvasReady(containerRef.current);
    }
  }, [onCanvasReady]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
    />
  );
});

// Screenshot utility function
export const takeScreenshot = (
  container: HTMLDivElement | null,
  filename: string
): void => {
  if (!container) return;
  
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
