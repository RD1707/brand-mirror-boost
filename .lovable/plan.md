

# Boticário-Style Static Landing Page

## Overview
Build a static marketing landing page in React replicating the layout and structure of boticario.com.br, using their actual content, images, and branding. No Shopify or e-commerce functionality — purely a visual landing page.

## Sections to Build (based on site analysis)

1. **Top Bar** — Promotional banner (e.g., "Frete grátis acima de R$149")
2. **Header/Navbar** — Logo, search bar, account/cart icons, category navigation
3. **Hero Carousel** — Full-width promotional banners with auto-play
4. **Category Cards** — Horizontal scrollable category tiles (Perfumaria, Maquiagem, Cabelos, etc.)
5. **Product Showcase Grid** — Featured products with image, name, price, and discount badges
6. **Promotional Banners** — Mid-page full-width offer banners
7. **Brand Highlights** — Sections for specific lines (e.g., Nativa SPA, Lily, Egeo)
8. **Benefits Bar** — Icons for free shipping, secure payment, easy returns
9. **Newsletter Signup** — Email capture section
10. **Footer** — Links, social media, legal info, payment icons

## Technical Approach

- **Component structure**: One component per section, all composed in `Index.tsx`
- **Images**: Reference actual Boticário CDN URLs for product/banner images
- **Styling**: Tailwind CSS with Boticário's color palette (green #006B3F, pink accents, white backgrounds)
- **Carousel**: Use existing Embla-based carousel component
- **Responsive**: Mobile-first, matching their breakpoints
- **Data**: Static arrays for products/categories defined in a `data/` folder

## File Structure
```
src/
  data/
    products.ts        — Product listings with images, prices
    categories.ts      — Category data
    banners.ts         — Banner/hero slide data
  components/
    TopBar.tsx
    Header.tsx
    HeroCarousel.tsx
    CategoryCards.tsx
    ProductGrid.tsx
    PromoBanner.tsx
    BrandHighlights.tsx
    BenefitsBar.tsx
    Newsletter.tsx
    Footer.tsx
  pages/
    Index.tsx           — Composes all sections
  index.css             — Updated with Boticário brand colors
```

## Brand Colors (CSS variables)
- Primary green: `#006B3F`
- Accent pink: `#E91E63`
- Background: `#FFFFFF`
- Text: `#333333`
- Light gray: `#F5F5F5`

