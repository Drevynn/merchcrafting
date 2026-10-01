import React, { useState } from 'react';
import { ProductItem, ProductColor, PrintTechnique, LogoTransform, DpiAudit } from '../types/merch';
import {
  Download,
  Archive,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Printer,
  Eye,
  Ruler,
  Layers,
  Sparkles,
} from 'lucide-react';
import { generate300DpiPrintFile, downloadBlob, exportProductionZipBundle } from '../utils/printEngine';

interface PrintReadinessCardProps {
  product: ProductItem;
  color: ProductColor;
  technique: PrintTechnique;
  transform: LogoTransform;
  dpiAudit: DpiAudit;
  logoImage: HTMLImageElement | null;
  showSafeZone: boolean;
  setShowSafeZone: (v: boolean) => void;
  showSpecsOverlay: boolean;
  setShowSpecsOverlay: (v: boolean) => void;
  cmykProofing: boolean;
  setCmykProofing: (v: boolean) => void;
  onOpenAiStudio: () => void;
}

export const PrintReadinessCard: React.FC<PrintReadinessCardProps> = ({
  product,
  color,
  technique,
  transform,
  dpiAudit,
  logoImage,
  showSafeZone,
  setShowSafeZone,
  showSpecsOverlay,
  setShowSpecsOverlay,
  cmykProofing,
  setCmykProofing,
  onOpenAiStudio,
}) => {
  const [isExportingMaster, setIsExportingMaster] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Download 300 DPI Transparent Master PNG
  const handleDownloadMaster = async () => {
    if (!logoImage) return;
    try {
      setIsExportingMaster(true);
      const blob = await generate300DpiPrintFile(logoImage, product, transform, 300);
      downloadBlob(blob, `${product.id}_300DPI_MASTER_${color.id}.png`);
    } catch (err) {
      console.error('Master export failed:', err);
    } finally {
      setIsExportingMaster(false);
    }
  };

  // Export Complete Production Zip (300 DPI + Spec Sheet + Mockup + Instructions)
  const handleExportZip = async () => {
    if (!logoImage) return;
    try {
      setIsExportingZip(true);
      const canvasEl = document.querySelector('canvas') as HTMLCanvasElement;
      await exportProductionZipBundle({
        product,
        selectedColor: color,
        selectedTechnique: technique,
        transform,
        dpiAudit,
        logoImage,
        mockupCanvas: canvasEl,
      });
    } catch (err) {
      console.error('ZIP bundle export failed:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Status visual colors
  const statusColors = {
    optimal: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    good: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    fair: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    low: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  }[dpiAudit.status];

  const statusIcons = {
    optimal: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    good: <CheckCircle2 className="w-4 h-4 text-cyan-400" />,
    fair: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    low: <AlertTriangle className="w-4 h-4 text-rose-400" />,
  }[dpiAudit.status];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 uppercase tracking-wider">Print File Production</h3>
            <p className="text-xs text-neutral-400">True 300 DPI output & tech pack specs</p>
          </div>
        </div>

        {/* DPI Quality Badge */}
        <div className={`px-2.5 py-1 rounded-full border text-xs font-mono font-semibold flex items-center gap-1.5 ${statusColors}`}>
          {statusIcons}
          <span>{dpiAudit.effectiveDpi} DPI</span>
        </div>
      </div>

      {/* Production Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80 text-xs">
        <div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Physical Print Area</div>
          <div className="font-semibold text-neutral-200 mt-0.5 font-mono">
            {dpiAudit.printWidthInches}" x {dpiAudit.printHeightInches}"
          </div>
          <div className="text-[10px] text-neutral-400">
            ({Math.round(dpiAudit.printWidthInches * 2.54)} x {Math.round(dpiAudit.printHeightInches * 2.54)} cm)
          </div>
        </div>

        <div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Bed Safe Margin</div>
          <div className="font-semibold text-neutral-200 mt-0.5 font-mono">
            {product.specs.safeMarginInches}" Safe Edge
          </div>
          <div className="text-[10px] text-neutral-400">Standard Bleed</div>
        </div>

        <div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Color Separation</div>
          <div className="font-semibold text-neutral-200 mt-0.5">
            {color.isDark ? 'White Underbase' : 'Direct Pigment'}
          </div>
          <div className="text-[10px] text-neutral-400">{technique}</div>
        </div>
      </div>

      {/* DPI Advice Note */}
      <div className="text-xs text-neutral-400 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/50 flex items-start gap-2">
        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-medium text-neutral-300">Fidelity Check: </span>
          <span>{dpiAudit.message}</span>
        </div>
      </div>

      {/* Viewport Toggles (Safe Zone, Specs, CMYK Proofing) */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800/80">
        <button
          onClick={() => setShowSafeZone(!showSafeZone)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            showSafeZone
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Safe Print Box</span>
        </button>

        <button
          onClick={() => setShowSpecsOverlay(!showSpecsOverlay)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            showSpecsOverlay
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Seam Offset Rules</span>
        </button>

        <button
          onClick={() => setCmykProofing(!cmykProofing)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            cmykProofing
              ? 'bg-purple-500/20 border-purple-500 text-purple-300'
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>CMYK Ink Proofing</span>
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {/* Export 300 DPI Master PNG */}
        <button
          onClick={handleDownloadMaster}
          disabled={!logoImage || isExportingMaster}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/50 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {isExportingMaster ? 'Generating 300 DPI...' : 'Download 300 DPI Master PNG'}
        </button>

        {/* Export Production Archive ZIP */}
        <button
          onClick={handleExportZip}
          disabled={!logoImage || isExportingZip}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-xs shadow-lg shadow-amber-950/50 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Archive className="w-4 h-4" />
          {isExportingZip ? 'Packaging Zip...' : 'Export Complete Tech Pack (.ZIP)'}
        </button>
      </div>

      {/* Free Ad-Supported Extension Assurance */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-950/60 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-400">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          100% Free Production Exports
        </span>
        <span className="text-neutral-500">Sponsored by Industry Print Hubs</span>
      </div>

      {/* AI Photoshoot Trigger Banner */}
      <div className="pt-2">
        <button
          onClick={onOpenAiStudio}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-neutral-900 border border-purple-800/40 hover:border-purple-600/70 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                AI Commercial Photo Shoot & Quality Advisor
              </div>
              <div className="text-[11px] text-purple-300/70">
                Generate real-world lifestyle photos & audit contrast with Gemini AI
              </div>
            </div>
          </div>
          <span className="text-xs font-medium text-purple-400 group-hover:text-purple-300 shrink-0 font-mono">
            Launch →
          </span>
        </button>
      </div>
    </div>
  );
};
