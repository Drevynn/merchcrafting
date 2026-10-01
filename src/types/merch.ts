export type ProductCategory = 'apparel' | 'headwear' | 'bags' | 'drinkware' | 'accessories' | 'stationery';

export type PrintTechnique = 
  | 'Direct-to-Garment (DTG)'
  | 'Screen Printing'
  | '3D Puff Embroidery'
  | 'Flat Embroidery'
  | 'Laser Engraving'
  | 'Laser Engraved Leather Patch'
  | 'Direct-to-Film (DTF)'
  | 'Sublimation Wrap'
  | 'Foil Stamping';

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  pantoneApprox?: string;
  isDark?: boolean;
}

export interface PrintAreaSpecs {
  widthInches: number;
  heightInches: number;
  safeMarginInches: number;
  maxDpiRequired: number;
  topOffsetDescription: string;
  shape?: 'rectangle' | 'cylinder' | 'circle' | 'hat-curve';
  cylinderCurvature?: number; // for mugs/bottles
}

export interface ProductShot {
  id: string;
  title: string;
  description: string;
  sceneType: 'studio-front' | 'studio-back' | 'flat-lay' | 'lifestyle' | 'detail-close' | 'folded';
  backgroundStyle: 'clean-studio' | 'table-props' | 'urban-street' | 'minimal-loft' | 'cafe-wood' | 'outdoor';
  printAreaBox: {
    // Relative percentages within the shot frame (0 - 100)
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProductItem {
  id: string;
  title: string;
  subtitle: string;
  category: ProductCategory;
  baseMaterial: string;
  fabricWeight?: string;
  specs: PrintAreaSpecs;
  supportedTechniques: PrintTechnique[];
  defaultTechnique: PrintTechnique;
  colors: ProductColor[];
  shots: ProductShot[];
}

export interface LogoTransform {
  x: number; // percentage offset from print area center (-50 to +50)
  y: number; // percentage offset from print area center (-50 to +50)
  scale: number; // 0.1 to 2.0 (1.0 = fit to safe box)
  rotation: number; // degrees (-180 to 180)
  opacity: number; // 0.1 to 1.0
  blendMode: 'normal' | 'multiply' | 'soft-light' | 'overlay';
  colorFilter: 'original' | 'white' | 'black' | 'vintage-wash' | 'gold-foil' | 'silver-foil' | 'embroidery-effect';
}

export interface DpiAudit {
  effectiveDpi: number;
  status: 'optimal' | 'good' | 'fair' | 'low';
  message: string;
  printWidthInches: number;
  printHeightInches: number;
}

export interface AiAnalysisResult {
  contrastScore: number;
  contrastFeedback: string;
  recommendedPrintMethod: string;
  printTips: string[];
  recommendedColorways: string[];
  marketingCopy: {
    title: string;
    tagline: string;
    description: string;
  };
}

export interface SharonProducerCritique {
  producerName: string;
  title: string;
  verdict: string;
  collectionRating: number;
  producerQuotes: string[];
  commercialAdvice: {
    recommendedPricing: Record<string, string>;
    projectedMargin: string;
    keyOptimization: string;
  };
  curatedColorways: string[];
}

export interface ProductMockupState {
  productId: string;
  selectedColorId: string;
  selectedTechnique: PrintTechnique;
  selectedShotId: string;
  transform: LogoTransform;
}
