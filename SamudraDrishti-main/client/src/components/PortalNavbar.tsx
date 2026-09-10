'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  ExternalLink, 
  Menu, 
  X,
  Database,
  Layers,
  Radio,
  ShieldAlert
} from 'lucide-react';

interface PortalNavbarProps {
  onLaunchWorkstation: () => void;
  onOpenIngestion: () => void;
  onOpenTransect: () => void;
  onOpenAdvisories: () => void;
  onOpenBrand: () => void;
  isWorkstationFullscreen: boolean;
  onToggleFullscreenWorkstation: () => void;
}

export const PortalNavbar: React.FC<PortalNavbarProps> = ({
  onLaunchWorkstation,
  onOpenIngestion,
  onOpenTransect,
  onOpenAdvisories,
  onOpenBrand,
  isWorkstationFullscreen,
  onToggleFullscreenWorkstation
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 select-none bg-white/95 border-b border-slate-100 backdrop-blur-md ${
      scrolled 
        ? 'py-3 shadow-xs' 
        : 'py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* 1. Left: Brand Identity (Samudra Drishti) */}
        <div 
          onClick={onOpenBrand}
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          title="Samudra Drishti • 3D Ocean Intelligence"
        >
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 transition duration-200 group-hover:scale-105">
            <img 
              src="/logo-mark.svg" 
              alt="SamudraDrishti Crest" 
              className="w-full h-full object-contain filter drop-shadow-xs" 
            />
          </div>

          <div className="flex items-baseline">
            <span className="font-bold text-blue-600 text-lg sm:text-xl tracking-tight">
              Samudra
            </span>
            <span className="font-bold text-slate-950 text-lg sm:text-xl tracking-tight ml-1.5">
              Drishti
            </span>
          </div>
        </div>

        {/* 2. Center: Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
          <a 
            href="#features" 
            className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            Features
          </a>
          <a 
            href="#architecture" 
            className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            Architecture
          </a>
          <a 
            href="#impact" 
            className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            Impact
          </a>
          <a 
            href="#mandates" 
            className="hover:text-blue-600 transition-colors py-1 cursor-pointer"
          >
            Mandates
          </a>
          <button
            onClick={onOpenIngestion}
            className="hover:text-blue-600 transition-colors py-1 cursor-pointer text-left"
          >
            Data Ingestion
          </button>
          <a 
            href="/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors py-1 flex items-center gap-1"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>

        {/* 3. Right: Launch App Action Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onLaunchWorkstation}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Launch App</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer md:hidden flex-shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex flex-col gap-3 text-sm text-slate-700 shadow-lg">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 hover:text-blue-600 font-medium transition"
          >
            Features
          </a>
          <a 
            href="#architecture" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 hover:text-blue-600 font-medium transition"
          >
            Architecture
          </a>
          <a 
            href="#impact" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 hover:text-blue-600 font-medium transition"
          >
            Impact
          </a>
          <a 
            href="#mandates" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 hover:text-blue-600 font-medium transition"
          >
            Mandates
          </a>
          <button 
            onClick={() => { setMobileMenuOpen(false); onOpenIngestion(); }}
            className="text-left py-1.5 hover:text-blue-600 font-medium transition cursor-pointer"
          >
            Data Ingestion
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); onOpenAdvisories(); }}
            className="text-left py-1.5 hover:text-blue-600 font-medium transition cursor-pointer"
          >
            Ocean Hazard Advisories
          </button>
          <a 
            href="/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="py-1.5 text-slate-600 hover:text-blue-600 font-medium transition flex items-center gap-1"
          >
            <span>OpenAPI Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => { setMobileMenuOpen(false); onLaunchWorkstation(); }}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-center shadow-xs"
            >
              Launch 3D Explorer
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
