import React, { useState, useRef, useEffect } from 'react';
import { MERCH_PRODUCTS } from '../data/merchCatalog';
import { ProductItem, ProductColor, PrintTechnique, LogoTransform, ProductMockupState, DpiAudit } from '../types/merch';
import { calculateDpiAudit, generate300DpiPrintFile, downloadBlob, exportProductionZipBundle } from '../utils/printEngine';
import { ProductMockupCanvas } from './ProductMockupCanvas';
import { SponsoredBanner } from './SponsoredBanner';
import {
  Grid3X3,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Download,
  Split,
  Maximize2,
  Palette,
  Printer,
  TrendingUp,
  Tag,
  ArrowRight,
  Eye,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import JSZip from 'jszip';

interface ReviewCanvasBoardProps {
  logoImage: HTMLImageElement | null;
  currentLogoName: string;
  globalTransform: LogoTransform;
  onOpenStudioForProduct: (product: ProductItem, color: ProductColor, technique: PrintTechnique, shotId: string) => void;
  onOpenVirtualTryOn: () => void;
  onOpenSharonAdvisor: () => void;
}

export const ReviewCanvasBoard: React.FC<ReviewCanvasBoardProps> = ({
  logoImage,
  currentLogoName,
  globalTransform,
  onOpenStudioForProduct,
  onOpenVirtualTryOn,
  onOpenSharonAdvisor,
}) => {
  // Collection state per product
  const [mockupStates, setMockupStates] = useState<Record<string, ProductMockupState>>(() => {
    const initial: Record<string, ProductMockupState> = {};
    MERCH_PRODUCTS.forEach((p) => {
      initial[p.id] = {
        productId: p.id,
        selectedColorId: p.colors[0].id,
        selectedTechnique: p.defaultTechnique,
        selectedShotId: p.shots[0].id,
        transform: { ...globalTransform },
      };
    });
    return initial;
  });

  // View modes
  const [boardView, setBoardView] = useState<'grid' | 'compare'>('grid');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isBatchExporting, setIsBatchExporting] = useState<boolean>(false);

  // Compare mode selections
  const [compareA, setCompareA] = useState<string>('heavyweight-tee');
  const [compareB, setCompareB] = useState<string>('heavy-hoodie');
  const [compareSplit, setCompareSplit] = useState<number>(50); // slider percent

  // Inline alter handler
  const handleAlterMockup = (
    productId: string,
    updates: Partial<ProductMockupState>
  ) => {
    setMockupStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...updates,
      },
    }));
  };

  const handleAlterTransform = (
    productId: string,
    transformUpdates: Partial<LogoTransform>
  ) => {
    setMockupStates((prev) => {
      const current = prev[productId];
      return {
        ...prev,
        [productId]: {
          ...current,
          transform: {
            ...current.transform,
            ...transformUpdates,
          },
        },
      };
    });
  };

  // Batch Alterations
  const applyBatchColor = (type: 'dark' | 'light' | 'first') => {
    setMockupStates((prev) => {
      const next = { ...prev };
      MERCH_PRODUCTS.forEach((p) => {
        let matchColor = p.colors[0];
        if (type === 'dark') {
          matchColor = p.colors.find((c) => c.isDark) || p.colors[0];
        } else if (type === 'light') {
          matchColor = p.colors.find((c) => !c.isDark) || p.colors[0];
        }
        next[p.id] = {
          ...next[p.id],
          selectedColorId: matchColor.id,
        };
      });
      return next;
    });
  };

  const applyBatchTreatment = (filter: LogoTransform['colorFilter']) => {
    setMockupStates((prev) => {
      const next = { ...prev };
      MERCH_PRODUCTS.forEach((p) => {
        next[p.id] = {
          ...next[p.id],
          transform: {
            ...next[p.id].transform,
            colorFilter: filter,
          },
        };
      });
      return next;
    });
  };

  // Batch Export All 8 Print Packs
  const handleBatchExportAll = async () => {
    if (!logoImage) return;
    try {
      setIsBatchExporting(true);
      const masterZip = new JSZip();

      for (const product of MERCH_PRODUCTS) {
        const state = mockupStates[product.id];
        const color = product.colors.find((c) => c.id === state.selectedColorId) || product.colors[0];
        const printBlob = await generate300DpiPrintFile(logoImage, product, state.transform, 300);

        const folder = masterZip.folder(product.title.replace(/\s+/g, '_'));
        if (folder) {
          folder.file(`01_PRINT_300DPI_${product.id}.png`, printBlob);
          folder.file(
            `02_TECH_SPEC.json`,
            JSON.stringify(
              {
                product: product.title,
                technique: state.selectedTechnique,
                color: color.name,
                dimensions: `${product.specs.widthInches}x${product.specs.heightInches} in`,
              },
              null,
              2
            )
          );
        }
      }

      const zipBlob = await masterZip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `MerchCraft_FULL_COLLECTION_PRINT_PACK.zip`);
    } catch (err) {
      console.error('Batch export failed:', err);
    } finally {
      setIsBatchExporting(false);
    }
  };

  // Filter products for display
  const displayProducts = selectedCategoryFilter === 'all'
    ? MERCH_PRODUCTS
    : MERCH_PRODUCTS.filter((p) => p.category === selectedCategoryFilter);

  // Sharon's commercial metadata per product
  const getProductSharonMeta = (productId: string) => {
    switch (productId) {
      case 'heavyweight-tee':
        return { tag: '🔥 Core Hero SKU', margin: '78%', msrp: '$38 - $44' };
      case 'heavy-hoodie':
        return { tag: '⚡ Highest Ticket', margin: '72%', msrp: '$88 - $110' };
      case 'ceramic-barista-mug':
        return { tag: '☕ High Impulse (84%)', margin: '84%', msrp: '$22 - $26' };
      case 'canvas-tote':
        return { tag: '🌿 Sustainable Add-On', margin: '75%', msrp: '$28 - $34' };
      case 'dad-hat-cap':
        return { tag: '🧢 Streetwear Staple', margin: '76%', msrp: '$32 - $38' };
      case 'stainless-tumbler':
        return { tag: '💎 Everyday Carry', margin: '70%', msrp: '$34 - $42' };
      case 'hardcover-journal':
        return { tag: '🖋️ High Perceived Value', margin: '80%', msrp: '$24 - $30' };
      case 'diecut-stickers':
        return { tag: '🏷️ Cart Stuffer ($5)', margin: '88%', msrp: '$5 - $8' };
      default:
        return { tag: '✨ Retail Ready', margin: '75%', msrp: '$30 - $40' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Consideration & Alteration Control Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 backdrop-blur-md shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Title & Board Stats */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Grid3X3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-100 uppercase tracking-wider font-mono">
                Collection Review & Alteration Canvas
              </h2>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                8 SKUs Active
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Consider, compare, and alter mockups across your entire catalog simultaneously
            </p>
          </div>
        </div>

        {/* View Mode & Sharon Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggles */}
          <div className="flex p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setBoardView('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                boardView === 'grid'
                  ? 'bg-neutral-800 text-amber-300 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Canvas Grid</span>
            </button>
            <button
              onClick={() => setBoardView('compare')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                boardView === 'compare'
                  ? 'bg-neutral-800 text-amber-300 shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>A/B Compare</span>
            </button>
          </div>

          {/* Sharon AR Fitting Room Button */}
          <button
            onClick={onOpenVirtualTryOn}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all hover:scale-102 cursor-pointer shadow-sm shadow-purple-950"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Sharon AR Try-On (MediaPipe)</span>
          </button>

          {/* Batch Export Button */}
          <button
            onClick={handleBatchExportAll}
            disabled={isBatchExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/60 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBatchExporting ? 'Packaging...' : 'Batch Export All 8 (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Batch Alterations Strip */}
      <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
            Batch Alterations:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyBatchColor('dark')}
            className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition-colors"
          >
            Set All Dark Blanks
          </button>
          <button
            onClick={() => applyBatchColor('light')}
            className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition-colors"
          >
            Set All Light / Vintage Ecru
          </button>
          <button
            onClick={() => applyBatchTreatment('white')}
            className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition-colors"
          >
            Monochrome White Ink
          </button>
          <button
            onClick={() => applyBatchTreatment('gold-foil')}
            className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-neutral-800 text-xs font-mono transition-colors"
          >
            Metallic Gold Foil
          </button>
          <button
            onClick={() => applyBatchTreatment('original')}
            className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800 text-xs font-mono transition-colors"
          >
            Reset to Full Color
          </button>
        </div>
      </div>

      {/* Ad-Supported Extension Sponsor Banner */}
      <div className="pt-1">
        <SponsoredBanner placement="canvas-inline" />
      </div>

      {/* VIEW A: CANVAS GRID OF ALL MOCKUPS */}
      {boardView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {displayProducts.map((product) => {
            const state = mockupStates[product.id];
            const activeColor = product.colors.find((c) => c.id === state.selectedColorId) || product.colors[0];
            const activeShot = product.shots.find((s) => s.id === state.selectedShotId) || product.shots[0];
            const sharonMeta = getProductSharonMeta(product.id);

            const dpiAudit = calculateDpiAudit(
              logoImage ? logoImage.naturalWidth : 1200,
              logoImage ? logoImage.naturalHeight : 1200,
              state.transform,
              product.specs
            );

            return (
              <div
                key={product.id}
                className="group relative bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-200 flex flex-col"
              >
                {/* Product Header & Sharon's Commercial Tag */}
                <div className="p-4 pb-2 border-b border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between">
                  <div className="truncate">
                    <div className="text-xs font-bold text-neutral-100 truncate">{product.title}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{product.baseMaterial}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                    {sharonMeta.tag}
                  </span>
                </div>

                {/* Live Mockup Rendering Preview */}
                <div className="relative p-2 bg-neutral-950/40 flex items-center justify-center">
                  <ProductMockupCanvas
                    product={product}
                    shot={activeShot}
                    color={activeColor}
                    technique={state.selectedTechnique}
                    transform={state.transform}
                    onTransformChange={(newT) => handleAlterTransform(product.id, newT)}
                    logoImage={logoImage}
                    showSafeZone={false}
                    showSpecsOverlay={false}
                    cmykProofing={false}
                  />

                  {/* Quick Inspect Button on Hover */}
                  <button
                    onClick={() =>
                      onOpenStudioForProduct(product, activeColor, state.selectedTechnique, activeShot.id)
                    }
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-md"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline Alteration Controls */}
                <div className="p-4 space-y-3.5 bg-neutral-900/90 flex-1 flex flex-col justify-between">
                  {/* Color Swatches Alteration */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5">
                      <span>COLORWAY:</span>
                      <span className="text-neutral-200 font-semibold truncate max-w-[120px]">
                        {activeColor.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.colors.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleAlterMockup(product.id, { selectedColorId: c.id })}
                          title={c.name}
                          className={`w-6 h-6 rounded-full border transition-all ${
                            c.id === activeColor.id
                              ? 'border-amber-400 scale-110 shadow-md shadow-amber-500/30'
                              : 'border-neutral-700 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Angles / Shots Selector */}
                  <div>
                    <div className="text-[11px] font-mono text-neutral-400 mb-1.5">ANGLE:</div>
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {product.shots.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleAlterMockup(product.id, { selectedShotId: s.id })}
                          className={`px-2 py-1 rounded-md text-[10px] font-medium border whitespace-nowrap transition-colors ${
                            s.id === activeShot.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Print Technique Dropdown */}
                  <div>
                    <div className="text-[11px] font-mono text-neutral-400 mb-1">TECHNIQUE:</div>
                    <select
                      value={state.selectedTechnique}
                      onChange={(e) =>
                        handleAlterMockup(product.id, {
                          selectedTechnique: e.target.value as PrintTechnique,
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl p-2 focus:outline-none focus:border-amber-500"
                    >
                      {product.supportedTechniques.map((tech) => (
                        <option key={tech} value={tech}>
                          {tech}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Position Quick Nudge & Scale */}
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">MSRP: {sharonMeta.msrp}</span>
                    <span className="text-emerald-400 font-semibold">{dpiAudit.effectiveDpi} DPI</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW B: A/B COMPARE MODE */}
      {boardView === 'compare' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
          {/* Pickers for Item A and Item B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Picker A */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Variant A (Left)
              </label>
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200"
              >
                {MERCH_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Picker B */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Variant B (Right)
              </label>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200"
              >
                {MERCH_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Comparison Split View */}
          {(() => {
            const prodA = MERCH_PRODUCTS.find((p) => p.id === compareA) || MERCH_PRODUCTS[0];
            const prodB = MERCH_PRODUCTS.find((p) => p.id === compareB) || MERCH_PRODUCTS[1];

            const stateA = mockupStates[prodA.id];
            const stateB = mockupStates[prodB.id];

            const colorA = prodA.colors.find((c) => c.id === stateA.selectedColorId) || prodA.colors[0];
            const colorB = prodB.colors.find((c) => c.id === stateB.selectedColorId) || prodB.colors[0];

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Canvas A */}
                  <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 font-mono">{prodA.title}</span>
                      <span className="text-neutral-400">{colorA.name}</span>
                    </div>
                    <ProductMockupCanvas
                      product={prodA}
                      shot={prodA.shots[0]}
                      color={colorA}
                      technique={stateA.selectedTechnique}
                      transform={stateA.transform}
                      onTransformChange={(newT) => handleAlterTransform(prodA.id, newT)}
                      logoImage={logoImage}
                      showSafeZone={false}
                      showSpecsOverlay={false}
                      cmykProofing={false}
                    />
                  </div>

                  {/* Right Canvas B */}
                  <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400 font-mono">{prodB.title}</span>
                      <span className="text-neutral-400">{colorB.name}</span>
                    </div>
                    <ProductMockupCanvas
                      product={prodB}
                      shot={prodB.shots[0]}
                      color={colorB}
                      technique={stateB.selectedTechnique}
                      transform={stateB.transform}
                      onTransformChange={(newT) => handleAlterTransform(prodB.id, newT)}
                      logoImage={logoImage}
                      showSafeZone={false}
                      showSpecsOverlay={false}
                      cmykProofing={false}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
