'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Compass, 
  Layers, 
  Radio, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

interface BrandModalProps {
  onClose: () => void;
}

export const BrandModal: React.FC<BrandModalProps> = ({ onClose }) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopy = (path: string, label: string) => {
    navigator.clipboard.writeText(window.location.origin + path);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const ASSETS = [
    {
      name: 'Full Vector Logo (Horizontal)',
      file: '/logo.svg',
      format: 'SVG (Scalable Vector)',
      useCase: 'Primary website header, presentations, publication covers',
      preview: '/logo.svg'
    },
    {
      name: 'Official Emblem Mark (Square)',
      file: '/logo-mark.svg',
      format: 'SVG (Scalable Vector)',
      useCase: 'App icons, telemetry marks, social avatars, watermarks',
      preview: '/logo-mark.svg'
    },
    {
      name: 'Vector Favicon',
      file: '/favicon.svg',
      format: 'SVG (Scalable Vector)',
      useCase: 'Browser tabs, bookmarks, high-DPI displays',
      preview: '/favicon.svg'
    },
    {
      name: 'Standard Multi-Resolution Favicon',
      file: '/favicon.ico',
      format: 'ICO (16x16, 32x32, 48x48)',
      useCase: 'Legacy browsers, Windows shortcuts, bookmarks',
      preview: '/favicon.svg'
    },
    {
      name: 'Apple Touch Icon',
      file: '/apple-touch-icon.png',
      format: '180x180 PNG',
      useCase: 'iOS Home Screen bookmarks, iPadOS shortcuts',
      preview: '/apple-touch-icon.png'
    },
    {
      name: 'Master High-Resolution Emblem',
      file: '/logo-512.png',
      format: '512x512 High-Res PNG',
      useCase: 'Print reports, raster graphics, splash screens',
      preview: '/logo-512.png'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img src="/logo-mark.svg" alt="SamudraDrishti Mark" className="w-full h-full object-contain filter drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-wide font-sans">
                  SamudraDrishti
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 uppercase tracking-wider font-semibold">
                  Official Brand &amp; Favicon Identity
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                National 3D Ocean Digital Twin &amp; Decision-Support System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          {/* Main Logo Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Full Horizontal Logo Card */}
            <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-semibold">
                    Primary Horizontal Brand Logo
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Vector SVG • 680x140</span>
                </div>
                <div className="w-full py-6 px-4 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <img src="/logo.svg" alt="SamudraDrishti Full Logo" className="w-full max-w-md object-contain" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500">
                  Precision typography and oceanographic crest mark
                </span>
                <a
                  href="/logo.svg"
                  download="samudradrishti-logo.svg"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#005a9c] hover:bg-[#00487c] text-white font-medium text-[11px] transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </a>
              </div>
            </div>

            {/* Emblem Mark & Favicon Preview */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-700 font-semibold">
                    Official Emblem Mark
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">256x256 Vector</span>
                </div>
                <div className="py-4 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center gap-3">
                  <div className="relative group">
                    <img 
                      src="/logo-mark.svg" 
                      alt="Emblem Mark" 
                      className="w-24 h-24 object-contain" 
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    Nautical Compass Rose &amp; Bathymetry
                  </span>
                </div>
              </div>

              {/* Simulated Browser Tab */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                  Browser Tab Favicon Simulation
                </span>
                <div className="h-8 bg-slate-200 rounded-t-lg border-t border-x border-slate-300 flex items-center px-3 gap-2 w-full">
                  <img src="/favicon.svg" alt="Favicon" className="w-4 h-4 object-contain" />
                  <span className="text-[11px] text-slate-800 truncate font-sans font-medium">
                    SamudraDrishti | 3D Ocean Digital Twin...
                  </span>
                  <X className="w-3 h-3 text-slate-400 ml-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Design Philosophy & Symbolism */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#005a9c]" />
              Institutional Identity &amp; Oceanographic Symbolism
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                  <Compass className="w-4 h-4 text-[#005a9c]" />
                  <span>Compass Rose</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Precision 8-point faceted compass star indicating True North, honoring mariners and oceanographic research expeditions.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                  <Layers className="w-4 h-4 text-[#005a9c]" />
                  <span>Azimuth Dial</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Calibrated 36-tick geodetic ring aligned to WGS84 and the North Indian Ocean Exclusive Economic Zone (EEZ).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                  <Layers className="w-4 h-4 text-[#005a9c]" />
                  <span>Bathymetric Isobaths</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sub-surface depth contours representing continental shelf (200m), slope (1000m), and abyssal trenches (2000m).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                  <Radio className="w-4 h-4 text-amber-600" />
                  <span>Telemetry Beacon</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Acoustic sensor core with golden telemetry pulse representing real-time Argo profiling floats, underwater gliders, and buoys.
                </p>
              </div>
            </div>
          </div>

          {/* Downloadable Brand Assets Inventory Table */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Asset Package Downloads
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">
                Available in /public &amp; /src/app
              </span>
            </h3>

            <div className="space-y-2">
              {ASSETS.map((asset) => (
                <div 
                  key={asset.file}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                      <img src={asset.preview} alt={asset.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{asset.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {asset.format}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{asset.useCase}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(asset.file, asset.file)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 transition cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === asset.file ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        'Copy URL'
                      )}
                    </button>
                    <a
                      href={asset.file}
                      download={asset.file.split('/').pop()}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-[#005a9c] hover:bg-[#00487c] text-[11px] text-white font-medium transition shadow-xs cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-white" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Favicon active in RootLayout metadata &amp; HTML head</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition shadow-xs"
          >
            Close Identity Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
