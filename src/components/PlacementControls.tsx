import React from 'react';
import { LogoTransform, PrintTechnique, ProductItem } from '../types/merch';
import { Move, Maximize2, RotateCw, AlignCenter, Sliders, Info, ShieldCheck } from 'lucide-react';

interface PlacementControlsProps {
  transform: LogoTransform;
  onTransformChange: (t: LogoTransform) => void;
  product: ProductItem;
  technique: PrintTechnique;
  onTechniqueChange: (tech: PrintTechnique) => void;
}

export const PlacementControls: React.FC<PlacementControlsProps> = ({
  transform,
  onTransformChange,
  product,
  technique,
  onTechniqueChange,
}) => {
  // Preset Alignments
  const handleQuickAlign = (preset: 'center' | 'top-chest' | 'pocket-crest' | 'back-oversize') => {
    if (preset === 'center') {
      onTransformChange({ ...transform, x: 0, y: 0 });
    } else if (preset === 'top-chest') {
      onTransformChange({ ...transform, x: 0, y: -16, scale: 0.85 });
    } else if (preset === 'pocket-crest') {
      onTransformChange({ ...transform, x: 26, y: -20, scale: 0.45 });
    } else if (preset === 'back-oversize') {
      onTransformChange({ ...transform, x: 0, y: 2, scale: 1.25 });
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">Placement & Scale</h3>
            <p className="text-xs text-neutral-400">Fine-tune artwork coordinates and print size</p>
          </div>
        </div>
        <button
          onClick={() => onTransformChange({ ...transform, x: 0, y: 0, scale: 0.85, rotation: 0, opacity: 1.0 })}
          className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-mono transition-colors"
        >
          <RotateCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Quick Alignment Presets */}
      <div>
        <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Standard Print Positions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => handleQuickAlign('center')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
              transform.x === 0 && transform.y === 0
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            True Center
          </button>
          <button
            onClick={() => handleQuickAlign('top-chest')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
              transform.x === 0 && transform.y === -16
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            Chest Standard
          </button>
          <button
            onClick={() => handleQuickAlign('pocket-crest')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
              transform.x === 26 && transform.y === -20
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            Left Crest / Pocket
          </button>
          <button
            onClick={() => handleQuickAlign('back-oversize')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
              transform.scale > 1.1
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            Oversized Back
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-3.5">
        {/* Scale Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-neutral-300 font-medium flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Print Scale
            </span>
            <span className="font-mono text-cyan-400">{Math.round(transform.scale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.02"
            value={transform.scale}
            onChange={(e) => onTransformChange({ ...transform, scale: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 bg-neutral-800 rounded-lg h-1.5 cursor-pointer"
          />
        </div>

        {/* Rotation Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-neutral-300 font-medium flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> Angle Rotation
            </span>
            <span className="font-mono text-cyan-400">{transform.rotation}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={transform.rotation}
            onChange={(e) => onTransformChange({ ...transform, rotation: parseInt(e.target.value, 10) })}
            className="w-full accent-cyan-500 bg-neutral-800 rounded-lg h-1.5 cursor-pointer"
          />
        </div>

        {/* Horizontal Position */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-neutral-400">Horizontal (X)</span>
              <span className="font-mono text-neutral-300 text-[11px]">
                {transform.x > 0 ? `+${transform.x}%` : `${transform.x}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={transform.x}
              onChange={(e) => onTransformChange({ ...transform, x: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 bg-neutral-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Vertical Position */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-neutral-400">Vertical (Y)</span>
              <span className="font-mono text-neutral-300 text-[11px]">
                {transform.y > 0 ? `+${transform.y}%` : `${transform.y}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={transform.y}
              onChange={(e) => onTransformChange({ ...transform, y: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500 bg-neutral-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Ink Opacity Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-neutral-300 font-medium">Ink Density / Opacity</span>
            <span className="font-mono text-neutral-400">{Math.round(transform.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={transform.opacity}
            onChange={(e) => onTransformChange({ ...transform, opacity: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 bg-neutral-800 rounded-lg h-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Production Print Method Selector */}
      <div className="pt-4 border-t border-neutral-800/80">
        <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Target Print Technique
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {product.supportedTechniques.map((tech) => (
            <button
              key={tech}
              onClick={() => onTechniqueChange(tech)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                technique === tech
                  ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200'
                  : 'bg-neutral-950/60 hover:bg-neutral-800/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-between">
                <span>{tech}</span>
                {technique === tech && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                {tech.includes('DTG') && 'Best for photographic & multi-color'}
                {tech.includes('Screen') && 'Ideal for high volume & spot Pantone'}
                {tech.includes('Embroidery') && 'Raised textured thread relief'}
                {tech.includes('Laser') && 'Precision surface ablation & contrast'}
                {tech.includes('Foil') && 'Reflective metallic mirror luster'}
                {tech.includes('Sublimation') && 'Permanent 360° ceramic dye'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
