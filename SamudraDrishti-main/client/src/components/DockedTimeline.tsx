'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';

interface DockedTimelineProps {
  times: string[];
  currentTimeIdx: number;
  onSelectTimeIdx: (idx: number) => void;
  hoverInfo?: { lat: number; lon: number; depth: number; val: number | null } | null;
  units?: string;
}

export const DockedTimeline: React.FC<DockedTimelineProps> = ({
  times,
  currentTimeIdx,
  onSelectTimeIdx,
  hoverInfo,
  units = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isLoop, setIsLoop] = useState(true);

  useEffect(() => {
    if (!isPlaying || times.length <= 1) return;
    const interval = setInterval(() => {
      if (currentTimeIdx >= times.length - 1) {
        if (isLoop) {
          onSelectTimeIdx(0);
        } else {
          setIsPlaying(false);
        }
      } else {
        onSelectTimeIdx(currentTimeIdx + 1);
      }
    }, 1200 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, times.length, speed, isLoop, currentTimeIdx, onSelectTimeIdx]);

  return (
    <footer className="h-8.5 w-full bg-[#f8fafc] border-t border-slate-300 flex items-center justify-between px-3 text-xs text-slate-700 z-30 select-none">
      {/* Playback Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onSelectTimeIdx(currentTimeIdx > 0 ? currentTimeIdx - 1 : times.length - 1)}
          className="p-1 rounded-[2px] hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition cursor-pointer"
          title="Previous time step"
        >
          <SkipBack className="w-3 h-3" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-2 py-0.5 rounded-[2px] text-xs font-semibold transition flex items-center gap-1 cursor-pointer border shadow-2xs ${
            isPlaying
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
          }`}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current text-slate-700" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={() => onSelectTimeIdx(currentTimeIdx < times.length - 1 ? currentTimeIdx + 1 : 0)}
          className="p-1 rounded-[2px] hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition cursor-pointer"
          title="Next time step"
        >
          <SkipForward className="w-3 h-3" />
        </button>

        <button
          onClick={() => setIsLoop(!isLoop)}
          className={`p-1 rounded-[2px] text-[10px] ml-1 transition cursor-pointer ${
            isLoop ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
          title="Toggle repeat"
        >
          <Repeat className="w-3 h-3" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600 ml-1.5 font-medium">
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-[2px] px-1 py-0.5 text-slate-800 cursor-pointer focus:outline-none shadow-2xs"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1.0×</option>
            <option value={2}>2.0×</option>
            <option value={4}>4.0×</option>
          </select>
        </div>
      </div>

      {/* Center Timeline Scrubber */}
      <div className="flex items-center gap-2.5 flex-1 max-w-lg px-4">
        <span className="font-mono text-[11px] text-slate-600 font-semibold whitespace-nowrap">
          Step {currentTimeIdx + 1}/{times.length || 5}:
        </span>
        <div className="flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, times.length - 1)}
            step={1}
            value={currentTimeIdx}
            onChange={(e) => onSelectTimeIdx(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>
        <span className="font-mono text-xs text-slate-900 font-bold whitespace-nowrap">
          {times[currentTimeIdx] || `Day ${currentTimeIdx + 1}`}
        </span>
      </div>

      {/* Right: Unboxed Co-located Telemetry Status */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
        {hoverInfo ? (
          <div className="flex items-center gap-2 text-slate-800">
            <span>{hoverInfo.lat.toFixed(2)}°N, {hoverInfo.lon.toFixed(2)}°E</span>
            <span className="text-slate-400">•</span>
            <span>{hoverInfo.depth}m</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-950 font-bold">
              {hoverInfo.val !== null ? `${hoverInfo.val.toFixed(2)} ${units}` : 'Land'}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">
            Hover ocean for coordinates
          </span>
        )}
      </div>
    </footer>
  );
};
