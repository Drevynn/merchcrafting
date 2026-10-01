import React, { useState, useEffect } from 'react';
import { ProductItem, ProductColor, PrintTechnique, LogoTransform, AiAnalysisResult } from '../types/merch';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  X,
  RefreshCw,
  Copy,
  Check,
  Palette,
  Lightbulb,
  ShoppingBag,
  Download,
  AlertCircle,
} from 'lucide-react';
import { downloadBlob } from '../utils/printEngine';

interface AiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem;
  color: ProductColor;
  technique: PrintTechnique;
  transform: LogoTransform;
  logoImage: HTMLImageElement | null;
  logoBase64: string;
  onSelectColor: (c: ProductColor) => void;
  onSelectTechnique: (tech: PrintTechnique) => void;
  onSetAiGeneratedScene: (url: string | null) => void;
}

export const AiStudioModal: React.FC<AiStudioModalProps> = ({
  isOpen,
  onClose,
  product,
  color,
  technique,
  transform,
  logoImage,
  logoBase64,
  onSelectColor,
  onSelectTechnique,
  onSetAiGeneratedScene,
}) => {
  const [activeTab, setActiveTab] = useState<'advisor' | 'photoshoot'>('advisor');

  // AI Advisor state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // AI Photoshoot state
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const [generatedPhotoUrl, setGeneratedPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedPromptPreset, setSelectedPromptPreset] = useState<string>('Urban Streetwear Tokyo crosswalk in soft neon rain');
  const [customPrompt, setCustomPrompt] = useState('');

  const photoPresets = [
    {
      title: 'Tokyo Streetwear',
      desc: 'Editorial street lookbook on rainy crosswalk with soft neon bokeh',
      prompt: `Editorial fashion street lookbook of a model wearing a ${color.name} ${product.title}, standing in a rainy Tokyo Shibuya crosswalk at dusk, cinematic depth of field, natural film texture.`,
    },
    {
      title: 'Minimalist Studio Lookbook',
      desc: 'Arch-lit architectural studio with warm sand tones and clean shadows',
      prompt: `High-fashion studio catalog shot of a ${color.name} ${product.title} displayed on an invisible mannequin against warm beige limestone walls and soft morning sunlight.`,
    },
    {
      title: 'Artisan Cafe Counter',
      desc: 'Moody espresso bar with warm timber and roasted coffee beans',
      prompt: `Atmospheric commercial product shot of a ${color.name} ${product.title} placed on a dark walnut espresso bar counter next to an espresso machine with rising steam.`,
    },
    {
      title: 'Creative Agency Flat Lay',
      desc: 'Curated editorial desk layout with typography books and sunglasses',
      prompt: `Top-down minimalist flat-lay photo of a ${color.name} ${product.title} neatly folded alongside a vintage camera, notebook, and designer accessories on a raw timber table.`,
    },
  ];

  // Run AI Advisor Analysis
  const runAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/ai/analyze-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: product.title,
          productCategory: product.category,
          productColor: color.name,
          printMethod: technique,
          logoWidthPx: logoImage ? logoImage.naturalWidth : 1200,
          logoHeightPx: logoImage ? logoImage.naturalHeight : 1200,
          printWidthInches: product.specs.widthInches,
          printHeightInches: product.specs.heightInches,
          logoBase64: logoBase64,
        }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Advisor error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysisResult) {
      runAnalysis();
    }
  }, [isOpen]);

  // Run AI Photo Shoot
  const handleGeneratePhoto = async () => {
    try {
      setIsGeneratingPhoto(true);
      setPhotoError(null);
      const finalPrompt = customPrompt.trim() || selectedPromptPreset;

      const res = await fetch('/api/ai/studio-shoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          logoBase64,
          productTitle: product.title,
          garmentColor: color.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate scene');
      }

      setGeneratedPhotoUrl(data.imageUrl);
      onSetAiGeneratedScene(data.imageUrl);
    } catch (err: any) {
      console.error('Photo generation failed:', err);
      setPhotoError(err.message || 'Image generation is unavailable or requires a configured Gemini API key.');
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                MerchCraft AI Studio
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Gemini 3 Powered
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Audits print fidelity, contrast harmony & generates commercial scenes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'advisor'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Print & Color Advisor
          </button>
          <button
            onClick={() => setActiveTab('photoshoot')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'photoshoot'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            AI Commercial Photo Shoot
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'advisor' && (
            <div className="space-y-6">
              {isAnalyzing ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <div className="text-sm font-semibold text-neutral-200">Analyzing Artwork & Fabric Contrast...</div>
                  <div className="text-xs text-neutral-500">Checking ink absorption, underbase opacity & retail colorways</div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6">
                  {/* Contrast Score Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-mono font-bold text-lg text-purple-300">
                        {analysisResult.contrastScore}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-200">Contrast & Legibility Score</div>
                        <div className="text-xs text-neutral-400">{analysisResult.contrastFeedback}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-500 uppercase font-mono">Recommended:</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {analysisResult.recommendedPrintMethod}
                      </span>
                    </div>
                  </div>

                  {/* Production Recommendations */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Production & Ink Curing Bulletins
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {analysisResult.printTips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800 text-neutral-300 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Colorways */}
                  {analysisResult.recommendedColorways && analysisResult.recommendedColorways.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-cyan-400" />
                        AI-Recommended Complementary Blanks
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.recommendedColorways.map((hex, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              onSelectColor({
                                id: `custom-${hex}`,
                                name: `AI Harmonic Blank (${hex})`,
                                hex,
                                isDark: true,
                              });
                            }}
                            className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-cyan-500/50 transition-colors"
                          >
                            <span className="w-6 h-6 rounded-lg border border-neutral-700 shadow" style={{ backgroundColor: hex }} />
                            <span className="font-mono text-xs text-neutral-300">{hex}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* E-Commerce Ready Copy */}
                  {analysisResult.marketingCopy && (
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-amber-400" />
                          Shopify / Etsy Listing Generator
                        </div>
                        <button
                          onClick={() =>
                            handleCopyText(
                              `${analysisResult.marketingCopy.title}\n\n${analysisResult.marketingCopy.tagline}\n\n${analysisResult.marketingCopy.description}`,
                              'all-copy'
                            )
                          }
                          className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                        >
                          {copiedField === 'all-copy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy All
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase">Product Title</div>
                          <div className="font-semibold text-neutral-100">{analysisResult.marketingCopy.title}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase">Tagline</div>
                          <div className="italic text-neutral-300">{analysisResult.marketingCopy.tagline}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase">Description</div>
                          <div className="text-neutral-400 leading-relaxed">{analysisResult.marketingCopy.description}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'photoshoot' && (
            <div className="space-y-5">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Select Photoshoot Scene Vibe
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {photoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPromptPreset(preset.prompt);
                        setCustomPrompt(preset.prompt);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedPromptPreset === preset.prompt
                          ? 'bg-purple-500/10 border-purple-500/60 text-purple-200'
                          : 'bg-neutral-950/60 hover:bg-neutral-800/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="font-semibold text-xs text-neutral-200">{preset.title}</div>
                      <div className="text-[11px] text-neutral-400 mt-1 leading-snug">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Custom Scene Prompt (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt || selectedPromptPreset}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe your scene in detail, e.g. Model walking on Malibu beach at sunset wearing this hoodie..."
                  className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-purple-500 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              {/* Error notice if API key or generation failed */}
              {photoError && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Notice regarding AI Image Generation</div>
                    <div className="text-[11px] text-amber-200/80 mt-0.5">
                      {photoError}. You can continue designing with our real-time interactive canvas, which delivers instant photorealistic 300 DPI exports across all angles!
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGeneratePhoto}
                disabled={isGeneratingPhoto}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGeneratingPhoto ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Photorealistic Scene with Gemini...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Generate Commercial Photo Shoot
                  </>
                )}
              </button>

              {/* Rendered Photo Result */}
              {generatedPhotoUrl && (
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-xs">Generated Commercial Shoot</span>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedPhotoUrl;
                        link.download = `AI_Mockup_${product.id}.png`;
                        link.click();
                      }}
                      className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Full Res
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-square max-w-md mx-auto">
                    <img src={generatedPhotoUrl} alt="AI Scene" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
