'use client';

import React from 'react';
import { 
  ArrowRight,
  Layers,
  Waves,
  Globe2,
  Radio,
  Compass,
  Database,
  Sparkles
} from 'lucide-react';

interface HeroSectionProps {
  onLaunchWorkstation: () => void;
  onOpenBrand: () => void;
  onOpenAdvisories: () => void;
  onOpenIngestion: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchWorkstation,
  onOpenBrand,
  onOpenAdvisories,
  onOpenIngestion
}) => {
  return (
    <section className="relative w-full pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* 1. Ambient Oceanic Atmospheric Glows (Matches the light, airy cyan/sky aesthetic) */}
      <div 
        className="absolute top-0 right-0 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] pointer-events-none rounded-full blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(186, 230, 254, 0.45) 0%, rgba(224, 242, 254, 0.25) 45%, rgba(255, 255, 255, 0) 70%)'
        }}
      />
      <div 
        className="absolute top-1/3 left-[-150px] w-[500px] h-[500px] pointer-events-none rounded-full blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(199, 210, 254, 0.4) 0%, rgba(240, 249, 255, 0.2) 50%, rgba(255, 255, 255, 0) 75%)'
        }}
      />

      {/* Subtle modern dot matrix canvas background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#2563eb 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Hero Copy, Badge, CTA & Metrics */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Main Headline: Ocean Intelligence Reimagined */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black text-slate-950 tracking-tight leading-[1.05] mb-6 font-sans">
              Ocean<br />
              Intelligence<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400">
                Reimagined
              </span>
            </h1>

            {/* Sub-headline / Paragraph */}
            <p className="text-slate-600 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-xl mb-8 sm:mb-10">
              Real-time 3D ocean digital twin platform combining high-resolution numerical models with autonomous in-situ observations across the North Indian Ocean.
            </p>

            {/* Action Buttons: Launch Interactive Demo & Watch Demo */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-10 sm:mb-12">
              <button
                onClick={onLaunchWorkstation}
                className="group flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#features"
                className="flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm sm:text-base shadow-xs transition-all cursor-pointer"
              >
                <span>Explore Capabilities</span>
                <Layers className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Live Metrics Row: 14+ Platforms, 2M+ EEZ, 2000m Depth */}
            <div className="w-full max-w-lg grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 tracking-tight">14+</div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Autonomous Fleet</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 tracking-tight">2M+</div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">km² EEZ Boundary</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 tracking-tight">2000m</div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Depth Soundings</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: The Isometric Floating Ocean Twin Graphic Card */}
          <div className="lg:col-span-5 flex items-center justify-center relative lg:pl-4">
            
            {/* Ambient Backlight Glow */}
            <div className="absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] bg-gradient-to-tr from-blue-300/30 via-sky-200/40 to-cyan-100/30 rounded-full blur-3xl -z-10" />

            {/* Outer Layered Outline Frame (Double wireframe border) */}
            <div className="relative p-3 rounded-[36px] border border-blue-200/50 shadow-2xl shadow-blue-500/10 transform rotate-3 sm:rotate-6 hover:rotate-2 transition-all duration-500 ease-out group">
              
              {/* Secondary Outline Frame */}
              <div className="relative rounded-[28px] border border-blue-200/80 bg-gradient-to-br from-white/90 via-sky-50/40 to-blue-50/60 backdrop-blur-md p-8 sm:p-12 w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] flex flex-col items-center justify-center overflow-hidden">
                
                {/* Floating ambient coordinate nodes & particles */}
                <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-blue-500/80 animate-ping" />
                <div className="absolute top-12 left-10 w-1.5 h-1.5 rounded-full bg-blue-600" />
                <div className="absolute bottom-16 right-10 w-2 h-2 rounded-full bg-sky-500" />
                <div className="absolute top-20 right-14 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <div className="absolute bottom-10 left-16 text-[10px] font-mono text-blue-400/80 tracking-widest uppercase">
                  WGS84 • 13°N 80°E
                </div>

                {/* Concentric subtle radar circles */}
                <div className="absolute inset-8 rounded-full border border-blue-100/60 pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-blue-200/40 pointer-events-none" />

                {/* Central Floating Orb: Ocean Twin */}
                <div 
                  onClick={onLaunchWorkstation}
                  className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#0284c7] via-[#0284c7] to-[#005a9c] text-white shadow-2xl shadow-blue-600/40 flex flex-col items-center justify-center p-4 cursor-pointer transform group-hover:scale-108 transition-all duration-300 active:scale-95"
                >
                  {/* Subtle inner top highlight */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

                  {/* Ocean Twin Wave Icon */}
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-1.5 backdrop-blur-xs">
                    <Waves className="w-5 h-5 text-white animate-pulse" />
                  </div>

                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-white drop-shadow-xs">
                    Ocean Twin
                  </span>

                  <span className="text-[10px] text-blue-100/90 font-mono mt-0.5 font-medium">
                    3D • 4D Live
                  </span>
                </div>

                {/* Click to inspect badge */}
                <div className="absolute bottom-4 z-10 text-[11px] font-medium text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Click to launch digital twin</span>
                  <ArrowRight className="w-3 h-3 text-blue-600" />
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
