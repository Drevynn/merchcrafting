import JSZip from 'jszip';
import { ProductItem, LogoTransform, DpiAudit, ProductColor, PrintTechnique } from '../types/merch';

/**
 * Calculates effective printing DPI based on logo pixel resolution and physical print dimensions
 */
export function calculateDpiAudit(
  logoWidthPx: number,
  logoHeightPx: number,
  transform: LogoTransform,
  specs: ProductItem['specs']
): DpiAudit {
  // If logo is at scale 1.0, it spans the safe print width
  const effectivePrintWidthInches = Math.max(0.5, (specs.widthInches - specs.safeMarginInches * 2) * transform.scale);
  const effectivePrintHeightInches = Math.max(0.5, (specs.heightInches - specs.safeMarginInches * 2) * transform.scale);

  const effectiveDpi = Math.round(logoWidthPx / effectivePrintWidthInches);

  let status: DpiAudit['status'] = 'optimal';
  let message = 'Master production resolution. Perfect crispness for high-end retail.';

  if (effectiveDpi >= 300) {
    status = 'optimal';
    message = `Ultra-crisp (${effectiveDpi} DPI). Exceeds 300 DPI commercial standard.`;
  } else if (effectiveDpi >= 200) {
    status = 'good';
    message = `High quality (${effectiveDpi} DPI). Sharp detail for DTG and screen printing.`;
  } else if (effectiveDpi >= 150) {
    status = 'fair';
    message = `Medium resolution (${effectiveDpi} DPI). Suitable for casual viewing, but fine lines may soften.`;
  } else {
    status = 'low';
    message = `Low resolution (${effectiveDpi} DPI). May appear pixelated when printed at this physical size.`;
  }

  return {
    effectiveDpi,
    status,
    message,
    printWidthInches: Number(effectivePrintWidthInches.toFixed(2)),
    printHeightInches: Number(effectivePrintHeightInches.toFixed(2)),
  };
}

/**
 * Applies logo color filters (monochrome white, monochrome black, embroidery, etc.)
 */
export function applyLogoFilterToContext(
  ctx: CanvasRenderingContext2D,
  colorFilter: LogoTransform['colorFilter']
) {
  if (colorFilter === 'white') {
    ctx.filter = 'brightness(0) invert(1)';
  } else if (colorFilter === 'black') {
    ctx.filter = 'brightness(0)';
  } else if (colorFilter === 'vintage-wash') {
    ctx.filter = 'contrast(0.85) brightness(1.1) saturate(0.85)';
  } else if (colorFilter === 'gold-foil') {
    ctx.filter = 'sepia(1) saturate(3) hue-rotate(5deg) brightness(1.1)';
  } else if (colorFilter === 'silver-foil') {
    ctx.filter = 'grayscale(1) contrast(1.4) brightness(1.2)';
  } else {
    ctx.filter = 'none';
  }
}

/**
 * Generates an actual 300 DPI transparent master print file
 */
export async function generate300DpiPrintFile(
  logoImage: HTMLImageElement,
  product: ProductItem,
  transform: LogoTransform,
  targetDpi: number = 300
): Promise<Blob> {
  const canvasWidth = Math.round(product.specs.widthInches * targetDpi);
  const canvasHeight = Math.round(product.specs.heightInches * targetDpi);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not create canvas 2D context');
  }

  // Clear background (guaranteed transparent PNG)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calculate printable safe area boundaries
  const safeMarginPx = Math.round(product.specs.safeMarginInches * targetDpi);
  const safeWidthPx = canvasWidth - safeMarginPx * 2;
  const safeHeightPx = canvasHeight - safeMarginPx * 2;

  // Center of safe print area
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Apply user offset percentage (-50 to +50)
  const drawCenterX = centerX + (transform.x / 100) * safeWidthPx;
  const drawCenterY = centerY + (transform.y / 100) * safeHeightPx;

  // Calculate logo scaled dimensions to fit inside safe box at scale=1
  const logoAspect = logoImage.width / logoImage.height;
  let baseDrawWidth = safeWidthPx;
  let baseDrawHeight = safeWidthPx / logoAspect;

  if (baseDrawHeight > safeHeightPx) {
    baseDrawHeight = safeHeightPx;
    baseDrawWidth = safeHeightPx * logoAspect;
  }

  const finalDrawWidth = baseDrawWidth * transform.scale;
  const finalDrawHeight = baseDrawHeight * transform.scale;

  // Transform and render logo
  ctx.save();
  ctx.translate(drawCenterX, drawCenterY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.globalAlpha = transform.opacity;

  applyLogoFilterToContext(ctx, transform.colorFilter);

  // Draw centered at origin
  ctx.drawImage(
    logoImage,
    -finalDrawWidth / 2,
    -finalDrawHeight / 2,
    finalDrawWidth,
    finalDrawHeight
  );

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate 300 DPI Blob'));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Downloads a Blob as a file with specified filename
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Creates and downloads the full Production Tech Pack Archive (ZIP)
 */
export async function exportProductionZipBundle({
  product,
  selectedColor,
  selectedTechnique,
  transform,
  dpiAudit,
  logoImage,
  mockupCanvas,
}: {
  product: ProductItem;
  selectedColor: ProductColor;
  selectedTechnique: PrintTechnique;
  transform: LogoTransform;
  dpiAudit: DpiAudit;
  logoImage: HTMLImageElement;
  mockupCanvas?: HTMLCanvasElement;
}) {
  const zip = new JSZip();

  // 1. Generate 300 DPI Master Transparent Print Artwork
  const printBlob = await generate300DpiPrintFile(logoImage, product, transform, 300);
  zip.file(`01_PRINT_READY_300DPI_${product.id.toUpperCase()}.png`, printBlob);

  // 2. Add Current Mockup Preview Image
  if (mockupCanvas) {
    const mockupBlob = await new Promise<Blob | null>((resolve) => {
      mockupCanvas.toBlob(resolve, 'image/png', 0.95);
    });
    if (mockupBlob) {
      zip.file(`02_MOCKUP_PREVIEW_${selectedColor.id}.png`, mockupBlob);
    }
  }

  // 3. Technical Production Specification (JSON)
  const techPackJson = {
    applet: 'MerchCraft Production Suite',
    exportTimestamp: new Date().toISOString(),
    product: {
      id: product.id,
      title: product.title,
      category: product.category,
      material: product.baseMaterial,
      fabricWeight: product.fabricWeight || 'Standard',
      selectedColor: {
        name: selectedColor.name,
        hex: selectedColor.hex,
        pantoneApprox: selectedColor.pantoneApprox || 'N/A',
      },
    },
    printSpecifications: {
      technique: selectedTechnique,
      printableBedDimensions: {
        widthInches: product.specs.widthInches,
        heightInches: product.specs.heightInches,
        safeMarginInches: product.specs.safeMarginInches,
      },
      placedDimensions: {
        widthInches: dpiAudit.printWidthInches,
        heightInches: dpiAudit.printHeightInches,
      },
      placementOffset: {
        horizontalPercent: transform.x,
        verticalPercent: transform.y,
        rotationDeg: transform.rotation,
        seamGuideline: product.specs.topOffsetDescription,
      },
      qualityAudit: {
        resolutionDpi: dpiAudit.effectiveDpi,
        fidelityVerdict: dpiAudit.status,
        advice: dpiAudit.message,
      },
    },
    recommendedPrintProviders: [
      'Printful (DTG & Embroidery)',
      'Printify (Monster Digital / SwiftPOD blanks)',
      'Gelato (Worldwide on-demand fulfillment)',
      'Custom Ink (Bulk Screen Print)',
    ],
  };

  zip.file('03_TECH_PACK_SPECIFICATIONS.json', JSON.stringify(techPackJson, null, 2));

  // 4. Human-Readable Print Shop Instruction Sheet (TXT)
  const specSheetText = `================================================================================
MERCHCRAFT COMMERCIAL PRODUCTION SPECIFICATION SHEET
================================================================================
Generated: ${new Date().toLocaleString()}
Product:   ${product.title}
Garment:   ${product.baseMaterial} (${product.fabricWeight || 'Standard'})
Base Color:${selectedColor.name} [HEX: ${selectedColor.hex} / PANTONE: ${selectedColor.pantoneApprox || 'Match Hex'}]

PRINT PRODUCTION REQUIREMENTS:
--------------------------------------------------------------------------------
Technique:            ${selectedTechnique}
Master Artwork File:  01_PRINT_READY_300DPI_${product.id.toUpperCase()}.png
Resolution:           300 DPI (Native True Scale)
Effective DPI:        ${dpiAudit.effectiveDpi} DPI (${dpiAudit.status.toUpperCase()})
Print Dimensions:     ${dpiAudit.printWidthInches}" W  x  ${dpiAudit.printHeightInches}" H
Placement Guideline:  ${product.specs.topOffsetDescription}
Center Offset:        X: ${transform.x > 0 ? '+' : ''}${transform.x}% | Y: ${transform.y > 0 ? '+' : ''}${transform.y}%
Rotation Angle:       ${transform.rotation}°

FABRIC & INK CURING GUIDELINES:
--------------------------------------------------------------------------------
• Underbase:          ${selectedColor.isDark ? 'White underbase required (1-pixel choke)' : 'Direct print (No underbase required)'}
• Color Profile:      sRGB IEC61966-2.1 to CMYK coated simulation
• Pretreat Level:     ${selectedColor.isDark ? 'Standard Dark Garment solution' : 'Light Garment solution'}
• Heat Press Curing:  320°F (160°C) for 45 seconds under medium-high pressure
• Wash Instructions:  Machine wash cold inside out, tumble dry low, do not iron on print

QUALITY AUDIT NOTE:
${dpiAudit.message}

================================================================================
Exported via MerchCraft On-Demand Print Studio
================================================================================`;

  zip.file('00_PRINT_SHOP_TECHPACK.txt', specSheetText);

  // Generate and download zip
  const zipContent = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipContent, `MerchCraft_${product.id}_${selectedColor.id}_PrintPack.zip`);
}
