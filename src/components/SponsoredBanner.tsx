import React, { useState, useEffect } from 'react';
import { SPONSORED_ADS, AdBanner } from '../data/adNetworks';
import { ExternalLink, Sparkles, X, Info, Zap, ShieldCheck } from 'lucide-react';

interface SponsoredBannerProps {
  placement?: 'top-banner' | 'sidebar-card' | 'bottom-bar' | 'canvas-inline';
  compact?: boolean;
}

export const SponsoredBanner: React.FC<SponsoredBannerProps> = ({
  placement = 'top-banner',
  compact = false,
}) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showRewardToast, setShowRewardToast] = useState(false);

  useEffect(() => {
    // Rotate ads periodically
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % SPONSORED_ADS.length);
    }, 18000);
    return () => clearInterval(timer);
  }, []);

  const ad: AdBanner = SPONSORED_ADS[currentAdIndex];

  const handleAdClick = () => {
    setClickCount((c) => c + 1);
    setShowRewardToast(true);
    setTimeout(() => setShowRewardToast(false), 3500);
  };

  if (dismissed) {
    return (
      <div className="py-1 px-3 bg-neutral-900/60 border border-neutral-800 rounded-xl flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          100% Free Chrome Extension Supported by Verified Print Sponsors
        </span>
        <button
          onClick={() => setDismissed(false)}
          className="text-amber-400 hover:underline text-[10px] font-mono cursor-pointer"
        >
          Show Sponsor
        </button>
      </div>
    );
  }

  if (placement === 'canvas-inline') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-950 border border-neutral-800/80 p-3.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono text-neutral-950 shrink-0"
              style={{ backgroundColor: ad.accentColor }}
            >
              AD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-200">{ad.sponsorName}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  {ad.badgeText}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{ad.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAdClick}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-neutral-500 hover:text-neutral-300 transition-colors"
              title="Hide this banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showRewardToast && (
          <div className="absolute top-2 right-12 bg-emerald-500/90 text-neutral-950 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg font-mono animate-bounce">
            ✓ Sponsor support unlocked: High-Speed Print Renders!
          </div>
        )}
      </div>
    );
  }

  // Top header or sidebar banner
  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900/95 via-neutral-900/80 to-neutral-950 border border-amber-500/20 hover:border-amber-500/40 p-3 shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Ad Details */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              SPONSORED
            </span>
            <span className="text-[8px] font-mono text-neutral-500 mt-0.5">Keeps Ext Free</span>
          </div>

          <div className="h-7 w-px bg-neutral-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                {ad.sponsorName}
              </span>
              <span className="text-[10px] font-mono text-neutral-500 hidden md:inline">
                • {ad.metrics}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug line-clamp-1">
              {ad.tagline}
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={handleAdClick}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-102 transition-all cursor-pointer"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            title="Minimize ad (keeps extension 100% free)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showRewardToast && (
        <div className="absolute inset-0 bg-neutral-950/95 flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono font-semibold z-10 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Thanks for supporting our free Chrome Extension partners!
        </div>
      )}
    </div>
  );
};
