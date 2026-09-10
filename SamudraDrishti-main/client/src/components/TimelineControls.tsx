import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, Repeat } from 'lucide-react';

interface TimelineControlsProps {
  times: string[];
  currentTimeIdx: number;
  onSelectTimeIdx: (idx: number) => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  times,
  currentTimeIdx,
  onSelectTimeIdx
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isLoop, setIsLoop] = useState(true);

  // Playback timer
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
    }, 1400 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, times.length, speed, isLoop, currentTimeIdx, onSelectTimeIdx]);

  const stepBackward = () => {
    onSelectTimeIdx(currentTimeIdx > 0 ? currentTimeIdx - 1 : times.length - 1);
  };

  const stepForward = () => {
    onSelectTimeIdx(currentTimeIdx < times.length - 1 ? currentTimeIdx + 1 : 0);
  };

  return (
    <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-4 text-slate-200 shadow-2xl">
      {/* Date / Time Display */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700/80">
        <Clock className="w-4 h-4 text-cyan-400" />
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Model Forecast Time</div>
          <div className="text-xs font-bold text-cyan-300 font-mono">
            {times[currentTimeIdx] || `Step ${currentTimeIdx + 1}`}
          </div>
        </div>
      </div>

      {/* Play / Pause / Step Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={stepBackward}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Previous Time Step"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-xl transition ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-cyan-900/50'
          }`}
          title={isPlaying ? 'Pause Animation' : 'Play 4D Time Animation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
        </button>

        <button
          onClick={stepForward}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Next Time Step"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline Slider */}
      <div className="flex items-center gap-2 flex-1 min-w-[220px]">
        <input
          type="range"
          min={0}
          max={Math.max(0, times.length - 1)}
          step={1}
          value={currentTimeIdx}
          onChange={(e) => onSelectTimeIdx(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
          {currentTimeIdx + 1} / {times.length || 1}
        </span>
      </div>

      {/* Playback Options */}
      <div className="flex items-center gap-2 pl-3 border-l border-slate-700/80">
        <button
          onClick={() => setIsLoop(!isLoop)}
          className={`p-1.5 rounded-lg text-xs transition ${
            isLoop ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Loop"
        >
          <Repeat className="w-3.5 h-3.5" />
        </button>

        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1.0x</option>
          <option value={2}>2.0x</option>
          <option value={4}>4.0x</option>
        </select>
      </div>
    </div>
  );
};
