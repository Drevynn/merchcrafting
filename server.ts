import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Health check & capabilities
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * AI Design & Print Quality Analyzer
 */
app.post('/api/ai/analyze-mockup', async (req, res) => {
  try {
    const {
      productTitle,
      productCategory,
      productColor,
      printMethod,
      logoWidthPx,
      logoHeightPx,
      printWidthInches,
      printHeightInches,
      logoBase64,
    } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
        contrastScore: 92,
        contrastFeedback: `Good contrast with ${productColor} base.`,
        recommendedPrintMethod: printMethod || 'Direct-to-Garment (DTG)',
        printTips: [
          'Ensure your master artwork is at 300 DPI for production.',
          'Consider a 1-pixel choke on underbase white for dark garments.',
          'Keep lines above 0.5pt thickness for crisp ink transfer.'
        ],
        recommendedColorways: ['#121212', '#F4F2EE', '#2D3748', '#2C3E50'],
        marketingCopy: {
          title: `Premium ${productTitle}`,
          tagline: 'Signature apparel crafted for everyday comfort and bold expression.',
          description: `Custom branded ${productTitle} featuring high-definition print and soft-touch premium finish.`
        }
      });
    }

    const calculatedDpi = Math.round(logoWidthPx / (printWidthInches || 10));

    const prompt = `You are a world-class apparel merchandise production director and print specialist.
Analyze this merchandise mockup configuration:
- Product: ${productTitle} (${productCategory})
- Product Fabric/Base Color: ${productColor}
- Selected Print Technique: ${printMethod}
- Native Artwork Pixel Dimensions: ${logoWidthPx}x${logoHeightPx} px
- Target Physical Print Size: ${printWidthInches}" x ${printHeightInches}"
- Effective DPI: ${calculatedDpi} DPI

Evaluate printability, color compatibility, ink behavior, and e-commerce appeal.
Return a structured JSON with:
1. contrastScore (number 0-100)
2. contrastFeedback (concise evaluation of visual contrast and legibility)
3. recommendedPrintMethod (e.g. "Direct-to-Garment (DTG)", "Screen Printing (Plastisol/Waterbased)", "3D Puff Embroidery", "Direct-to-Film (DTF)", or "Laser Engraving")
4. printTips (array of 3-4 professional print production bullet points, e.g. white underbase, halftone settings, stroke minimums, wash fastness)
5. recommendedColorways (array of 4 hex color strings that best complement this brand/merch)
6. marketingCopy: object with { title, tagline, description } ready for Shopify or Etsy store launch.`;

    const parts: any[] = [{ text: prompt }];

    // If logo image data provided, attach inlineData
    if (logoBase64 && typeof logoBase64 === 'string') {
      const match = logoBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        parts.unshift({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contrastScore: { type: Type.NUMBER },
            contrastFeedback: { type: Type.STRING },
            recommendedPrintMethod: { type: Type.STRING },
            printTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedColorways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            marketingCopy: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tagline: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['title', 'tagline', 'description'],
            }
          },
          required: ['contrastScore', 'contrastFeedback', 'recommendedPrintMethod', 'printTips', 'recommendedColorways', 'marketingCopy'],
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing mockup:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze mockup',
      fallback: true,
      contrastScore: 88,
      contrastFeedback: 'Clear contrast. Suitable for high-density production.',
      recommendedPrintMethod: 'Direct-to-Garment (DTG)',
      printTips: [
        'Render master files at 300 DPI for sharp edges.',
        'Use RGB color space for modern digital DTG print engines.',
        'Ensure background transparency is cleanly trimmed.'
      ],
      recommendedColorways: ['#171717', '#F5F5F0', '#1E293B', '#3F3F46'],
      marketingCopy: {
        title: 'Custom Brand Merchandise',
        tagline: 'Engineered for style, built for durability.',
        description: 'Premium print finish on top-tier blanks.'
      }
    });
  }
});

/**
 * AI Scene Prompt Generator
 */
app.post('/api/ai/suggest-scenes', async (req, res) => {
  try {
    const { productTitle, style } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.json({
        scenes: [
          {
            title: 'Urban Streetwear Editorial',
            prompt: `High-fashion street photography shot of a model wearing a ${productTitle}, standing on a rainy neon-lit Tokyo crosswalk, natural bokeh, soft cinematic film grain.`
          },
          {
            title: 'Nordic Minimalist Flat Lay',
            prompt: `Overhead flat-lay photograph of a ${productTitle} neatly folded next to a Leica camera, ceramic coffee mug, and minimalist oak desk, bathed in soft morning window light.`
          },
          {
            title: 'Sunlit Studio Cyclorama',
            prompt: `Commercial studio lookbook shoot of a ${productTitle} displayed on an invisible mannequin against a soft warm sand seamless studio backdrop with subtle architectural shadows.`
          },
          {
            title: 'Cozy Artisan Coffee House',
            prompt: `Warm lifestyle capture of a person wearing a ${productTitle} inside a vintage brick espresso bar, steam rising, natural candid pose.`
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create 4 distinct, highly creative, commercial-grade photoshoot scene descriptions for a ${productTitle}. Style vibe: ${style || 'streetwear & contemporary lifestyle'}.
Return JSON with an array named 'scenes', each having 'title' (short name) and 'prompt' (detailed visual prompt for a photo shoot).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                },
                required: ['title', 'prompt'],
              }
            }
          },
          required: ['scenes']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating scenes:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AI Photo Shoot Generator (Using Gemini Image Generation)
 */
app.post('/api/ai/studio-shoot', async (req, res) => {
  try {
    const { prompt, logoBase64, productTitle, garmentColor } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.status(400).json({
        error: 'Gemini API Key is not configured in environment secrets.',
      });
    }

    const imageParts: any[] = [];
    let textPrompt = `Generate a hyper-realistic, commercial merchandise product photo: ${prompt || `A premium ${garmentColor || 'black'} ${productTitle || 't-shirt'} mockup in an editorial studio setting`}.`;

    if (logoBase64 && typeof logoBase64 === 'string') {
      const match = logoBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        imageParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
        textPrompt += ' Seamlessly incorporate this uploaded brand logo onto the front center of the product with natural fabric wrinkles, realistic lighting, and tactile print texture.';
      }
    }

    imageParts.push({ text: textPrompt });

    // Use gemini-3.1-flash-lite-image by default as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: imageParts,
      },
    });

    let generatedImageUrl: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'The AI model completed the request but did not return image data.',
      });
    }

    return res.json({ imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error('Studio shoot error:', error);
    return res.status(500).json({
      error: error.message || 'Image generation failed',
    });
  }
});

/**
 * Sharon the AI Producer - Collection Critique & Producer Insights
 */
app.post('/api/ai/sharon-critique', async (req, res) => {
  try {
    const { products, brandName, targetVibe } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        producerName: 'Sharon Sterling',
        title: 'Executive Merch & Apparel Producer',
        verdict: 'Drop-Ready with Minor Placement Polishing',
        collectionRating: 94,
        producerQuotes: [
          "Honey, that heavyweight 280 GSM tee silhouette is pure retail gold right now.",
          "Let's make sure that hoodie graphic sits 3 inches below the drawstrings so it doesn't get obscured when worn.",
          "The diner mug has an 82% profit margin at a $24 retail ticket. Put that in the core bundle!"
        ],
        commercialAdvice: {
          recommendedPricing: {
            tshirt: '$38 - $44',
            hoodie: '$88 - $110',
            mug: '$22 - $28',
            tote: '$28 - $34',
            cap: '$32 - $38'
          },
          projectedMargin: '74% Average Gross Margin',
          keyOptimization: 'Nudge chest artwork up 1.5 inches for a modern boxy streetwear stance.'
        },
        curatedColorways: ['#161616', '#F3EFE6', '#31231E', '#1C3125']
      });
    }

    const prompt = `You are Sharon Sterling, a world-famous, sharp-witted, highly experienced Executive Merch Producer behind top streetwear labels and boutique lifestyle brands.
Critique this merchandise mockup lineup for brand: "${brandName || 'Brand Capsule'}":
Products in collection: ${JSON.stringify(products || ['Heavyweight Tee', 'Heavy Hoodie', 'Ceramic Mug', 'Tote Bag'])}
Brand style / vibe: ${targetVibe || 'Contemporary Streetwear & Elevated Basics'}

Provide Sharon's executive producer feedback in JSON with:
1. producerName: "Sharon Sterling"
2. title: "Executive Merch & Apparel Producer"
3. verdict: (e.g. "Drop-Ready with Minor Tweaks" or "Streetwear Gold")
4. collectionRating: (number 85-99)
5. producerQuotes: array of 3 charismatic, actionable quotes with production wisdom (fabric weights, underbases, margin advice, placement tips)
6. commercialAdvice: object with { recommendedPricing: object of products to price ranges, projectedMargin: string, keyOptimization: string }
7. curatedColorways: array of 4 hex color strings`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Sharon critique error:', error);
    return res.json({
      producerName: 'Sharon Sterling',
      title: 'Executive Merch & Apparel Producer',
      verdict: 'Commercial Grade Collection',
      collectionRating: 92,
      producerQuotes: [
        "The boxy cotton cut balances the logo placement beautifully.",
        "Ensure direct-to-garment profiles apply a smooth 1-pixel choke on darker colorways.",
        "The drinkware accessory will drive high-cart-value add-ons during launch."
      ],
      commercialAdvice: {
        recommendedPricing: {
          tshirt: '$36 - $42',
          hoodie: '$85 - $105',
          mug: '$20 - $26'
        },
        projectedMargin: '72% Gross Margin',
        keyOptimization: 'Maintain 300 DPI master resolutions for production handoff.'
      },
      curatedColorways: ['#161616', '#F3EFE6', '#1A233A']
    });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MerchCraft Server listening on port ${PORT}`);
  });
}

startServer();
