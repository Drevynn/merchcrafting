import React, { useState } from 'react';
import { Sparkles, Camera, Lightbulb, Volume2, VolumeX, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { ProductItem, ProductColor, PrintTechnique, LogoTransform } from '../types/merch';

interface SharonProducerBarProps {
  product: ProductItem;
  color: ProductColor;
  technique: PrintTechnique;
  transform: LogoTransform;
  onApplySharonStreetwearPass: () => void;
  onOpenVirtualTryOn: () => void;
  onOpenSharonAdvisor: () => void;
}

export const SharonProducerBar: React.FC<SharonProducerBarProps> = ({
  product,
  color,
  technique,
  transform,
  onApplySharonStreetwearPass,
  onOpenVirtualTryOn,
  onOpenSharonAdvisor,
}) => {
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  const speak = (msg: string) => {
    if (!isVoiceActive || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(msg);
    utt.rate = 1.05;
    window.speechSynthesis.speak(utt);
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/70 via-neutral-900 to-indigo-950/70 border border-purple-800/40 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Producer Profile & Live Advice */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center font-bold text-amber-300 font-mono text-xs">
              SS
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-neutral-950" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-100 font-mono tracking-tight">
              SHARON STERLING
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Executive Merch Producer
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Free • Ad-Supported
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-0.5 italic">
            "Targeting retail? This {color.name} {product.title} has strong margins. Let’s do a live virtual fit with MediaPipe."
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Voice Toggle */}
        <button
          onClick={() => {
            const next = !isVoiceActive;
            setIsVoiceActive(next);
            if (next) speak("Sharon online! All features are 100% free thanks to our print sponsors.");
          }}
          title={isVoiceActive ? "Mute Sharon voice" : "Enable Sharon audio commentary"}
          className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
            isVoiceActive
              ? 'bg-purple-500/20 border-purple-500 text-purple-300'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {isVoiceActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="font-mono text-[11px] hidden sm:inline">{isVoiceActive ? 'Voice: On' : 'Voice: Off'}</span>
        </button>

        {/* Streetwear Optimization Pass */}
        <button
          onClick={() => {
            onApplySharonStreetwearPass();
            speak("Streetwear placement locked! Adjusted scale to 90% and nudged chest center.");
          }}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sharon's Ratio Pass</span>
        </button>

        {/* MediaPipe AR Virtual Try-On */}
        <button
          onClick={onOpenVirtualTryOn}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-950/60 transition-all hover:scale-102 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live AR Try-On (MediaPipe)</span>
        </button>

        {/* Sharon Advisor */}
        <button
          onClick={onOpenSharonAdvisor}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-purple-300 border border-purple-700/50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
          <span>Producer Critique</span>
        </button>
      </div>
    </div>
  );
};
