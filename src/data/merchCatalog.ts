import { ProductItem } from '../types/merch';

export const MERCH_PRODUCTS: ProductItem[] = [
  {
    id: 'heavyweight-tee',
    title: 'Heavyweight Streetwear T-Shirt',
    subtitle: '280 GSM Combed Cotton • Boxy Vintage Fit',
    category: 'apparel',
    baseMaterial: '100% Ring-spun Heavy Cotton',
    fabricWeight: '280 GSM / 8.2 oz',
    specs: {
      widthInches: 12,
      heightInches: 16,
      safeMarginInches: 0.75,
      maxDpiRequired: 300,
      topOffsetDescription: '3.0 inches below collar ribbing',
      shape: 'rectangle',
    },
    supportedTechniques: [
      'Direct-to-Garment (DTG)',
      'Screen Printing',
      'Direct-to-Film (DTF)',
      '3D Puff Embroidery',
    ],
    defaultTechnique: 'Direct-to-Garment (DTG)',
    colors: [
      { id: 'washed-black', name: 'Washed Pitch Black', hex: '#161616', pantoneApprox: 'Black 6 C', isDark: true },
      { id: 'vintage-white', name: 'Vintage Off-White / Bone', hex: '#F3EFE6', pantoneApprox: 'Warm Gray 1 C', isDark: false },
      { id: 'heather-grey', name: 'Athletic Heather Grey', hex: '#A8A9AD', pantoneApprox: 'Cool Gray 6 C', isDark: false },
      { id: 'deep-navy', name: 'Midnight Navy', hex: '#1A233A', pantoneApprox: '289 C', isDark: true },
      { id: 'forest-green', name: 'Alpine Forest Green', hex: '#1C3125', pantoneApprox: '5535 C', isDark: true },
      { id: 'terracotta', name: 'Sun-Drenched Terracotta', hex: '#9E4733', pantoneApprox: '7593 C', isDark: true },
      { id: 'slate-blue', name: 'Washed Slate Blue', hex: '#415264', pantoneApprox: '7545 C', isDark: true },
    ],
    shots: [
      {
        id: 'tee-front-studio',
        title: 'Front Chest Studio',
        description: 'Clean isolated studio shot with soft atmospheric drop shadow',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 32, y: 26, width: 36, height: 42 },
      },
      {
        id: 'tee-flat-lay',
        title: 'Editorial Flat Lay',
        description: 'Overhead garment display with natural organic fabric folds',
        sceneType: 'flat-lay',
        backgroundStyle: 'table-props',
        printAreaBox: { x: 33, y: 29, width: 34, height: 38 },
      },
      {
        id: 'tee-back-oversize',
        title: 'Oversized Back Print',
        description: 'High-impact streetwear rear graphic placement',
        sceneType: 'studio-back',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 28, y: 20, width: 44, height: 50 },
      },
      {
        id: 'tee-pocket-crest',
        title: 'Left Chest Crest',
        description: 'Subtle left-breast pocket embroidery or badge',
        sceneType: 'detail-close',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 53, y: 28, width: 18, height: 18 },
      },
    ],
  },
  {
    id: 'heavy-hoodie',
    title: 'Boxy Pullover Heavy Hoodie',
    subtitle: '450 GSM Organic French Terry • Double-Lined Hood',
    category: 'apparel',
    baseMaterial: '450 GSM Heavyweight Organic Terry Cotton',
    fabricWeight: '450 GSM / 13.3 oz',
    specs: {
      widthInches: 13,
      heightInches: 15,
      safeMarginInches: 0.5,
      maxDpiRequired: 300,
      topOffsetDescription: '3.5 inches below hood collar seam (above kangaroo pocket)',
      shape: 'rectangle',
    },
    supportedTechniques: [
      '3D Puff Embroidery',
      'Direct-to-Garment (DTG)',
      'Screen Printing',
      'Flat Embroidery',
    ],
    defaultTechnique: '3D Puff Embroidery',
    colors: [
      { id: 'hoodie-charcoal', name: 'Onyx Charcoal', hex: '#1F2024', pantoneApprox: 'Black 7 C', isDark: true },
      { id: 'hoodie-oatmeal', name: 'Oatmeal Heather', hex: '#E6E1D8', pantoneApprox: '7527 C', isDark: false },
      { id: 'hoodie-espresso', name: 'Espresso Brown', hex: '#31231E', pantoneApprox: '4975 C', isDark: true },
      { id: 'hoodie-sage', name: 'Washed Sage Green', hex: '#4A5B4D', pantoneApprox: '556 C', isDark: true },
      { id: 'hoodie-cobalt', name: 'Deep Cobalt', hex: '#192C56', pantoneApprox: '534 C', isDark: true },
    ],
    shots: [
      {
        id: 'hoodie-front-chest',
        title: 'Front Center Chest',
        description: 'Centered chest shot framed by drawstrings and kangaroo pouch',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 31, y: 31, width: 38, height: 35 },
      },
      {
        id: 'hoodie-flat-table',
        title: 'Designer Flat Lay',
        description: 'Neatly styled garment on raw timber workstation',
        sceneType: 'flat-lay',
        backgroundStyle: 'table-props',
        printAreaBox: { x: 32, y: 34, width: 36, height: 32 },
      },
      {
        id: 'hoodie-back-statement',
        title: 'Full Back Statement',
        description: 'Panoramic print area across shoulder blades',
        sceneType: 'studio-back',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 27, y: 22, width: 46, height: 48 },
      },
    ],
  },
  {
    id: 'ceramic-barista-mug',
    title: 'Barista Ceramic Diner Mug',
    subtitle: '12 oz High-Gloss Ceramic • Curved Wrap Print',
    category: 'drinkware',
    baseMaterial: 'High-fire Stoneware Ceramic with Gloss Glaze',
    specs: {
      widthInches: 8.5,
      heightInches: 3.5,
      safeMarginInches: 0.35,
      maxDpiRequired: 300,
      topOffsetDescription: '0.5 inches below rim, centered on mug body',
      shape: 'cylinder',
      cylinderCurvature: 0.18,
    },
    supportedTechniques: [
      'Sublimation Wrap',
      'Screen Printing',
      'Laser Engraving',
    ],
    defaultTechnique: 'Sublimation Wrap',
    colors: [
      { id: 'mug-ivory', name: 'Cafe Ivory White', hex: '#FAF8F5', isDark: false },
      { id: 'mug-matte-black', name: 'Matte Obsidian', hex: '#1E1E20', isDark: true },
      { id: 'mug-terracotta', name: 'Warm Terracotta', hex: '#9E4E38', isDark: true },
      { id: 'mug-sage', name: 'Glazed Moss', hex: '#4B6354', isDark: true },
      { id: 'mug-speckle', name: 'Speckled Camp Stone', hex: '#DED7CD', isDark: false },
    ],
    shots: [
      {
        id: 'mug-studio-front',
        title: 'Studio Front Angle',
        description: 'Classic 3D cylinder presentation with realistic gloss highlights',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 30, y: 33, width: 40, height: 42 },
      },
      {
        id: 'mug-cafe-counter',
        title: 'Coffee Bar Counter',
        description: 'Atmospheric scene on walnut barista bar with roasted espresso beans',
        sceneType: 'lifestyle',
        backgroundStyle: 'cafe-wood',
        printAreaBox: { x: 32, y: 34, width: 36, height: 38 },
      },
    ],
  },
  {
    id: 'canvas-tote',
    title: 'Heavy Organic Canvas Tote',
    subtitle: '16 oz Heavyweight Cotton • Reinforced Cross Stitching',
    category: 'bags',
    baseMaterial: '100% Unbleached Heavy Cotton Canvas',
    fabricWeight: '480 GSM / 16 oz',
    specs: {
      widthInches: 11,
      heightInches: 13,
      safeMarginInches: 0.75,
      maxDpiRequired: 300,
      topOffsetDescription: '2.5 inches below top rim hem',
      shape: 'rectangle',
    },
    supportedTechniques: [
      'Screen Printing',
      'Direct-to-Garment (DTG)',
      'Flat Embroidery',
    ],
    defaultTechnique: 'Screen Printing',
    colors: [
      { id: 'tote-natural', name: 'Raw Natural Ecru', hex: '#EAE5D9', isDark: false },
      { id: 'tote-black', name: 'Washed Onyx', hex: '#1D1D1E', isDark: true },
      { id: 'tote-olive', name: 'Field Olive Canvas', hex: '#3C4336', isDark: true },
      { id: 'tote-navy', name: 'Harbor Navy', hex: '#232D3F', isDark: true },
    ],
    shots: [
      {
        id: 'tote-studio-front',
        title: 'Studio Hanging View',
        description: 'Clean centered product capture with realistic fabric grain weave',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 28, y: 40, width: 44, height: 40 },
      },
      {
        id: 'tote-flat-lifestyle',
        title: 'Editorial Everyday Carry',
        description: 'Flat lay paired with lifestyle items, books, and accessories',
        sceneType: 'flat-lay',
        backgroundStyle: 'table-props',
        printAreaBox: { x: 30, y: 38, width: 40, height: 40 },
      },
    ],
  },
  {
    id: 'dad-hat-cap',
    title: 'Low-Profile Cotton Twill Cap',
    subtitle: '6-Panel Unstructured • Antique Brass Buckle',
    category: 'headwear',
    baseMaterial: '100% Chino Washed Cotton Twill',
    specs: {
      widthInches: 4.5,
      heightInches: 2.25,
      safeMarginInches: 0.25,
      maxDpiRequired: 300,
      topOffsetDescription: '0.75 inches above bill seam, centered across front panels',
      shape: 'hat-curve',
    },
    supportedTechniques: [
      '3D Puff Embroidery',
      'Flat Embroidery',
      'Laser Engraved Leather Patch',
    ],
    defaultTechnique: 'Flat Embroidery',
    colors: [
      { id: 'hat-washed-black', name: 'Washed Black', hex: '#222325', isDark: true },
      { id: 'hat-khaki', name: 'Desert Khaki', hex: '#C2B69D', isDark: false },
      { id: 'hat-dark-green', name: 'Pine Forest', hex: '#1D3025', isDark: true },
      { id: 'hat-navy', name: 'Vintage Navy', hex: '#1E2838', isDark: true },
      { id: 'hat-burgundy', name: 'Cranberry Burgundy', hex: '#4F1D27', isDark: true },
    ],
    shots: [
      {
        id: 'hat-angled-3d',
        title: '3/4 Angle Studio',
        description: 'Dynamic perspective highlighting crown curvature and brim profile',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 34, y: 41, width: 32, height: 21 },
      },
      {
        id: 'hat-flat-table',
        title: 'Top Desk Display',
        description: 'Flat arrangement showcasing stitch detail and visor curve',
        sceneType: 'flat-lay',
        backgroundStyle: 'table-props',
        printAreaBox: { x: 35, y: 42, width: 30, height: 20 },
      },
    ],
  },
  {
    id: 'stainless-tumbler',
    title: 'Insulated Hydro Tumbler',
    subtitle: '20 oz Double-Wall Vacuum 18/8 Stainless Steel',
    category: 'drinkware',
    baseMaterial: 'Kitchen-Grade 18/8 Stainless Steel with Matte Powder Coat',
    specs: {
      widthInches: 3.5,
      heightInches: 6.0,
      safeMarginInches: 0.25,
      maxDpiRequired: 300,
      topOffsetDescription: 'Centered horizontally, 2 inches below lid rim',
      shape: 'cylinder',
      cylinderCurvature: 0.22,
    },
    supportedTechniques: [
      'Laser Engraving',
      'Screen Printing',
      'Sublimation Wrap',
    ],
    defaultTechnique: 'Laser Engraving',
    colors: [
      { id: 'tumbler-matte-black', name: 'Powder Matte Black', hex: '#18191B', isDark: true },
      { id: 'tumbler-pure-white', name: 'Chalk Arctic White', hex: '#F6F6F6', isDark: false },
      { id: 'tumbler-military-olive', name: 'Military Olive', hex: '#3B4034', isDark: true },
      { id: 'tumbler-nordic-blue', name: 'Nordic Sea Blue', hex: '#2A3C4D', isDark: true },
    ],
    shots: [
      {
        id: 'tumbler-studio',
        title: 'Studio Hero Isolation',
        description: 'Sleek cylindrical silhouette with subtle metallic rim sheen',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 38, y: 32, width: 24, height: 42 },
      },
    ],
  },
  {
    id: 'hardcover-journal',
    title: 'Hardcover Debossed Notebook',
    subtitle: 'A5 Vegan Leather Cover • 120 GSM Acid-Free Cream Paper',
    category: 'stationery',
    baseMaterial: 'Matte Tactile Vegan Leather Hardcover',
    specs: {
      widthInches: 5.5,
      heightInches: 8.0,
      safeMarginInches: 0.5,
      maxDpiRequired: 300,
      topOffsetDescription: 'Optical center, 2.5 inches below top edge',
      shape: 'rectangle',
    },
    supportedTechniques: [
      'Foil Stamping',
      'Screen Printing',
      'Direct-to-Film (DTF)',
    ],
    defaultTechnique: 'Foil Stamping',
    colors: [
      { id: 'journal-cognac', name: 'Cognac Saddle Brown', hex: '#583624', isDark: true },
      { id: 'journal-obsidian', name: 'Obsidian Black', hex: '#161719', isDark: true },
      { id: 'journal-emerald', name: 'British Racing Green', hex: '#153123', isDark: true },
      { id: 'journal-sand', name: 'Warm Desert Sand', hex: '#D2C3B0', isDark: false },
    ],
    shots: [
      {
        id: 'journal-studio-front',
        title: 'Front Cover Perspective',
        description: 'Book cover display with bookmark ribbon and tactile debossing',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 33, y: 30, width: 34, height: 44 },
      },
      {
        id: 'journal-desk-flatlay',
        title: 'Architect Desk Flat Lay',
        description: 'Arranged next to fountain pen, brass drafting ruler, and studio coffee',
        sceneType: 'flat-lay',
        backgroundStyle: 'table-props',
        printAreaBox: { x: 34, y: 32, width: 32, height: 40 },
      },
    ],
  },
  {
    id: 'diecut-stickers',
    title: 'Matte Vinyl Die-Cut Sticker',
    subtitle: '6 Mil Weatherproof Vinyl • UV & Scratch Resistant',
    category: 'accessories',
    baseMaterial: 'Thick Durable Vinyl with Protective Matte Laminate',
    specs: {
      widthInches: 3.5,
      heightInches: 3.5,
      safeMarginInches: 0.125,
      maxDpiRequired: 300,
      topOffsetDescription: '0.125" kiss-cut border with outer bleed contour',
      shape: 'rectangle',
    },
    supportedTechniques: [
      'Direct-to-Film (DTF)',
      'Screen Printing',
    ],
    defaultTechnique: 'Direct-to-Film (DTF)',
    colors: [
      { id: 'sticker-white-border', name: 'Classic White Border', hex: '#FFFFFF', isDark: false },
      { id: 'sticker-black-border', name: 'Dark Stealth Border', hex: '#1E1E1E', isDark: true },
      { id: 'sticker-holographic', name: 'Holo Prism Sheen', hex: '#E0E7FF', isDark: false },
    ],
    shots: [
      {
        id: 'sticker-diecut-pack',
        title: 'Die-Cut Floating Pack',
        description: 'Precise sticker outline with white peel margin and drop shadow',
        sceneType: 'studio-front',
        backgroundStyle: 'clean-studio',
        printAreaBox: { x: 28, y: 28, width: 44, height: 44 },
      },
      {
        id: 'sticker-laptop-applied',
        title: 'Applied on Space Grey Laptop',
        description: 'Real-world application on anodized matte aluminum surface',
        sceneType: 'lifestyle',
        backgroundStyle: 'table-props',
        printAreaBox: { x: 30, y: 30, width: 40, height: 40 },
      },
    ],
  },
];

/**
 * High quality SVG sample logos ready for instant 1-click preview
 */
export const SAMPLE_LOGOS = [
  {
    id: 'aura-coffee',
    name: 'Aura Artisanal Coffee',
    category: 'Food & Beverage',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <circle cx="250" cy="250" r="235" fill="none" stroke="#D4AF37" stroke-width="8" stroke-dasharray="8 6"/>
        <circle cx="250" cy="250" r="215" fill="#141416"/>
        <path d="M 250 85 A 165 165 0 0 1 415 250" fill="none" stroke="#D4AF37" stroke-width="4"/>
        <path d="M 250 85 A 165 165 0 0 0 85 250" fill="none" stroke="#D4AF37" stroke-width="4"/>
        <!-- Mountain and sun icon -->
        <circle cx="250" cy="180" r="32" fill="#E5C158"/>
        <polygon points="170,300 250,195 330,300" fill="#2D2D32" stroke="#E5C158" stroke-width="4"/>
        <polygon points="215,300 250,240 285,300" fill="#E5C158"/>
        <!-- Steam arches -->
        <path d="M 235 130 Q 240 115 245 130 Q 250 145 255 130" fill="none" stroke="#E5C158" stroke-width="3" stroke-linecap="round"/>
        <!-- Typography -->
        <text x="250" y="350" font-family="'Space Grotesk', 'Helvetica', sans-serif" font-size="34" font-weight="900" fill="#FDFBF7" text-anchor="middle" letter-spacing="6">AURA ROASTERS</text>
        <text x="250" y="380" font-family="'Courier New', monospace" font-size="14" font-weight="700" fill="#D4AF37" text-anchor="middle" letter-spacing="8">EST. 2024 • ORIGIN CRAFT</text>
        <circle cx="250" cy="410" r="4" fill="#D4AF37"/>
      </svg>
    `)}`,
  },
  {
    id: 'apex-cyber',
    name: 'Apex Syndicate',
    category: 'Streetwear / Tech',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <!-- Geometric cyber streetwear emblem -->
        <polygon points="250,50 430,150 430,350 250,450 70,350 70,150" fill="none" stroke="#00F0FF" stroke-width="8"/>
        <polygon points="250,85 395,168 395,332 250,415 105,332 105,168" fill="#0A0B0E"/>
        <path d="M 170 200 L 250 120 L 330 200 L 250 280 Z" fill="#00F0FF"/>
        <polygon points="250,210 290,250 250,290 210,250" fill="#FF0055"/>
        <path d="M 150 330 L 350 330" stroke="#00F0FF" stroke-width="6"/>
        <text x="250" y="375" font-family="'Impact', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">APEX // 09</text>
        <text x="250" y="400" font-family="monospace" font-size="12" fill="#00F0FF" text-anchor="middle" letter-spacing="6">HEAVY INDUSTRIES DIVISION</text>
      </svg>
    `)}`,
  },
  {
    id: 'botanical-zen',
    name: 'Komorebi Botanical',
    category: 'Minimalist & Nature',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <!-- Delicate botanical line crest -->
        <circle cx="250" cy="250" r="220" fill="none" stroke="#2C4032" stroke-width="4"/>
        <circle cx="250" cy="250" r="205" fill="#FAF7F2"/>
        <g stroke="#2C4032" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Main branch -->
          <path d="M 250 350 C 250 280 230 210 250 140"/>
          <!-- Leaves -->
          <path d="M 245 290 C 215 285 200 265 210 245 C 225 245 240 265 246 280" fill="#4B6B54"/>
          <path d="M 255 250 C 285 245 300 225 290 205 C 275 205 260 225 254 240" fill="#4B6B54"/>
          <path d="M 246 200 C 220 195 210 175 220 160 C 235 160 245 180 248 190" fill="#4B6B54"/>
          <path d="M 250 140 C 240 115 255 95 250 85 C 265 95 260 115 250 140" fill="#4B6B54"/>
        </g>
        <circle cx="250" cy="180" r="6" fill="#C98A60"/>
        <text x="250" y="390" font-family="'Didot', 'Bodoni MT', 'Cinzel', serif" font-size="28" font-weight="600" fill="#2C4032" text-anchor="middle" letter-spacing="10">KOMOREBI</text>
        <text x="250" y="415" font-family="'Helvetica', sans-serif" font-size="11" font-weight="500" fill="#758A7A" text-anchor="middle" letter-spacing="5">BOTANICAL ATELIER • TOKYO</text>
      </svg>
    `)}`,
  },
  {
    id: 'velocita-club',
    name: 'Velocità Classic Club',
    category: 'Automotive & Heritage',
    svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
        <rect x="50" y="50" width="400" height="400" rx="36" fill="#B22222" stroke="#F5F5F0" stroke-width="8"/>
        <circle cx="250" cy="220" r="120" fill="#1C1D21" stroke="#F5F5F0" stroke-width="6"/>
        <polygon points="250,130 280,210 365,220 300,270 320,350 250,305 180,350 200,270 135,220 220,210" fill="#F4C430"/>
        <text x="250" y="390" font-family="'Impact', 'Arial Black', sans-serif" font-size="42" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">VELOCITÀ</text>
        <text x="250" y="420" font-family="'Arial', sans-serif" font-size="13" font-weight="800" fill="#F4C430" text-anchor="middle" letter-spacing="6">SCUDERIA MONZA // 1974</text>
      </svg>
    `)}`,
  },
];
