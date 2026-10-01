import React, { useState } from 'react';
import {
  Download,
  Chrome,
  CheckCircle2,
  FolderArchive,
  Layers,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Tv,
} from 'lucide-react';
import JSZip from 'jszip';
import { downloadBlob } from '../utils/printEngine';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isBuildingZip, setIsBuildingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Function to build and download the complete ready-to-load Chrome Extension ZIP
  const handleDownloadExtensionZip = async () => {
    try {
      setIsBuildingZip(true);
      const zip = new JSZip();

      // 1. manifest.json (Manifest V3)
      const manifestV3 = {
        manifest_version: 3,
        name: "MerchCraft - Free On-Demand AI Merch Mockups (Ad-Supported)",
        short_name: "MerchCraft",
        version: "3.8.0",
        description: "100% Free on-demand merch mockup generator: upload logo, place on realistic products, consider & alter, and export 300 DPI print-ready files. Supported by ethical creator sponsors.",
        action: {
          default_popup: "popup.html",
          default_title: "Open MerchCraft Mockup Studio",
          default_icon: {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
          }
        },
        icons: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        },
        permissions: [
          "activeTab",
          "storage",
          "downloads"
        ],
        host_permissions: [
          "https://*/*"
        ],
        background: {
          service_worker: "background.js"
        },
        content_security_policy: {
          extension_pages: "script-src 'self'; object-src 'self';"
        }
      };
      zip.file('manifest.json', JSON.stringify(manifestV3, null, 2));

      // 2. background.js
      const backgroundJs = `// MerchCraft Ad-Supported Chrome Extension Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('MerchCraft Free Extension installed successfully!');
  chrome.storage.local.set({
    adSupported: true,
    sponsorClicks: 0,
    installDate: new Date().toISOString()
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('popup.html')
  });
});
`;
      zip.file('background.js', backgroundJs);

      // 3. popup.html
      const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MerchCraft Studio Popup</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 480px;
      height: 600px;
      background: #0a0a0c;
      color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 14px 16px;
      background: #141418;
      border-bottom: 1px solid #26262e;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 15px;
      color: #fff;
    }
    .badge {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .ad-banner {
      background: linear-gradient(90deg, #1c1c24, #121216);
      border-bottom: 1px solid #2d2d38;
      padding: 8px 16px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ad-banner a {
      color: #f59e0b;
      text-decoration: none;
      font-weight: bold;
      background: rgba(245, 158, 11, 0.15);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    iframe {
      flex: 1;
      width: 100%;
      border: none;
      background: #0a0a0c;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>MERCHCRAFT</span>
      <span class="badge">FREE EXTENSION</span>
    </div>
    <div style="font-size: 11px; color: #888;">Ad-Supported v3.8</div>
  </header>
  <div class="ad-banner">
    <span>⭐ <b>Sponsor:</b> Wholesale 280 GSM DTG Blanks (20% Off)</span>
    <a href="https://example.com/sponsor" target="_blank">Claim Deal</a>
  </div>
  <iframe src="${window.location.origin}"></iframe>
</body>
</html>`;
      zip.file('popup.html', popupHtml);

      // 4. README installation instructions
      const readmeText = `================================================================================
MERCHCRAFT FREE CHROME EXTENSION (AD-SUPPORTED)
================================================================================
Thank you for downloading MerchCraft for Google Chrome!

HOW TO INSTALL IN 3 EASY STEPS:
--------------------------------------------------------------------------------
1. Unzip / Extract this folder to a permanent folder on your computer.
2. In Google Chrome, go to: chrome://extensions/
3. In the top-right corner, turn ON "Developer mode".
4. Click the "Load unpacked" button in the top-left corner.
5. Select the extracted folder containing 'manifest.json'.

That's it! MerchCraft will appear in your Chrome extensions puzzle toolbar.
Pin it for instant 1-click access to on-demand merch mockups and 300 DPI exports!

BUSINESS MODEL (100% FREE):
--------------------------------------------------------------------------------
This extension is funded entirely through non-intrusive creator sponsor ads
(wholesale blank suppliers, global fulfillment networks, and digitizers).
All features—including MediaPipe AR Try-On, 300 DPI downloads, and Sharon AI—
are completely free to use with zero subscriptions.
================================================================================`;
      zip.file('README.txt', readmeText);

      // 5. Generate dummy PNG icons for Chrome extension
      const iconCanvas = document.createElement('canvas');
      iconCanvas.width = 128;
      iconCanvas.height = 128;
      const ctx = iconCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(0, 0, 128, 128, 24);
        ctx.fill();
        ctx.fillStyle = '#0a0a0c';
        ctx.font = 'bold 72px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', 64, 66);

        const iconBlob = await new Promise<Blob | null>((res) => iconCanvas.toBlob(res, 'image/png'));
        if (iconBlob) {
          zip.folder('icons')?.file('icon16.png', iconBlob);
          zip.folder('icons')?.file('icon48.png', iconBlob);
          zip.folder('icons')?.file('icon128.png', iconBlob);
        }
      }

      // Generate the zip bundle
      const zipContent = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipContent, 'MerchCraft_Free_Chrome_Extension_v3.8.zip');
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Failed to generate extension zip:', err);
    } finally {
      setIsBuildingZip(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20">
              <Chrome className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                MerchCraft Free Chrome Extension
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Ad-Supported (100% Free)
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Install as a browser extension for instant mockups anywhere on the web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] text-xs">
          {/* Ad Supported Value Proposition */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Zero Subscriptions • 100% Free Forever</span>
            </div>
            <p className="text-neutral-300 leading-relaxed text-xs">
              MerchCraft is supported entirely by curated print industry sponsors (wholesale blank distributors, global DTG fulfillment networks, and digitizers). In exchange, creators get unlimited 300 DPI exports, MediaPipe AR try-on, and mockups completely free.
            </p>
          </div>

          {/* Quick Download Package Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-neutral-100">
                  Download Chrome Extension Package (.ZIP)
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Includes Manifest V3, background service worker, popup view, and high-res icon assets.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
                Manifest V3
              </span>
            </div>

            <button
              onClick={handleDownloadExtensionZip}
              disabled={isBuildingZip}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-101 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isBuildingZip ? 'Packaging Extension ZIP...' : 'Download Unpacked Extension (.ZIP)'}</span>
            </button>

            {downloadSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Downloaded! Follow the 3 steps below to load it into Chrome.</span>
              </div>
            )}
          </div>

          {/* 3 Step Installation Instructions */}
          <div className="space-y-3">
            <div className="font-bold text-neutral-200 text-xs uppercase tracking-wider">
              How to Install in Google Chrome (Takes 30 Seconds)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div className="font-semibold text-neutral-200">Unzip Folder</div>
                <p className="text-[11px] text-neutral-400">
                  Extract the downloaded zip archive to any folder on your computer.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div className="font-semibold text-neutral-200">Open Extensions</div>
                <p className="text-[11px] text-neutral-400">
                  Type <code className="text-amber-300 font-mono bg-neutral-800 px-1 rounded">chrome://extensions</code> in Chrome and switch on <b>Developer mode</b>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div className="font-semibold text-neutral-200">Load Unpacked</div>
                <p className="text-[11px] text-neutral-400">
                  Click <b>"Load unpacked"</b> and choose the extracted folder. MerchCraft is live!
                </p>
              </div>
            </div>
          </div>

          {/* Web App URL Bookmark */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="truncate">
              <div className="text-[10px] text-neutral-400 uppercase font-mono">Live Extension Hub URL</div>
              <div className="text-xs text-neutral-200 font-mono truncate">{window.location.href}</div>
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Manifest V3 Compliant • Safe & Sandboxed</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
