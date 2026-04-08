"use client";

import { memo } from 'react';
import { Crosshair, TrendingUp, PenTool, Type, Ruler, ZoomIn, ZoomOut, Magnet, RotateCcw, Trash2 } from 'lucide-react';

interface ChartSidebarProps {
  activeTool: string;
  magnetEnabled: boolean;
  onToolSelect: (tool: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleMagnet: () => void;
}

const TOOLS = [
  { id: 'crosshair', icon: Crosshair, label: 'Crosshair' },
  { id: 'tracking', icon: TrendingUp, label: 'Trend Line' },
  { id: 'draw', icon: PenTool, label: 'Brush / Draw' },
  { id: 'text', icon: Type, label: 'Text Annotation' },
  { id: 'divider', icon: null, label: '' },
  { id: 'ruler', icon: Ruler, label: 'Price / Time Measure' },
  { id: 'zoomin', icon: ZoomIn, label: 'Zoom In' },
  { id: 'zoomout', icon: ZoomOut, label: 'Zoom Out' },
  { id: 'magnet', icon: Magnet, label: 'Magnet' },
  { id: 'reset', icon: RotateCcw, label: 'Reset / Fit All' },
  { id: 'divider2', icon: null, label: '' },
  { id: 'delete', icon: Trash2, label: 'Clear All Drawings' },
];

export const ChartSidebar = memo(function ChartSidebar({
  activeTool,
  magnetEnabled,
  onToolSelect,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleMagnet,
}: ChartSidebarProps) {
  const handleToolAction = (toolId: string) => {
    switch (toolId) {
      case 'zoomin':
        onZoomIn();
        break;
      case 'zoomout':
        onZoomOut();
        break;
      case 'reset':
        onReset();
        break;
      case 'magnet':
        onToggleMagnet();
        break;
      case 'delete':
        onToolSelect('crosshair');
        onReset();
        break;
      default:
        onToolSelect(toolId);
    }
  };

  return (
    <div className="w-12 border-r border-border bg-background/30 flex flex-col items-center py-3 gap-1 shrink-0 z-20 overflow-y-auto custom-scrollbar">
      {TOOLS.map((tool) => {
        if (tool.id.startsWith('divider')) {
          return <div key={tool.id} className="w-6 h-px bg-border my-1" />;
        }

        const Icon = tool.icon!;
        const isActive = activeTool === tool.id;
        const isMagnet = tool.id === 'magnet';
        const isDelete = tool.id === 'delete';

        return (
          <button
            key={tool.id}
            onClick={() => handleToolAction(tool.id)}
            className={`p-2 rounded-md transition-all ${
              isActive
                ? 'text-bullish bg-bullish/10 ring-1 ring-bullish/20'
                : isMagnet && magnetEnabled
                  ? 'text-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500/20'
                  : isDelete
                    ? 'text-text-secondary hover:text-bearish hover:bg-bearish/10'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface'
            }`}
            title={isMagnet ? `Magnet ${magnetEnabled ? 'ON' : 'OFF'}` : tool.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
});
