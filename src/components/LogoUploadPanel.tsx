import React, { useRef } from 'react';
import { SAMPLE_LOGOS } from '../data/merchCatalog';
import { LogoTransform } from '../types/merch';
import { Upload, Sparkles, Check, RefreshCw, Wand2, Image as ImageIcon } from 'lucide-react';

interface LogoUploadPanelProps {
  onLogoLoaded: (img: HTMLImageElement, dataUrl: string, name: string) => void;
  currentLogoName: string;
  currentLogoImg: HTMLImageElement | null;
  transform: LogoTransform;
  onTransformChange: (t: LogoTransform) => void;
}

export const LogoUploadPanel: React.FC<LogoUploadPanelProps> = ({
  onLogoLoaded,
  currentLogoName,
  currentLogoImg,
  transform,
  onTransformChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onLogoLoaded(img, dataUrl, file.name);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_LOGOS[0]) => {
    const img = new Image();
    img.onload = () => {
      onLogoLoaded(img, sample.svgDataUrl, sample.name);
    };
    img.src = sample.svgDataUrl;
  };

  // Auto clean white background to transparent using client-side canvas
  const handleRemoveWhiteBg = () => {
    if (!currentLogoImg) return;
    const canvas = document.createElement('canvas');
    canvas.width = currentLogoImg.naturalWidth;
    canvas.height = currentLogoImg.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(currentLogoImg, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Chroma key white threshold
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // If pixel is near pure white, set alpha to 0
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const newUrl = canvas.toDataURL('image/png');
    const newImg = new Image();
    newImg.onload = () => {
      onLogoLoaded(newImg, newUrl, `${currentLogoName} (Alpha Cleaned)`);
    };
    newImg.src = newUrl;
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">Logo & Artwork</h3>
            <p className="text-xs text-neutral-400">Upload high-res vector or transparent raster</p>
          </div>
        </div>
        {currentLogoImg && (
          <span className="text-[11px] font-mono bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700">
            {currentLogoImg.naturalWidth} x {currentLogoImg.naturalHeight} px
          </span>
        )}
      </div>

      {/* Upload Drop Zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/svg+xml, image/jpeg, image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative cursor-pointer border-2 border-dashed border-neutral-700 hover:border-amber-500/60 bg-neutral-950/60 hover:bg-neutral-950 rounded-xl p-5 text-center transition-all duration-200"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-amber-500/20 text-neutral-400 group-hover:text-amber-400 flex items-center justify-center transition-colors">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="text-xs font-medium text-neutral-200">
            <span className="text-amber-400 underline decoration-amber-400/40 underline-offset-4">Click to upload</span> or drag and drop
          </div>
          <p className="text-[11px] text-neutral-500">Supports PNG with alpha, SVG vector, JPG, WebP</p>
        </div>
      </div>

      {/* Current Active Logo Bar */}
      {currentLogoImg && (
        <div className="mt-3 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center shrink-0">
              <img src={currentLogoImg.src} alt="Active Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-neutral-200 truncate">{currentLogoName}</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" /> Ready for placement
              </div>
            </div>
          </div>
          <button
            onClick={handleRemoveWhiteBg}
            title="Auto-remove white background pixels"
            className="text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            Clean White BG
          </button>
        </div>
      )}

      {/* Quick Try Samples */}
      <div className="mt-4">
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Or try curated brand samples</span>
          <span className="text-neutral-500 font-normal">1-click test</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_LOGOS.map((sample) => {
            const isSelected = currentLogoName === sample.name;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                    : 'bg-neutral-950/60 hover:bg-neutral-800/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center shrink-0">
                  <img src={sample.svgDataUrl} alt={sample.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold truncate leading-tight">{sample.name}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{sample.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logo Color Treatments / Finishes */}
      <div className="mt-4 pt-4 border-t border-neutral-800/80">
        <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Print Ink / Finish Treatment
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {[
            { id: 'original', label: 'Full Color' },
            { id: 'white', label: 'Solid White' },
            { id: 'black', label: 'Stealth Black' },
            { id: 'vintage-wash', label: 'Vintage Wash' },
            { id: 'embroidery-effect', label: '3D Thread' },
            { id: 'gold-foil', label: 'Gold Foil' },
            { id: 'silver-foil', label: 'Silver Foil' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() =>
                onTransformChange({
                  ...transform,
                  colorFilter: mode.id as LogoTransform['colorFilter'],
                })
              }
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                transform.colorFilter === mode.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
