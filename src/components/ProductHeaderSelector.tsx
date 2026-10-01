import React from 'react';
import { MERCH_PRODUCTS } from '../data/merchCatalog';
import { ProductItem, ProductShot, ProductColor, ProductCategory } from '../types/merch';
import { Shirt, Coffee, Briefcase, Sparkles, Tag, Check, ChevronDown, Layers } from 'lucide-react';

interface ProductHeaderSelectorProps {
  selectedProduct: ProductItem;
  onSelectProduct: (p: ProductItem) => void;
  selectedShot: ProductShot;
  onSelectShot: (s: ProductShot) => void;
  selectedColor: ProductColor;
  onSelectColor: (c: ProductColor) => void;
  activeCategory: ProductCategory | 'all';
  setActiveCategory: (cat: ProductCategory | 'all') => void;
}

export const ProductHeaderSelector: React.FC<ProductHeaderSelectorProps> = ({
  selectedProduct,
  onSelectProduct,
  selectedShot,
  onSelectShot,
  selectedColor,
  onSelectColor,
  activeCategory,
  setActiveCategory,
}) => {
  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Products' },
    { id: 'apparel', label: 'Apparel' },
    { id: 'drinkware', label: 'Drinkware' },
    { id: 'bags', label: 'Bags' },
    { id: 'headwear', label: 'Headwear' },
    { id: 'stationery', label: 'Stationery' },
    { id: 'accessories', label: 'Stickers & Accessories' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? MERCH_PRODUCTS
    : MERCH_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-neutral-950 font-semibold shadow-md shadow-amber-500/20'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Selection Horizontal Cards */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {filteredProducts.map((p) => {
          const isSelected = p.id === selectedProduct.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                onSelectProduct(p);
                onSelectShot(p.shots[0]);
                onSelectColor(p.colors[0]);
              }}
              className={`flex-shrink-0 w-56 p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-neutral-800/90 border-amber-500/80 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                  {p.category}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {p.specs.widthInches}" x {p.specs.heightInches}"
                </span>
              </div>
              <div className="font-semibold text-xs text-neutral-100 truncate">{p.title}</div>
              <div className="text-[11px] text-neutral-400 truncate mt-0.5">{p.subtitle}</div>
              {/* Micro Color dots */}
              <div className="flex items-center gap-1.5 mt-2.5">
                {p.colors.slice(0, 5).map((c) => (
                  <span
                    key={c.id}
                    className="w-3 h-3 rounded-full border border-neutral-700"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {p.colors.length > 5 && (
                  <span className="text-[9px] text-neutral-500 font-mono">+{p.colors.length - 5}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Product Control Bar (Shots & Colorways) */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Shots / Angle Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Angles & Scenes ({selectedProduct.shots.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedProduct.shots.map((shot) => {
              const isSelected = shot.id === selectedShot.id;
              return (
                <button
                  key={shot.id}
                  onClick={() => onSelectShot(shot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  {shot.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colorways Selector */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
            <span>Colorway: <span className="text-amber-400 normal-case font-medium">{selectedColor.name}</span></span>
            {selectedColor.pantoneApprox && (
              <span className="text-[10px] font-mono text-neutral-500">PMS {selectedColor.pantoneApprox}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedProduct.colors.map((c) => {
              const isSelected = c.id === selectedColor.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectColor(c)}
                  title={`${c.name} (${c.hex})`}
                  className={`group relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? 'border-amber-400 scale-110 shadow-md shadow-amber-500/30'
                      : 'border-neutral-700 hover:border-neutral-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${c.isDark ? 'text-white' : 'text-neutral-950'}`} />
                  )}
                </button>
              );
            })}

            {/* Custom Hex Color Input */}
            <label
              title="Pick custom garment color"
              className="relative w-8 h-8 rounded-full border-2 border-dashed border-neutral-600 hover:border-amber-400 flex items-center justify-center cursor-pointer transition-colors"
            >
              <input
                type="color"
                value={selectedColor.hex}
                onChange={(e) => {
                  onSelectColor({
                    id: 'custom-color',
                    name: `Custom Dye (${e.target.value.toUpperCase()})`,
                    hex: e.target.value,
                    isDark: true,
                  });
                }}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              />
              <span className="text-xs text-neutral-400 font-bold">+</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
