export interface AdBanner {
  id: string;
  sponsorName: string;
  tagline: string;
  ctaText: string;
  badgeText: string;
  category: 'dtg-blanks' | 'embroidery' | 'shipping' | 'screenprint' | 'design-assets';
  ctaUrl: string;
  accentColor: string;
  metrics: string;
}

export const SPONSORED_ADS: AdBanner[] = [
  {
    id: 'print-blanks-co',
    sponsorName: 'Bella+Canvas & Los Angeles Apparel Blanks',
    tagline: 'Wholesale 280 GSM blanks with 1-day drop dispatch & zero setup fees for creators.',
    ctaText: 'Claim 20% Off Sample Blanks',
    badgeText: 'Official Blanks Partner',
    category: 'dtg-blanks',
    ctaUrl: 'https://example.com/blanks-discount',
    accentColor: '#F59E0B',
    metrics: 'Over 1.2M blanks shipped to indie brands',
  },
  {
    id: 'dtg-fulfillment-network',
    sponsorName: 'Gelato Global Print Network',
    tagline: 'Auto-fulfill apparel, drinkware & posters in 32 countries with 3-day local delivery.',
    ctaText: 'Connect Shopify / Etsy Free',
    badgeText: 'Fulfillment Sponsor',
    category: 'shipping',
    ctaUrl: 'https://example.com/gelato-fulfillment',
    accentColor: '#10B981',
    metrics: '99.4% on-time delivery across 100+ print hubs',
  },
  {
    id: 'embroidery-digitizing-pro',
    sponsorName: 'StitchCraft Auto-DST Digitizer',
    tagline: 'Convert vector logos into production-ready .DST & .PES embroidery stitch files in 30 seconds.',
    ctaText: 'Try 3 Free Conversions',
    badgeText: 'Embroidery Partner',
    category: 'embroidery',
    ctaUrl: 'https://example.com/stitch-digitize',
    accentColor: '#8B5CF6',
    metrics: 'Rated 4.9/5 by 8,000+ embroidery shops',
  },
  {
    id: 'vector-vintage-textures',
    sponsorName: 'RetroSupply Co. Halftone & Distress Kit',
    tagline: 'Authentic cracked screenprint textures, halftones, and vintage wash shaders for Adobe & Canva.',
    ctaText: 'Download Free Texture Pack',
    badgeText: 'Art Assets Sponsor',
    category: 'design-assets',
    ctaUrl: 'https://example.com/vintage-screenprint-kit',
    accentColor: '#EC4899',
    metrics: 'Used by Nike, Disney & top streetwear labels',
  },
];
