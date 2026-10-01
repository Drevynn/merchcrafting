import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProductItem, ProductShot, ProductColor, LogoTransform, PrintTechnique } from '../types/merch';
import { applyLogoFilterToContext } from '../utils/printEngine';
import { Maximize2, RotateCw, Move, Sparkles, Eye, Grid } from 'lucide-react';

interface ProductMockupCanvasProps {
  product: ProductItem;
  shot: ProductShot;
  color: ProductColor;
  technique: PrintTechnique;
  transform: LogoTransform;
  onTransformChange: (newTransform: LogoTransform) => void;
  logoImage: HTMLImageElement | null;
  showSafeZone: boolean;
  showSpecsOverlay: boolean;
  cmykProofing: boolean;
  isAiGeneratedScene?: boolean;
  aiSceneUrl?: string | null;
}

export const ProductMockupCanvas: React.FC<ProductMockupCanvasProps> = ({
  product,
  shot,
  color,
  technique,
  transform,
  onTransformChange,
  logoImage,
  showSafeZone,
  showSpecsOverlay,
  cmykProofing,
  isAiGeneratedScene,
  aiSceneUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; initTransformX: number; initTransformY: number } | null>(null);
  const [isNearCenterH, setIsNearCenterH] = useState(false);
  const [isNearCenterV, setIsNearCenterV] = useState(false);

  // Render High-Fidelity Mockup to Canvas
  const renderMockup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use high internal resolution (1200 x 1200) for sharp crisp display
    const width = 1200;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // If viewing an AI-generated scene
    if (isAiGeneratedScene && aiSceneUrl) {
      const aiImg = new Image();
      aiImg.crossOrigin = 'anonymous';
      aiImg.src = aiSceneUrl;
      aiImg.onload = () => {
        ctx.drawImage(aiImg, 0, 0, width, height);
      };
      return;
    }

    // 1. Draw Scene Background
    drawSceneBackground(ctx, width, height, shot.backgroundStyle);

    // 2. Draw Realistic Product Base Shape & Texture
    drawProductBase(ctx, width, height, product.id, shot.id, color);

    // 3. Render Placed Logo with authentic fabric/surface blending
    if (logoImage) {
      drawPlacedLogo({
        ctx,
        width,
        height,
        logoImage,
        shot,
        transform,
        product,
        technique,
        cmykProofing,
      });
    }

    // 4. Draw Overlay Shading, Wrinkles & Specular Highlights (displacing over logo)
    drawProductOverlays(ctx, width, height, product.id, shot.id);

    // 5. Draw Safe Print Boundaries & Collar Distance Guidelines if toggled
    if (showSafeZone) {
      drawSafeZoneOverlay(ctx, width, height, shot, product, transform, isNearCenterH, isNearCenterV);
    }

    if (showSpecsOverlay) {
      drawSpecsMeasurementGuides(ctx, width, height, shot, product);
    }
  }, [
    product,
    shot,
    color,
    technique,
    transform,
    logoImage,
    showSafeZone,
    showSpecsOverlay,
    cmykProofing,
    isAiGeneratedScene,
    aiSceneUrl,
    isNearCenterH,
    isNearCenterV,
  ]);

  useEffect(() => {
    renderMockup();
  }, [renderMockup]);

  // Mouse & Touch Drag Placement Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({
      x: clientX,
      y: clientY,
      initTransformX: transform.x,
      initTransformY: transform.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    // Convert pixels to transform percentage (scaled by container dimension)
    const pctDeltaX = (deltaX / rect.width) * 100;
    const pctDeltaY = (deltaY / rect.height) * 100;

    let nextX = Math.round(dragStart.initTransformX + pctDeltaX);
    let nextY = Math.round(dragStart.initTransformY + pctDeltaY);

    // Snap to center within 2%
    let nearH = false;
    let nearV = false;
    if (Math.abs(nextX) < 2.5) {
      nextX = 0;
      nearH = true;
    }
    if (Math.abs(nextY) < 2.5) {
      nextY = 0;
      nearV = true;
    }
    setIsNearCenterH(nearH);
    setIsNearCenterV(nearV);

    // Clamp within -45% to +45% safe bounds
    nextX = Math.max(-45, Math.min(45, nextX));
    nextY = Math.max(-45, Math.min(45, nextY));

    onTransformChange({
      ...transform,
      x: nextX,
      y: nextY,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setIsNearCenterH(false);
    setIsNearCenterV(false);
  };

  return (
    <div className="relative w-full aspect-square max-w-[700px] mx-auto select-none rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
      {/* Interactive Mockup Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'} relative flex items-center justify-center`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Floating Alignment Guideline Indicators */}
        {isDragging && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700 text-xs font-mono text-neutral-300 flex items-center gap-3">
            <span>X: {transform.x > 0 ? `+${transform.x}%` : `${transform.x}%`}</span>
            <span className="text-neutral-600">|</span>
            <span>Y: {transform.y > 0 ? `+${transform.y}%` : `${transform.y}%`}</span>
            {isNearCenterH && <span className="text-emerald-400 font-semibold">• Snapped H-Center</span>}
            {isNearCenterV && <span className="text-cyan-400 font-semibold">• Snapped V-Center</span>}
          </div>
        )}

        {/* CMYK Proofing Indicator Badge */}
        {cmykProofing && (
          <div className="absolute bottom-4 left-4 pointer-events-none bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono px-2.5 py-1 rounded-md backdrop-blur-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            CMYK Print Simulation Active
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   SCENE & BACKGROUND RENDERING
   ========================================================================= */
function drawSceneBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: ProductShot['backgroundStyle']
) {
  if (style === 'clean-studio') {
    // Elegant soft studio vignette with subtle warm floor gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, '#26282E');
    grad.addColorStop(0.5, '#1B1C21');
    grad.addColorStop(1, '#111215');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Studio floor reflection / horizon line
    const floorGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
    floorGrad.addColorStop(0, 'rgba(0,0,0,0)');
    floorGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
  } else if (style === 'table-props') {
    // Warm natural oak timber tabletop
    const woodGrad = ctx.createLinearGradient(0, 0, w, h);
    woodGrad.addColorStop(0, '#2F2722');
    woodGrad.addColorStop(1, '#1C1714');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle wood planks lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1.5;
    for (let y = 100; y < h; y += 140) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + 20);
      ctx.stroke();
    }
  } else if (style === 'cafe-wood') {
    // Rustic espresso bar setting
    const cafeGrad = ctx.createRadialGradient(w * 0.3, h * 0.3, 100, w / 2, h / 2, w * 0.75);
    cafeGrad.addColorStop(0, '#3E2A1E');
    cafeGrad.addColorStop(0.6, '#231710');
    cafeGrad.addColorStop(1, '#110C08');
    ctx.fillStyle = cafeGrad;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#1A1B1F';
    ctx.fillRect(0, 0, w, h);
  }
}

/* =========================================================================
   PRODUCT BASE DRAWING (Apparel, Mugs, Hats, Totes, Tumblers)
   ========================================================================= */
function drawProductBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  productId: string,
  shotId: string,
  color: ProductColor
) {
  ctx.save();

  if (productId === 'heavyweight-tee') {
    drawTShirtBase(ctx, w, h, shotId, color);
  } else if (productId === 'heavy-hoodie') {
    drawHoodieBase(ctx, w, h, shotId, color);
  } else if (productId === 'ceramic-barista-mug') {
    drawMugBase(ctx, w, h, color);
  } else if (productId === 'canvas-tote') {
    drawToteBase(ctx, w, h, color);
  } else if (productId === 'dad-hat-cap') {
    drawHatBase(ctx, w, h, color);
  } else if (productId === 'stainless-tumbler') {
    drawTumblerBase(ctx, w, h, color);
  } else if (productId === 'hardcover-journal') {
    drawJournalBase(ctx, w, h, color);
  } else if (productId === 'diecut-stickers') {
    drawStickerBase(ctx, w, h, color);
  } else {
    drawTShirtBase(ctx, w, h, shotId, color);
  }

  ctx.restore();
}

function drawTShirtBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shotId: string,
  color: ProductColor
) {
  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 25;

  ctx.fillStyle = color.hex;
  ctx.beginPath();

  // Draw natural anatomical T-shirt silhouette
  const cx = w / 2;
  const topY = 180;

  // Collar left point
  ctx.moveTo(cx - 100, topY);
  // Collar curve
  if (shotId === 'tee-back-oversize') {
    ctx.quadraticCurveTo(cx, topY + 25, cx + 100, topY);
  } else {
    ctx.quadraticCurveTo(cx, topY + 70, cx + 100, topY);
  }

  // Right shoulder
  ctx.lineTo(cx + 340, topY + 75);
  // Right sleeve outer
  ctx.quadraticCurveTo(cx + 420, topY + 160, cx + 460, topY + 290);
  // Right sleeve opening
  ctx.lineTo(cx + 360, topY + 330);
  // Right armpit
  ctx.quadraticCurveTo(cx + 320, topY + 290, cx + 290, topY + 360);
  // Right waist & torso
  ctx.quadraticCurveTo(cx + 280, topY + 620, cx + 300, topY + 860);
  // Hemline bottom
  ctx.quadraticCurveTo(cx, topY + 880, cx - 300, topY + 860);
  // Left waist
  ctx.quadraticCurveTo(cx - 280, topY + 620, cx - 290, topY + 360);
  // Left armpit
  ctx.quadraticCurveTo(cx - 320, topY + 290, cx - 360, topY + 330);
  // Left sleeve opening
  ctx.lineTo(cx - 460, topY + 290);
  // Left sleeve outer
  ctx.quadraticCurveTo(cx - 420, topY + 160, cx - 340, topY + 75);
  // Left shoulder back to collar
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Collar Ribbing Detail
  ctx.save();
  ctx.lineWidth = 14;
  ctx.strokeStyle = color.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  if (shotId === 'tee-back-oversize') {
    ctx.moveTo(cx - 100, topY);
    ctx.quadraticCurveTo(cx, topY + 25, cx + 100, topY);
  } else {
    ctx.moveTo(cx - 100, topY);
    ctx.quadraticCurveTo(cx, topY + 70, cx + 100, topY);
    // Inside back collar band
    ctx.moveTo(cx - 96, topY);
    ctx.quadraticCurveTo(cx, topY - 15, cx + 96, topY);
  }
  ctx.stroke();

  // Shoulder seam top stitches
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx - 100, topY);
  ctx.lineTo(cx - 340, topY + 75);
  ctx.moveTo(cx + 100, topY);
  ctx.lineTo(cx + 340, topY + 75);
  ctx.stroke();
  ctx.restore();
}

function drawHoodieBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shotId: string,
  color: ProductColor
) {
  const cx = w / 2;
  const topY = 160;

  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 30;

  ctx.fillStyle = color.hex;
  ctx.beginPath();
  // Hood left curve
  ctx.moveTo(cx - 120, topY + 70);
  ctx.quadraticCurveTo(cx - 190, topY - 50, cx, topY - 80);
  ctx.quadraticCurveTo(cx + 190, topY - 50, cx + 120, topY + 70);
  // Right shoulder
  ctx.lineTo(cx + 370, topY + 120);
  // Right sleeve
  ctx.quadraticCurveTo(cx + 470, topY + 250, cx + 490, topY + 440);
  // Sleeve cuff
  ctx.lineTo(cx + 400, topY + 470);
  ctx.quadraticCurveTo(cx + 350, topY + 380, cx + 310, topY + 420);
  // Torso right
  ctx.quadraticCurveTo(cx + 300, topY + 700, cx + 315, topY + 880);
  // Ribbed waist hem
  ctx.lineTo(cx - 315, topY + 880);
  // Torso left
  ctx.quadraticCurveTo(cx - 300, topY + 700, cx - 310, topY + 420);
  ctx.quadraticCurveTo(cx - 350, topY + 380, cx - 400, topY + 470);
  ctx.lineTo(cx - 490, topY + 440);
  ctx.quadraticCurveTo(cx - 470, topY + 250, cx - 370, topY + 120);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Kangaroo pouch pocket (front shots only)
  if (shotId !== 'hoodie-back-statement') {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 200, topY + 680);
    ctx.lineTo(cx + 200, topY + 680);
    ctx.lineTo(cx + 215, topY + 870);
    ctx.lineTo(cx - 215, topY + 870);
    ctx.closePath();
    ctx.strokeStyle = color.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.14)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Pocket side slant openings
    ctx.beginPath();
    ctx.moveTo(cx - 200, topY + 680);
    ctx.lineTo(cx - 260, topY + 770);
    ctx.lineTo(cx - 215, topY + 870);
    ctx.moveTo(cx + 200, topY + 680);
    ctx.lineTo(cx + 260, topY + 770);
    ctx.lineTo(cx + 215, topY + 870);
    ctx.stroke();

    // Thick cotton drawstrings
    ctx.strokeStyle = '#ECE8DF';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left drawstring
    ctx.moveTo(cx - 45, topY + 80);
    ctx.quadraticCurveTo(cx - 65, topY + 220, cx - 50, topY + 320);
    // Right drawstring
    ctx.moveTo(cx + 45, topY + 80);
    ctx.quadraticCurveTo(cx + 60, topY + 230, cx + 70, topY + 340);
    ctx.stroke();

    // Metal aglets on tips
    ctx.fillStyle = '#C2C4CA';
    ctx.fillRect(cx - 54, topY + 320, 8, 24);
    ctx.fillRect(cx + 66, topY + 340, 8, 24);
    ctx.restore();
  }
}

function drawMugBase(ctx: CanvasRenderingContext2D, w: number, h: number, color: ProductColor) {
  const cx = w / 2;
  const topY = 320;
  const mugW = 420;
  const mugH = 520;

  ctx.save();
  // Ceramic drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 30;

  // Handle
  ctx.beginPath();
  ctx.lineWidth = 55;
  ctx.strokeStyle = color.hex;
  ctx.lineCap = 'round';
  ctx.arc(cx + 220, topY + mugH / 2 - 10, 140, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();

  // Mug Body
  ctx.fillStyle = color.hex;
  ctx.beginPath();
  // Top rim ellipse
  ctx.ellipse(cx, topY, mugW / 2, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cylinder sides
  ctx.beginPath();
  ctx.moveTo(cx - mugW / 2, topY);
  ctx.lineTo(cx - mugW / 2 + 15, topY + mugH);
  // Bottom curved base
  ctx.ellipse(cx, topY + mugH, mugW / 2 - 15, 45, 0, 0, Math.PI);
  ctx.lineTo(cx + mugW / 2, topY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Ceramic glossy highlight reflection on the left curve
  const glossGrad = ctx.createLinearGradient(cx - mugW / 2, 0, cx + mugW / 2, 0);
  glossGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
  glossGrad.addColorStop(0.15, 'rgba(255,255,255,0.45)');
  glossGrad.addColorStop(0.3, 'rgba(255,255,255,0.05)');
  glossGrad.addColorStop(0.7, 'rgba(0,0,0,0.02)');
  glossGrad.addColorStop(0.9, 'rgba(0,0,0,0.25)');
  glossGrad.addColorStop(1, 'rgba(255,255,255,0.15)');

  ctx.save();
  ctx.fillStyle = glossGrad;
  ctx.beginPath();
  ctx.moveTo(cx - mugW / 2, topY);
  ctx.lineTo(cx - mugW / 2 + 15, topY + mugH);
  ctx.ellipse(cx, topY + mugH, mugW / 2 - 15, 45, 0, 0, Math.PI);
  ctx.lineTo(cx + mugW / 2, topY);
  ctx.ellipse(cx, topY, mugW / 2, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawToteBase(ctx: CanvasRenderingContext2D, w: number, h: number, color: ProductColor) {
  const cx = w / 2;
  const topY = 380;
  const bagW = 540;
  const bagH = 620;

  ctx.save();
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 25;

  // Sturdy webbed canvas straps
  ctx.strokeStyle = color.hex;
  ctx.lineWidth = 36;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // Left strap
  ctx.moveTo(cx - 150, topY + 100);
  ctx.bezierCurveTo(cx - 170, topY - 260, cx - 30, topY - 260, cx - 60, topY + 100);
  // Right strap
  ctx.moveTo(cx + 60, topY + 100);
  ctx.bezierCurveTo(cx + 30, topY - 260, cx + 170, topY - 260, cx + 150, topY + 100);
  ctx.stroke();

  // Bag Body
  ctx.fillStyle = color.hex;
  ctx.beginPath();
  ctx.moveTo(cx - bagW / 2, topY);
  ctx.quadraticCurveTo(cx, topY - 15, cx + bagW / 2, topY);
  ctx.quadraticCurveTo(cx + bagW / 2 + 10, topY + bagH / 2, cx + bagW / 2 - 20, topY + bagH);
  ctx.quadraticCurveTo(cx, topY + bagH + 20, cx - bagW / 2 + 20, topY + bagH);
  ctx.quadraticCurveTo(cx - bagW / 2 - 10, topY + bagH / 2, cx - bagW / 2, topY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Top hem and reinforced cross-box handle stitching
  ctx.save();
  ctx.strokeStyle = color.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 4]);

  // Top hemline
  ctx.beginPath();
  ctx.moveTo(cx - bagW / 2 + 10, topY + 45);
  ctx.lineTo(cx + bagW / 2 - 10, topY + 45);
  ctx.stroke();

  // Box X stitches on straps
  [-150, -60, 60, 150].forEach((sx) => {
    ctx.strokeRect(cx + sx - 16, topY + 30, 32, 40);
    ctx.beginPath();
    ctx.moveTo(cx + sx - 16, topY + 30);
    ctx.lineTo(cx + sx + 16, topY + 70);
    ctx.moveTo(cx + sx + 16, topY + 30);
    ctx.lineTo(cx + sx - 16, topY + 70);
    ctx.stroke();
  });
  ctx.restore();
}

function drawHatBase(ctx: CanvasRenderingContext2D, w: number, h: number, color: ProductColor) {
  const cx = w / 2;
  const cy = h / 2 - 20;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 30;

  // Crown dome
  ctx.fillStyle = color.hex;
  ctx.beginPath();
  ctx.moveTo(cx - 220, cy + 80);
  ctx.bezierCurveTo(cx - 260, cy - 140, cx - 120, cy - 230, cx, cy - 240);
  ctx.bezierCurveTo(cx + 120, cy - 230, cx + 260, cy - 140, cx + 220, cy + 80);
  ctx.closePath();
  ctx.fill();

  // Curved visor / brim
  ctx.beginPath();
  ctx.moveTo(cx - 250, cy + 80);
  ctx.quadraticCurveTo(cx, cy + 180, cx + 250, cy + 80);
  ctx.quadraticCurveTo(cx + 270, cy + 150, cx, cy + 240);
  ctx.quadraticCurveTo(cx - 270, cy + 150, cx - 250, cy + 80);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Top squatchee button
  ctx.fillStyle = color.isDark ? '#333' : '#B8A88F';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 240, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Panel seams
  ctx.save();
  ctx.strokeStyle = color.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 240);
  ctx.quadraticCurveTo(cx, cy - 60, cx, cy + 80); // Center front seam
  ctx.moveTo(cx, cy - 240);
  ctx.quadraticCurveTo(cx - 90, cy - 40, cx - 130, cy + 80); // Left seam
  ctx.moveTo(cx, cy - 240);
  ctx.quadraticCurveTo(cx + 90, cy - 40, cx + 130, cy + 80); // Right seam
  ctx.stroke();
  ctx.restore();
}

function drawTumblerBase(ctx: CanvasRenderingContext2D, w: number, h: number, color: ProductColor) {
  const cx = w / 2;
  const topY = 240;
  const bottleW = 280;
  const bottleH = 680;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 25;

  // Steel body
  ctx.fillStyle = color.hex;
  ctx.beginPath();
  ctx.roundRect(cx - bottleW / 2, topY + 60, bottleW, bottleH, [0, 0, 35, 35]);
  ctx.fill();

  // Stainless steel top lip & lid
  ctx.fillStyle = '#40434A';
  ctx.beginPath();
  ctx.roundRect(cx - bottleW / 2 + 10, topY, bottleW - 20, 60, [12, 12, 0, 0]);
  ctx.fill();

  // Silver steel rim accent
  ctx.fillStyle = '#C8CCD4';
  ctx.fillRect(cx - bottleW / 2, topY + 54, bottleW, 6);
  ctx.restore();

  // Cylindrical metallic gradient
  const cylGrad = ctx.createLinearGradient(cx - bottleW / 2, 0, cx + bottleW / 2, 0);
  cylGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
  cylGrad.addColorStop(0.2, 'rgba(255,255,255,0.25)');
  cylGrad.addColorStop(0.4, 'rgba(255,255,255,0.05)');
  cylGrad.addColorStop(0.8, 'rgba(0,0,0,0.1)');
  cylGrad.addColorStop(1, 'rgba(0,0,0,0.45)');

  ctx.fillStyle = cylGrad;
  ctx.beginPath();
  ctx.roundRect(cx - bottleW / 2, topY + 60, bottleW, bottleH, [0, 0, 35, 35]);
  ctx.fill();
}

function drawJournalBase(ctx: CanvasRenderingContext2D, w: number, h: number, color: ProductColor) {
  const cx = w / 2;
  const topY = 240;
  const bookW = 440;
  const bookH = 680;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 30;

  // Book cover
  ctx.fillStyle = color.hex;
  ctx.beginPath();
  ctx.roundRect(cx - bookW / 2, topY, bookW, bookH, [8, 24, 24, 8]);
  ctx.fill();

  // Spine crease shadow
  const spineGrad = ctx.createLinearGradient(cx - bookW / 2, 0, cx - bookW / 2 + 50, 0);
  spineGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
  spineGrad.addColorStop(0.4, 'rgba(0,0,0,0.2)');
  spineGrad.addColorStop(0.8, 'rgba(255,255,255,0.15)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(cx - bookW / 2, topY, 50, bookH);

  // Elastic closure band
  ctx.fillStyle = color.isDark ? '#2A2B2E' : '#4A3B32';
  ctx.fillRect(cx + bookW / 2 - 60, topY, 24, bookH);
  ctx.restore();
}

function drawStickerBase(ctx: CanvasRenderingContext2D, w: number, h: number, color: ProductColor) {
  const cx = w / 2;
  const cy = h / 2;
  const size = 520;

  ctx.save();
  // Die-cut floating shadow
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 20;

  // White peel margin border
  ctx.fillStyle = color.hex;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* =========================================================================
   LOGO PLACEMENT & BLENDING (Warping, Print Textures, Embroidery)
   ========================================================================= */
function drawPlacedLogo({
  ctx,
  width,
  height,
  logoImage,
  shot,
  transform,
  product,
  technique,
  cmykProofing,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  logoImage: HTMLImageElement;
  shot: ProductShot;
  transform: LogoTransform;
  product: ProductItem;
  technique: PrintTechnique;
  cmykProofing: boolean;
}) {
  const box = shot.printAreaBox;

  // Physical pixel print area in the mockup frame
  const areaX = (box.x / 100) * width;
  const areaY = (box.y / 100) * height;
  const areaW = (box.width / 100) * width;
  const areaH = (box.height / 100) * height;

  // Optical center with user offset
  const centerX = areaX + areaW / 2 + (transform.x / 100) * areaW;
  const centerY = areaY + areaH / 2 + (transform.y / 100) * areaH;

  // Aspect ratio preserving dimensions
  const aspect = logoImage.width / logoImage.height;
  let targetW = areaW;
  let targetH = areaW / aspect;

  if (targetH > areaH) {
    targetH = areaH;
    targetW = areaH * aspect;
  }

  const finalW = targetW * transform.scale;
  const finalH = targetH * transform.scale;

  ctx.save();

  // Clip within printable area if desired
  ctx.translate(centerX, centerY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.globalAlpha = transform.opacity;

  // Print Technique Blend Mode
  if (technique === 'Direct-to-Garment (DTG)') {
    // DTG sinks into cotton weave: multiply/soft-light blend
    ctx.globalCompositeOperation = 'source-over';
  } else if (technique === 'Screen Printing') {
    ctx.globalCompositeOperation = 'source-over';
  } else if (technique === 'Laser Engraving') {
    ctx.globalCompositeOperation = 'luminosity';
  }

  // Apply logo color filters
  applyLogoFilterToContext(ctx, transform.colorFilter);

  // CMYK soft-proofing simulation: subtle desaturation of luminous out-of-gamut neons
  if (cmykProofing) {
    ctx.filter = (ctx.filter === 'none' ? '' : `${ctx.filter} `) + 'saturate(0.92) contrast(0.96)';
  }

  // Draw logo image
  ctx.drawImage(
    logoImage,
    -finalW / 2,
    -finalH / 2,
    finalW,
    finalH
  );

  // 3D Puff Embroidery stitch thread relief effect
  if (technique === '3D Puff Embroidery' || transform.colorFilter === 'embroidery-effect') {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    // Micro stitch ridges across bounds
    for (let sy = -finalH / 2; sy < finalH / 2; sy += 6) {
      ctx.beginPath();
      ctx.moveTo(-finalW / 2, sy);
      ctx.lineTo(finalW / 2, sy + 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Foil sheen effect
  if (transform.colorFilter === 'gold-foil' || transform.colorFilter === 'silver-foil') {
    ctx.save();
    ctx.globalCompositeOperation = 'color-dodge';
    const foilGrad = ctx.createLinearGradient(-finalW / 2, -finalH / 2, finalW / 2, finalH / 2);
    foilGrad.addColorStop(0, 'rgba(255,255,255,0)');
    foilGrad.addColorStop(0.45, 'rgba(255,255,255,0.7)');
    foilGrad.addColorStop(0.55, 'rgba(255,255,255,0)');
    ctx.fillStyle = foilGrad;
    ctx.fillRect(-finalW / 2, -finalH / 2, finalW, finalH);
    ctx.restore();
  }

  ctx.restore();
}

/* =========================================================================
   OVERLAY SHADOWS, FABRIC WRINKLES & SPECULAR LIGHTING
   ========================================================================= */
function drawProductOverlays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  productId: string,
  shotId: string
) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';

  if (productId === 'heavyweight-tee' || productId === 'heavy-hoodie') {
    // Natural organic fabric folds and chest draping wrinkles
    const cx = w / 2;
    const topY = 200;

    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';

    // Left chest fold
    ctx.beginPath();
    ctx.moveTo(cx - 240, topY + 220);
    ctx.quadraticCurveTo(cx - 150, topY + 340, cx - 180, topY + 460);
    ctx.stroke();

    // Right chest fold
    ctx.beginPath();
    ctx.moveTo(cx + 240, topY + 220);
    ctx.quadraticCurveTo(cx + 150, topY + 340, cx + 180, topY + 460);
    ctx.stroke();

    // Torso waist drape
    ctx.lineWidth = 18;
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.moveTo(cx - 180, topY + 540);
    ctx.quadraticCurveTo(cx, topY + 570, cx + 180, topY + 540);
    ctx.stroke();
  } else if (productId === 'ceramic-barista-mug') {
    // Extra ceramic cylindrical shadow on right edge
    const cx = w / 2;
    const rightShadow = ctx.createLinearGradient(cx + 100, 0, cx + 220, 0);
    rightShadow.addColorStop(0, 'rgba(0,0,0,0)');
    rightShadow.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = rightShadow;
    ctx.fillRect(cx + 100, 300, 120, 560);
  }

  ctx.restore();
}

/* =========================================================================
   PRINT SAFE ZONE & ALIGNMENT GUIDES
   ========================================================================= */
function drawSafeZoneOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shot: ProductShot,
  product: ProductItem,
  transform: LogoTransform,
  nearH: boolean,
  nearV: boolean
) {
  const box = shot.printAreaBox;
  const areaX = (box.x / 100) * w;
  const areaY = (box.y / 100) * h;
  const areaW = (box.width / 100) * w;
  const areaH = (box.height / 100) * h;

  ctx.save();

  // Print Bed Outer Boundary (cyan dashed)
  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(areaX, areaY, areaW, areaH);

  // Center axes guidelines (magenta / cyan)
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;

  // Horizontal center crosshair
  ctx.strokeStyle = nearH ? '#10B981' : 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.moveTo(areaX + areaW / 2, areaY);
  ctx.lineTo(areaX + areaW / 2, areaY + areaH);
  ctx.stroke();

  // Vertical center crosshair
  ctx.strokeStyle = nearV ? '#10B981' : 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.moveTo(areaX, areaY + areaH / 2);
  ctx.lineTo(areaX + areaW, areaY + areaH / 2);
  ctx.stroke();

  // Corner brackets
  ctx.strokeStyle = '#06B6D4';
  ctx.setLineDash([]);
  ctx.lineWidth = 3.5;
  const bracketLen = 18;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(areaX, areaY + bracketLen);
  ctx.lineTo(areaX, areaY);
  ctx.lineTo(areaX + bracketLen, areaY);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(areaX + areaW - bracketLen, areaY);
  ctx.lineTo(areaX + areaW, areaY);
  ctx.lineTo(areaX + areaW, areaY + bracketLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(areaX, areaY + areaH - bracketLen);
  ctx.lineTo(areaX, areaY + areaH);
  ctx.lineTo(areaX + bracketLen, areaY + areaH);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(areaX + areaW - bracketLen, areaY + areaH);
  ctx.lineTo(areaX + areaW, areaY + areaH);
  ctx.lineTo(areaX + areaW, areaY + areaH - bracketLen);
  ctx.stroke();

  // Safe area label
  ctx.fillStyle = '#06B6D4';
  ctx.font = '600 18px "JetBrains Mono", monospace';
  ctx.fillText(
    `PRINT BED: ${product.specs.widthInches}" x ${product.specs.heightInches}"`,
    areaX + 8,
    areaY - 12
  );

  ctx.restore();
}

function drawSpecsMeasurementGuides(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shot: ProductShot,
  product: ProductItem
) {
  const box = shot.printAreaBox;
  const areaX = (box.x / 100) * w;
  const areaY = (box.y / 100) * h;
  const areaW = (box.width / 100) * w;
  const areaH = (box.height / 100) * h;

  ctx.save();
  ctx.strokeStyle = '#F59E0B';
  ctx.fillStyle = '#F59E0B';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.lineWidth = 2;

  // Top offset callout
  ctx.beginPath();
  ctx.moveTo(areaX + areaW / 2, areaY - 40);
  ctx.lineTo(areaX + areaW / 2, areaY);
  ctx.stroke();

  // Offset tag
  ctx.fillText(`▲ ${product.specs.topOffsetDescription}`, areaX + 10, areaY - 45);

  // Width dimension arrows
  ctx.beginPath();
  ctx.moveTo(areaX, areaY + areaH + 30);
  ctx.lineTo(areaX + areaW, areaY + areaH + 30);
  ctx.stroke();
  ctx.fillText(`${product.specs.widthInches} INCHES WIDTH`, areaX + areaW / 2 - 90, areaY + areaH + 54);

  ctx.restore();
}
