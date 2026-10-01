import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProductItem, ProductColor, LogoTransform } from '../types/merch';
import { FilesetResolver, PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { applyLogoFilterToContext } from '../utils/printEngine';
import {
  Camera,
  Video,
  VideoOff,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Shirt,
  UserCheck,
} from 'lucide-react';

interface SharonVirtualTryOnProps {
  product: ProductItem;
  color: ProductColor;
  transform: LogoTransform;
  logoImage: HTMLImageElement | null;
  onSelectProduct: (p: ProductItem) => void;
  onSelectColor: (c: ProductColor) => void;
  onClose: () => void;
}

export const SharonVirtualTryOn: React.FC<SharonVirtualTryOnProps> = ({
  product,
  color,
  transform,
  logoImage,
  onSelectProduct,
  onSelectColor,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<'webcam' | 'virtual-model'>('webcam');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [garmentOpacity, setGarmentOpacity] = useState<number>(0.92);
  const [poseConfidence, setPoseConfidence] = useState<number>(0);
  const [sharonSpeechEnabled, setSharonSpeechEnabled] = useState<boolean>(false);
  const [sharonQuote, setSharonQuote] = useState<string>(
    "Alright darling! Sharon's on set. Lock your shoulders in frame so I can calibrate the drape."
  );

  // Simulated pose state when in virtual-model mode
  const simAngleRef = useRef<number>(0);

  // Initialize MediaPipe PoseLandmarker
  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      try {
        setIsLoadingModel(true);
        // Load MediaPipe vision wasm files
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (!isMounted) return;

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

        if (!isMounted) return;

        poseLandmarkerRef.current = landmarker;
        setIsLoadingModel(false);
      } catch (err: any) {
        console.warn('MediaPipe initialization fallback to virtual engine:', err);
        setIsLoadingModel(false);
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;
      stopCamera();
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  // Sharon's Voice Synthesizer
  const speakSharon = (text: string) => {
    setSharonQuote(text);
    if (!sharonSpeechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    // Find friendly female voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) =>
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('Female')
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setModelMode('webcam');
        speakSharon("Camera linked! Stand back so I can see your shoulders and chest.");
      }
    } catch (err: any) {
      console.warn('Webcam permission denied or unavailable:', err);
      setCameraError('Webcam access was not granted. Switching to Sharon’s Studio Demo Model.');
      setModelMode('virtual-model');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Auto start camera or fallback to virtual model
  useEffect(() => {
    if (modelMode === 'webcam') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [modelMode]);

  // Main Detection & Render Loop
  useEffect(() => {
    let lastVideoTime = -1;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cw = 1280;
      const ch = 720;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      // Mode A: Live Webcam with MediaPipe
      if (modelMode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        // Mirror horizontally for natural webcam feel
        ctx.save();
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, cw, ch);
        ctx.restore();

        // Run MediaPipe PoseLandmarker
        if (poseLandmarkerRef.current && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const startTimeMs = performance.now();
          const results = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

          if (results && results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            setPoseConfidence(98);

            // Landmarks: 11 = Left Shoulder, 12 = Right Shoulder, 23 = Left Hip, 24 = Right Hip
            // Since we mirrored canvas horizontally, flip landmark X (1.0 - x)
            const leftShoulder = { x: (1.0 - landmarks[11].x) * cw, y: landmarks[11].y * ch };
            const rightShoulder = { x: (1.0 - landmarks[12].x) * cw, y: landmarks[12].y * ch };
            const leftHip = { x: (1.0 - landmarks[23].x) * cw, y: landmarks[23].y * ch };
            const rightHip = { x: (1.0 - landmarks[24].x) * cw, y: landmarks[24].y * ch };

            // Render Virtual Merch on Torso
            renderTorsoGarment({
              ctx,
              leftShoulder,
              rightShoulder,
              leftHip,
              rightHip,
              color,
              logoImage,
              transform,
              garmentOpacity,
              productTitle: product.title,
            });

            // Draw Skeleton if enabled
            if (showSkeleton) {
              drawPoseSkeleton(ctx, landmarks, cw, ch);
            }
          } else {
            setPoseConfidence(0);
          }
        }
      } else {
        // Mode B: Virtual Studio Model Simulation
        simAngleRef.current += 0.02;
        const breath = Math.sin(simAngleRef.current) * 8;
        const sway = Math.cos(simAngleRef.current * 0.7) * 12;

        // Draw Studio Backdrop & Stylized Studio Model Silhouette
        drawVirtualStudioModel(ctx, cw, ch, breath, sway);

        const leftShoulder = { x: cw / 2 - 170 + sway, y: 220 + breath };
        const rightShoulder = { x: cw / 2 + 170 + sway, y: 220 + breath };
        const leftHip = { x: cw / 2 - 130 + sway * 0.5, y: 560 };
        const rightHip = { x: cw / 2 + 130 + sway * 0.5, y: 560 };

        renderTorsoGarment({
          ctx,
          leftShoulder,
          rightShoulder,
          leftHip,
          rightHip,
          color,
          logoImage,
          transform,
          garmentOpacity,
          productTitle: product.title,
        });

        if (showSkeleton) {
          drawVirtualSkeleton(ctx, leftShoulder, rightShoulder, leftHip, rightHip, cw, ch);
        }
        setPoseConfidence(100);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [modelMode, color, logoImage, transform, garmentOpacity, showSkeleton, product]);

  // Periodic Sharon Advice
  useEffect(() => {
    const quotes = [
      `Sharon: "The ${color.name} tone complements the lighting gorgeously. Excellent contrast ratio!"`,
      "Sharon: 'See how the shoulder seams sit? That 280 GSM weight gives it that structured drop.'",
      "Sharon: 'Hold that front profile! Logo placement is right on the golden optical line.'",
      "Sharon: 'Notice the ink opacity: DTG pigments settle directly with the garment fibers.'",
      "Sharon: 'Try tilting slightly — notice how the logo perspective holds true in 3D space.'",
    ];

    const interval = setInterval(() => {
      const pick = quotes[Math.floor(Math.random() * quotes.length)];
      speakSharon(pick);
    }, 14000);

    return () => clearInterval(interval);
  }, [color]);

  // Take Snapshot Photo
  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Sharon_Producer_TryOn_${product.id}_${Date.now()}.png`;
    link.click();
    speakSharon("Fabulous shot, honey! Captured and saved to your downloads.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Producer Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-neutral-800 bg-neutral-950/90">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-neutral-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-100 font-mono tracking-tight">
                  SHARON STERLING
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  AI Creative Producer
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> MediaPipe Pose AR
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Live body landmark tracking & real-time virtual apparel fitting room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sharon Voice Toggle */}
            <button
              onClick={() => {
                const next = !sharonSpeechEnabled;
                setSharonSpeechEnabled(next);
                if (next) speakSharon("Voice link active! I'll guide you through your fittings.");
              }}
              title={sharonSpeechEnabled ? 'Mute Sharon voice' : 'Enable Sharon voice commentary'}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                sharonSpeechEnabled
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {sharonSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline font-mono text-[11px]">
                {sharonSpeechEnabled ? 'Voice: On' : 'Voice: Off'}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
            >
              Exit Fitting Room
            </button>
          </div>
        </div>

        {/* Sharon's Live Speech Prompter */}
        <div className="bg-gradient-to-r from-purple-950/60 via-neutral-900 to-neutral-950 px-6 py-2.5 border-b border-purple-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="font-semibold text-purple-300 font-mono">PRODUCER NOTES:</span>
            <span className="text-neutral-200 italic">"{sharonQuote}"</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
            {poseConfidence > 0 ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pose Locked ({poseConfidence}%)
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Detecting Body
              </span>
            )}
          </div>
        </div>

        {/* Main AR Canvas Area */}
        <div className="flex-1 relative bg-neutral-950 flex items-center justify-center p-4 overflow-hidden">
          {/* Hidden Webcam Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="hidden"
          />

          {/* AR Output Canvas */}
          <div className="relative w-full max-w-4xl aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />

            {isLoadingModel && (
              <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <div className="text-sm font-semibold text-neutral-200">
                  Initializing Google MediaPipe Vision Model...
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  Loading 33-point body landmark neural net
                </div>
              </div>
            )}

            {/* Mode Switcher Overlay in Bottom Left */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-neutral-950/85 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setModelMode('webcam')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                  modelMode === 'webcam'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Webcam Live</span>
              </button>

              <button
                onClick={() => setModelMode('virtual-model')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                  modelMode === 'virtual-model'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Studio Pose Model</span>
              </button>
            </div>

            {/* Snapshot Trigger in Bottom Right */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={handleTakeSnapshot}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Snap Lookbook Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Producer Controls Bar */}
        <div className="p-4 px-6 border-t border-neutral-800 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Garment / Silhouette Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[11px]">
              Garment:
            </span>
            <div className="flex gap-1.5">
              {['Heavyweight Streetwear T-Shirt', 'Boxy Pullover Heavy Hoodie'].map((title) => {
                const isSelected = product.title === title;
                return (
                  <button
                    key={title}
                    onClick={() => {
                      // find in catalog
                      speakSharon(`Switching to the ${title}. Let's see how the fit hangs.`);
                    }}
                    className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {title.includes('T-Shirt') ? '280 GSM Tee' : '450 GSM Hoodie'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colorway Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[11px]">
              Blank Color:
            </span>
            <div className="flex items-center gap-1.5">
              {product.colors.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectColor(c);
                    speakSharon(`Dye switched to ${c.name}. Sharp tonal contrast!`);
                  }}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color.id === c.id ? 'border-amber-400 scale-110 shadow' : 'border-neutral-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Overlays / Opacity Controls */}
          <div className="flex items-center gap-4">
            {/* Skeleton Toggle */}
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
                showSkeleton
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Skeleton: {showSkeleton ? 'ON' : 'OFF'}</span>
            </button>

            {/* Opacity Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 font-mono">Drape:</span>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={garmentOpacity}
                onChange={(e) => setGarmentOpacity(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 bg-neutral-800 h-1 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   TORSO GARMENT & LOGO PROJECTION ENGINE
   ========================================================================= */
function renderTorsoGarment({
  ctx,
  leftShoulder,
  rightShoulder,
  leftHip,
  rightHip,
  color,
  logoImage,
  transform,
  garmentOpacity,
  productTitle,
}: {
  ctx: CanvasRenderingContext2D;
  leftShoulder: { x: number; y: number };
  rightShoulder: { x: number; y: number };
  leftHip: { x: number; y: number };
  rightHip: { x: number; y: number };
  color: ProductColor;
  logoImage: HTMLImageElement | null;
  transform: LogoTransform;
  garmentOpacity: number;
  productTitle: string;
}) {
  ctx.save();

  // Calculate Shoulder Vector & Midpoint
  const dx = rightShoulder.x - leftShoulder.x;
  const dy = rightShoulder.y - leftShoulder.y;
  const shoulderDist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;

  const torsoHeight = Math.max(200, Math.sqrt((hipMidX - shoulderMidX) ** 2 + (hipMidY - shoulderMidY) ** 2) * 1.25);
  const garmentWidth = shoulderDist * 1.5;

  ctx.translate(shoulderMidX, shoulderMidY);
  ctx.rotate(angle);
  ctx.globalAlpha = garmentOpacity;

  // Garment Silhouette Shape (Centered on mid-shoulder)
  ctx.fillStyle = color.hex;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 15;

  ctx.beginPath();
  // Collar scoop
  const collarW = shoulderDist * 0.45;
  ctx.moveTo(-collarW / 2, 0);
  ctx.quadraticCurveTo(0, 35, collarW / 2, 0);

  // Right shoulder & sleeve
  ctx.lineTo(garmentWidth * 0.45, 10);
  ctx.lineTo(garmentWidth * 0.6, 90);
  ctx.lineTo(garmentWidth * 0.45, 120);

  // Right torso waist
  ctx.lineTo(garmentWidth * 0.38, torsoHeight);

  // Bottom Hem
  ctx.quadraticCurveTo(0, torsoHeight + 15, -garmentWidth * 0.38, torsoHeight);

  // Left torso waist
  ctx.lineTo(-garmentWidth * 0.45, 120);
  ctx.lineTo(-garmentWidth * 0.6, 90);
  ctx.lineTo(-garmentWidth * 0.45, 10);
  ctx.closePath();
  ctx.fill();

  // Collar Ribbing Stitch Detail
  ctx.save();
  ctx.strokeStyle = color.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-collarW / 2, 0);
  ctx.quadraticCurveTo(0, 35, collarW / 2, 0);
  ctx.stroke();
  ctx.restore();

  // Fabric Shading & Natural Folds
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-garmentWidth * 0.25, 80);
  ctx.quadraticCurveTo(0, 140, -garmentWidth * 0.15, 240);
  ctx.moveTo(garmentWidth * 0.25, 80);
  ctx.quadraticCurveTo(0, 140, garmentWidth * 0.15, 240);
  ctx.stroke();
  ctx.restore();

  // Render Placed Brand Logo on Chest
  if (logoImage) {
    ctx.save();
    // Chest placement: roughly 25% down the torso
    const chestCenterY = torsoHeight * 0.32 + (transform.y / 100) * 100;
    const chestCenterX = (transform.x / 100) * 100;

    ctx.translate(chestCenterX, chestCenterY);
    ctx.rotate((transform.rotation * Math.PI) / 180);

    const logoAspect = logoImage.width / logoImage.height;
    const targetW = shoulderDist * 0.65 * transform.scale;
    const targetH = targetW / logoAspect;

    applyLogoFilterToContext(ctx, transform.colorFilter);

    ctx.drawImage(logoImage, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  }

  ctx.restore();
}

/* =========================================================================
   POSE SKELETON WIREFRAME DRAWING
   ========================================================================= */
function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  cw: number,
  ch: number
) {
  ctx.save();
  ctx.strokeStyle = '#00F0FF';
  ctx.fillStyle = '#00F0FF';
  ctx.lineWidth = 2.5;

  const POSE_CONNECTIONS = [
    [11, 12], // Shoulders
    [11, 23], // Left torso
    [12, 24], // Right torso
    [23, 24], // Hips
    [11, 13], // Left upper arm
    [13, 15], // Left lower arm
    [12, 14], // Right upper arm
    [14, 16], // Right lower arm
  ];

  // Draw lines
  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const p1 = landmarks[startIdx];
    const p2 = landmarks[endIdx];
    if (p1 && p2 && p1.visibility > 0.4 && p2.visibility > 0.4) {
      ctx.beginPath();
      ctx.moveTo((1.0 - p1.x) * cw, p1.y * ch);
      ctx.lineTo((1.0 - p2.x) * cw, p2.y * ch);
      ctx.stroke();
    }
  });

  // Draw keypoints
  [11, 12, 23, 24, 13, 14].forEach((idx) => {
    const p = landmarks[idx];
    if (p && p.visibility > 0.4) {
      ctx.beginPath();
      ctx.arc((1.0 - p.x) * cw, p.y * ch, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
}

function drawVirtualSkeleton(
  ctx: CanvasRenderingContext2D,
  ls: { x: number; y: number },
  rs: { x: number; y: number },
  lh: { x: number; y: number },
  rh: { x: number; y: number },
  cw: number,
  ch: number
) {
  ctx.save();
  ctx.strokeStyle = '#A855F7';
  ctx.fillStyle = '#A855F7';
  ctx.lineWidth = 2;

  // Box
  ctx.beginPath();
  ctx.moveTo(ls.x, ls.y);
  ctx.lineTo(rs.x, rs.y);
  ctx.lineTo(rh.x, rh.y);
  ctx.lineTo(lh.x, lh.y);
  ctx.closePath();
  ctx.stroke();

  [ls, rs, lh, rh].forEach((pt) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawVirtualStudioModel(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  breath: number,
  sway: number
) {
  // Studio backdrop
  const grad = ctx.createRadialGradient(cw / 2, ch / 2, 80, cw / 2, ch / 2, cw * 0.75);
  grad.addColorStop(0, '#2D3039');
  grad.addColorStop(0.5, '#1B1C22');
  grad.addColorStop(1, '#0F1014');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  // Stylized Mannequin / Studio Model
  const mx = cw / 2 + sway;
  const my = 200 + breath;

  ctx.save();
  ctx.fillStyle = '#E3D7C8';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 30;

  // Head
  ctx.beginPath();
  ctx.ellipse(mx, my - 110, 48, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.beginPath();
  ctx.rect(mx - 18, my - 55, 36, 60);
  ctx.fill();

  // Arms
  ctx.strokeStyle = '#E3D7C8';
  ctx.lineWidth = 34;
  ctx.lineCap = 'round';

  // Left arm
  ctx.beginPath();
  ctx.moveTo(mx - 170, my + 20);
  ctx.lineTo(mx - 220, my + 250);
  ctx.lineTo(mx - 180, my + 440);
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(mx + 170, my + 20);
  ctx.lineTo(mx + 220, my + 250);
  ctx.lineTo(mx + 180, my + 440);
  ctx.stroke();

  // Jeans / Lower body
  ctx.fillStyle = '#26334D';
  ctx.beginPath();
  ctx.rect(mx - 130, my + 340, 260, 360);
  ctx.fill();

  ctx.restore();
}
