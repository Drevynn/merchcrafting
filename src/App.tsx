import React, { useState, useEffect } from 'react';
import { MERCH_PRODUCTS, SAMPLE_LOGOS } from './data/merchCatalog';
import { ProductItem, ProductShot, ProductColor, PrintTechnique, LogoTransform, ProductCategory } from './types/merch';
import { calculateDpiAudit, downloadBlob } from './utils/printEngine';
import { ProductMockupCanvas } from './components/ProductMockupCanvas';
import { ProductHeaderSelector } from './components/ProductHeaderSelector';
import { LogoUploadPanel } from './components/LogoUploadPanel';
import { PlacementControls } from './components/PlacementControls';
import { PrintReadinessCard } from './components/PrintReadinessCard';
import { AiStudioModal } from './components/AiStudioModal';
import { ReviewCanvasBoard } from './components/ReviewCanvasBoard';
import { SharonVirtualTryOn } from './components/SharonVirtualTryOn';
import { SharonProducerBar } from './components/SharonProducerBar';
import { SponsoredBanner } from './components/SponsoredBanner';
import { ChromeExtensionModal } from './components/ChromeExtensionModal';
import {
  Printer,
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  Layers,
  Camera,
  CheckCircle2,
  Package,
  Grid3X3,
  SlidersHorizontal,
  Shirt,
  UserCheck,
  Chrome,
} from 'lucide-react';

export default function App() {
  // Navigation View: 'canvas' (Review & Alter Board) | 'studio' (300 DPI Single Item) | 'ar-fitting'
  const [activeMainView, setActiveMainView] = useState<'canvas' | 'studio' | 'ar-fitting'>('canvas');

  // Chrome Extension Modal
  const [isChromeExtModalOpen, setIsChromeExtModalOpen] = useState<boolean>(false);

  // Active product selection (for Studio mode)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(MERCH_PRODUCTS[0]);
  const [selectedShot, setSelectedShot] = useState<ProductShot>(MERCH_PRODUCTS[0].shots[0]);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(MERCH_PRODUCTS[0].colors[0]);
  const [selectedTechnique, setSelectedTechnique] = useState<PrintTechnique>(MERCH_PRODUCTS[0].defaultTechnique);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  // Logo transform & state
  const [transform, setTransform] = useState<LogoTransform>({
    x: 0,
    y: -8,
    scale: 0.85,
    rotation: 0,
    opacity: 1.0,
    blendMode: 'normal',
    colorFilter: 'original',
  });

  const [currentLogoName, setCurrentLogoName] = useState<string>('Aura Artisanal Coffee');
  const [currentLogoImg, setCurrentLogoImg] = useState<HTMLImageElement | null>(null);
  const [currentLogoBase64, setCurrentLogoBase64] = useState<string>('');

  // Viewport overlays
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [showSpecsOverlay, setShowSpecsOverlay] = useState<boolean>(false);
  const [cmykProofing, setCmykProofing] = useState<boolean>(false);

  // AI Studio modal & Scene state
  const [isAiStudioOpen, setIsAiStudioOpen] = useState<boolean>(false);
  const [isAiGeneratedScene, setIsAiGeneratedScene] = useState<boolean>(false);
  const [aiSceneUrl, setAiSceneUrl] = useState<string | null>(null);

  // Initialize with curated sample logo for instantaneous visual delight
  useEffect(() => {
    const sample = SAMPLE_LOGOS[0];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setCurrentLogoImg(img);
      setCurrentLogoBase64(sample.svgDataUrl);
      setCurrentLogoName(sample.name);
    };
    img.src = sample.svgDataUrl;
  }, []);

  // Update default print technique when product changes
  useEffect(() => {
    setSelectedTechnique(selectedProduct.defaultTechnique);
  }, [selectedProduct]);

  // Compute live DPI audit for current product
  const dpiAudit = calculateDpiAudit(
    currentLogoImg ? currentLogoImg.naturalWidth : 1500,
    currentLogoImg ? currentLogoImg.naturalHeight : 1500,
    transform,
    selectedProduct.specs
  );

  const handleLogoLoaded = (img: HTMLImageElement, dataUrl: string, name: string) => {
    setCurrentLogoImg(img);
    setCurrentLogoBase64(dataUrl);
    setCurrentLogoName(name);
    setIsAiGeneratedScene(false);
    setAiSceneUrl(null);
  };

  // Quick download of current mockup image
  const handleDownloadMockupPng = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `Mockup_${selectedProduct.id}_${selectedColor.id}.png`);
      }
    }, 'image/png');
  };

  // Sharon's Streetwear Golden Ratio Pass
  const handleApplySharonStreetwearPass = () => {
    setTransform((prev) => ({
      ...prev,
      x: 0,
      y: -14, // higher chest stance
      scale: 0.88,
      rotation: 0,
      opacity: 0.95,
      colorFilter: 'original',
    }));
  };

  // Jump from Alter Canvas directly to Single Item Studio
  const handleOpenStudioForProduct = (
    product: ProductItem,
    color: ProductColor,
    technique: PrintTechnique,
    shotId: string
  ) => {
    setSelectedProduct(product);
    setSelectedColor(color);
    setSelectedTechnique(technique);
    const targetShot = product.shots.find((s) => s.id === shotId) || product.shots[0];
    setSelectedShot(targetShot);
    setActiveMainView('studio');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800/90 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-amber-500/20">
              <Printer className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">
                  MERCH<span className="text-amber-400">CRAFT</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  SHARON AI v3.8
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Consider & Alter Canvas • Sharon AI Producer with MediaPipe
              </p>
            </div>
          </div>

          {/* Central Workspace Switcher */}
          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs">
            <button
              onClick={() => setActiveMainView('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMainView === 'canvas'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Alter Canvas</span>
            </button>

            <button
              onClick={() => setActiveMainView('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMainView === 'studio'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>300 DPI Studio</span>
            </button>

            <button
              onClick={() => setActiveMainView('ar-fitting')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeMainView === 'ar-fitting'
                  ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/30'
                  : 'text-purple-300 hover:text-purple-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Sharon AR (MediaPipe)</span>
              <span className="sm:hidden">AR Fit</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Chrome Extension Download Button */}
            <button
              onClick={() => setIsChromeExtModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 text-xs font-semibold transition-all hover:scale-102 cursor-pointer shadow-sm shadow-amber-950"
            >
              <Chrome className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Chrome Ext</span>
              <span className="hidden lg:inline text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 font-mono">
                Ad-Supported
              </span>
            </button>

            {/* Sharon Producer Dialog Trigger */}
            <button
              onClick={() => setIsAiStudioOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all hover:scale-102 cursor-pointer shadow-sm shadow-purple-950"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Sharon Critique</span>
            </button>

            {/* Quick Mockup Download */}
            <button
              onClick={handleDownloadMockupPng}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Save PNG</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Top Sponsor Banner: Keeps the Chrome Extension 100% Free */}
        <SponsoredBanner placement="top-banner" />

        {/* Sharon AI Producer Bar */}
        <SharonProducerBar
          product={selectedProduct}
          color={selectedColor}
          technique={selectedTechnique}
          transform={transform}
          onApplySharonStreetwearPass={handleApplySharonStreetwearPass}
          onOpenVirtualTryOn={() => setActiveMainView('ar-fitting')}
          onOpenSharonAdvisor={() => setIsAiStudioOpen(true)}
        />

        {/* Global Logo Upload & Finish Quick Strip */}
        <LogoUploadPanel
          onLogoLoaded={handleLogoLoaded}
          currentLogoName={currentLogoName}
          currentLogoImg={currentLogoImg}
          transform={transform}
          onTransformChange={setTransform}
        />

        {/* WORKSPACE VIEW 1: CONSIDER & ALTER CANVAS BOARD */}
        {activeMainView === 'canvas' && (
          <ReviewCanvasBoard
            logoImage={currentLogoImg}
            currentLogoName={currentLogoName}
            globalTransform={transform}
            onOpenStudioForProduct={handleOpenStudioForProduct}
            onOpenVirtualTryOn={() => setActiveMainView('ar-fitting')}
            onOpenSharonAdvisor={() => setIsAiStudioOpen(true)}
          />
        )}

        {/* WORKSPACE VIEW 2: 300 DPI PRECISION STUDIO */}
        {activeMainView === 'studio' && (
          <div className="space-y-6">
            {/* Product & Colorway Selector Header */}
            <ProductHeaderSelector
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              selectedShot={selectedShot}
              onSelectShot={setSelectedShot}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            {/* Studio Workspace: Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Visual Mockup Canvas & Quick Viewport Controls (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <ProductMockupCanvas
                  product={selectedProduct}
                  shot={selectedShot}
                  color={selectedColor}
                  technique={selectedTechnique}
                  transform={transform}
                  onTransformChange={setTransform}
                  logoImage={currentLogoImg}
                  showSafeZone={showSafeZone}
                  showSpecsOverlay={showSpecsOverlay}
                  cmykProofing={cmykProofing}
                  isAiGeneratedScene={isAiGeneratedScene}
                  aiSceneUrl={aiSceneUrl}
                />

                {/* Canvas Quick Tool Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-mono text-[11px]">INTERACTION:</span>
                    <span className="text-neutral-300 text-[11px] bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
                      Drag logo to place • Auto snaps to center
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTransform({ ...transform, x: 0, y: 0 })}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors"
                    >
                      Snap Center
                    </button>
                    <button
                      onClick={() => setTransform({ ...transform, rotation: 0 })}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors"
                    >
                      0° Angle
                    </button>
                    <button
                      onClick={handleDownloadMockupPng}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Mockup PNG
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Inspector Controls & 300 DPI Print Exporter (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Position, Scale & Technique Controls */}
                <PlacementControls
                  transform={transform}
                  onTransformChange={setTransform}
                  product={selectedProduct}
                  technique={selectedTechnique}
                  onTechniqueChange={setSelectedTechnique}
                />

                {/* 300 DPI Print-Ready Engine & Tech Pack Exporter */}
                <PrintReadinessCard
                  product={selectedProduct}
                  color={selectedColor}
                  technique={selectedTechnique}
                  transform={transform}
                  dpiAudit={dpiAudit}
                  logoImage={currentLogoImg}
                  showSafeZone={showSafeZone}
                  setShowSafeZone={setShowSafeZone}
                  showSpecsOverlay={showSpecsOverlay}
                  setShowSpecsOverlay={setShowSpecsOverlay}
                  cmykProofing={cmykProofing}
                  setCmykProofing={setCmykProofing}
                  onOpenAiStudio={() => setIsAiStudioOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 3: SHARON AR FITTING ROOM (MEDIAPIPE POSE) */}
        {activeMainView === 'ar-fitting' && (
          <SharonVirtualTryOn
            product={selectedProduct}
            color={selectedColor}
            transform={transform}
            logoImage={currentLogoImg}
            onSelectProduct={setSelectedProduct}
            onSelectColor={setSelectedColor}
            onClose={() => setActiveMainView('canvas')}
          />
        )}
      </main>

      {/* AI Studio Assistant & Photoshoot Modal */}
      <AiStudioModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        product={selectedProduct}
        color={selectedColor}
        technique={selectedTechnique}
        transform={transform}
        logoImage={currentLogoImg}
        logoBase64={currentLogoBase64}
        onSelectColor={setSelectedColor}
        onSelectTechnique={setSelectedTechnique}
        onSetAiGeneratedScene={(url) => {
          if (url) {
            setIsAiGeneratedScene(true);
            setAiSceneUrl(url);
          }
        }}
      />

      {/* Chrome Extension Download & Setup Modal */}
      <ChromeExtensionModal
        isOpen={isChromeExtModalOpen}
        onClose={() => setIsChromeExtModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>MerchCraft Free Chrome Extension • Ad-Supported</span>
          </div>
          <span>Sharon AI Producer & MediaPipe Pose AR Engine • 300 DPI Production Ready</span>
        </div>
      </footer>
    </div>
  );
}
