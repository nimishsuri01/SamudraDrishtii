import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Compass, 
  Wind, 
  Thermometer, 
  Fish, 
  Radio, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface ScienceOutreachModalProps {
  onNavigateChapter: (chapter: {
    variable: string;
    depthIdx: number;
    cameraPreset: 'overview' | 'oblique' | 'arabian' | 'bob' | 'eez';
  }) => void;
  onClose: () => void;
}

export const ScienceOutreachModal: React.FC<ScienceOutreachModalProps> = ({
  onNavigateChapter,
  onClose
}) => {
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);

  const CHAPTERS = [
    {
      title: "The Great Monsoon Current Reversal",
      tagline: "The only ocean on Earth that changes flow twice a year",
      icon: <Wind className="w-5 h-5 text-slate-300" />,
      variable: "velocity",
      depthIdx: 0, // surface
      cameraPreset: "arabian" as const,
      summary: "Unlike the Atlantic and Pacific oceans where surface currents flow in constant loops, the Indian Ocean experiences a dramatic reversal driven by the seasonal Indian Monsoon.",
      deepDive: "During the Southwest (Summer) Monsoon, ferocious southwesterly winds drive the Somali Current northward along East Africa at speeds exceeding 1.8 m/s (6.5 km/h) - faster than the Amazon river! This sweeps east across the southern tip of India. In the winter, the winds reverse direction, completely turning the currents around.",
      keyTakeaway: "This seasonal reversal influences India's rainfall patterns, fishery migrations, and ancient maritime trade routes like the spice trade."
    },
    {
      title: "The Mystery of the Ocean Thermocline",
      tagline: "Why the deep ocean is freezing cold under tropical sun",
      icon: <Compass className="w-5 h-5 text-slate-300" />,
      variable: "thetao",
      depthIdx: 2, // 20m
      cameraPreset: "overview" as const,
      summary: "Even on a scorching 40°C summer day in Chennai or Mumbai, the water just a few hundred meters below is colder than an ice refrigerator.",
      deepDive: "Solar radiation is absorbed within the top 20 to 50 meters of the sea (the Mixed Layer). Below this lies the 'Thermocline' - a dramatic boundary where temperature plummets from 29°C down to 12°C in a span of just 100 meters. Below 1000 meters, temperatures hover between 2°C and 4°C everywhere on Earth.",
      keyTakeaway: "The depth of the thermocline determines how easily tropical storms can cool the ocean or fuel themselves."
    },
    {
      title: "Upwelling: The Ocean's Nutrient Fountain",
      tagline: "How deep cold water fuels India's richest fisheries",
      icon: <Fish className="w-5 h-5 text-emerald-400" />,
      variable: "chl",
      depthIdx: 0, // surface chlorophyll
      cameraPreset: "arabian" as const,
      summary: "Off the coast of Kerala and Oman, an amazing physical phenomenon called coastal upwelling transforms blue ocean deserts into fertile marine pastures.",
      deepDive: "Because of the Earth's rotation (the Coriolis effect) and alongshore monsoon winds, surface water is pushed away from the coast. To replace it, deep, icy water rich in dissolved nitrates and phosphates surges upwards from 200m depth into sunlit surface waters. Microscopic plants (phytoplankton) bloom, turning the water emerald green and feeding billions of Indian oil sardines, mackerel, and tuna.",
      keyTakeaway: "INCOIS uses satellite chlorophyll and model upwelling to generate daily Potential Fishing Zone (PFZ) advisories for thousands of traditional fishermen."
    },
    {
      title: "The Robotic Fleet: How Argo Floats Work",
      tagline: "Autonomous yellow robots surveying 2,000 meters below",
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      variable: "so",
      depthIdx: 6, // 200m depth
      cameraPreset: "eez" as const,
      summary: "How can oceanographers measure water temperature and salinity across thousands of kilometers of stormy, inaccessible seas without ships?",
      deepDive: "Meet the Argo profiling float - a self-propelled, robotic ocean cylinder. Every 10 days, the float sinks to a 'parking depth' of 1000 meters, drifts with deep currents, then dives down to 2000 meters (1.2 miles deep). From there, it adjusts its buoyancy to rise slowly to the surface, recording high-resolution temperature and salinity data. At the surface, it transmits the data via satellites directly to INCOIS in Hyderabad!",
      keyTakeaway: "Over 4,000 Argo floats roam the global oceans today, with India maintaining a premier network across the Arabian Sea and Bay of Bengal."
    },
    {
      title: "Cyclones & Ocean Heat: Fuel for Superstorms",
      tagline: "Why the Bay of Bengal breeds explosive cyclones",
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      variable: "thetao",
      depthIdx: 3, // 50m
      cameraPreset: "bob" as const,
      summary: "The Bay of Bengal is one of the world's most active tropical cyclone breeding grounds. What gives these storms their destructive fury?",
      deepDive: "Cyclones are giant heat engines powered by evaporation from warm seawater. But strong winds normally churn up cold water from below, choking the storm. In the Bay of Bengal, fresh river water from the Ganges and Brahmaputra forms a light, buoyant 'lid' that prevents cold water from mixing upwards. A deep pool of water warmer than 26°C (Tropical Cyclone Heat Potential > 80 kJ/cm²) acts like high-octane rocket fuel.",
      keyTakeaway: "INCOIS 3D ocean heat models allow disaster management authorities to predict storm intensity days before landfall, saving thousands of lives."
    }
  ];

  const currentCh = CHAPTERS[activeChapterIdx];

  const applyChapterToScene = () => {
    onNavigateChapter({
      variable: currentCh.variable,
      depthIdx: currentCh.depthIdx,
      cameraPreset: currentCh.cameraPreset
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-[#005a9c]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-wide font-sans">
                  Samudra Vidyapeeth
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold font-mono">
                  Public Science &amp; Student Discovery Mode
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Interactive 3D Guided Stories of the Indian Ocean for Students, Citizens &amp; Policymakers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 hover:text-slate-900 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Chapter List + Right Interactive Reader */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chapter Selector */}
          <div className="w-72 border-r border-slate-200 bg-slate-50 p-3 flex flex-col gap-2 overflow-y-auto">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 font-bold">
              Oceanographic Chapters
            </span>
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.title}
                onClick={() => setActiveChapterIdx(idx)}
                className={`flex items-start gap-3 p-3 rounded-lg text-left transition cursor-pointer ${
                  activeChapterIdx === idx
                    ? 'bg-white border border-slate-300 text-slate-900 shadow-2xs font-bold'
                    : 'hover:bg-slate-100/70 text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{ch.icon}</div>
                <div>
                  <div className="text-xs font-bold leading-tight line-clamp-1">{ch.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{ch.tagline}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Chapter Reader */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                  Chapter {activeChapterIdx + 1} of {CHAPTERS.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">{currentCh.tagline}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-wide font-sans">
                {currentCh.title}
              </h3>

              <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                "{currentCh.summary}"
              </p>

              <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  The Science Behind the Waves
                </h4>
                <p>{currentCh.deepDive}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold text-emerald-950">Operational Value for Society: </span>
                  {currentCh.keyTakeaway}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Preset: {currentCh.cameraPreset.toUpperCase()}</span>
                <span>•</span>
                <span>Layer: {currentCh.variable}</span>
              </div>

              <button
                onClick={applyChapterToScene}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#005a9c] hover:bg-[#00477d] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <span>Navigate &amp; Explore in 3D Scene</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
