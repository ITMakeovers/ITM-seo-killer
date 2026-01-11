# SeoKiller

AI-powered SEO content generation platform with automatic topic creation, article writing, and intelligent internal linking. Built with Next.js 16, TypeScript, Gemini AI, and Tailwind CSS.

## Features

- **AI Content Generation** - Generate high-quality articles using Google Gemini AI
- **Smart Topic System** - Automatically generate relevant topics from seed keywords
- **Intelligent Internal Linking** - Automatic linking between related articles with contextual anchors
- **Multiple Layout Options** - Portal, Magazine, and Blog homepage styles
- **Flexible Article Layouts** - Standard, Wide, and Minimal reading experiences
- **Image Integration** - Automatic image fetching from Unsplash with AI-powered descriptions
- **SEO Optimized** - Auto-generated meta tags, sitemaps, and robots.txt
- **Tag System** - Automatic tagging and tag-based article filtering
- **Admin Panel** - Intuitive dashboard for content management
- **ISR & Edge Caching** - Lightning-fast page loads with Incremental Static Regeneration
- **Fully Responsive** - Beautiful design across all devices
- **Dark Theme** - Modern Elegant Midnight Emerald color scheme

## Development

Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```

Install and run:
```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
pnpm build
pnpm start
```

## Configuration

Edit `site.config.json` to customize your portal:

```json
{
  "siteName": "Your Site Name",
  "niche": "Your Niche",
  "seedKeywords": ["keyword1", "keyword2"],
  "layout": {
    "homepage": "magazine",
    "article": "standard",
    "list": "grid"
  },
  "admin": {
    "enabled": true,
    "pinHash": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    "apiKey": "CHANGE-ME-BEFORE-DEPLOYMENT"
  }
}
```

### Security Configuration

The admin panel is protected by PIN authentication and API key protection:

- **PIN Protection**: The admin interface requires a PIN to access. The default PIN is `1234` (hash: `03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4`)
- **API Key Protection**: External API requests require an API key in the `x-api-key` header. The default is `CHANGE-ME-BEFORE-DEPLOYMENT`

To change the PIN:
1. Generate a SHA-256 hash of your desired PIN:
   ```bash
   echo -n "your-pin" | shasum -a 256
   ```
2. Update the `admin.pinHash` in `site.config.json`

To set an API key:
1. Generate a secure random key or use your own
2. Update the `admin.apiKey` in `site.config.json`
3. Include the key in the `x-api-key` header when making external API requests

**Note**: For production, always use strong PINs and API keys, and never commit them to version control. Consider using environment variables instead.

## Workflow

### 1. Generate Content
- Enable admin panel in `site.config.json`
- Configure PIN and API key for security
- Visit `/admin` and log in with your PIN (default: `1234`)
- Generate topics from seed keywords
- Generate articles from topics
- Create internal links between articles

### 2. Deploy
- Change the default PIN to a secure one
- Update the API key to a strong random value
- Consider moving sensitive config to environment variables
- Optionally disable admin panel for production (or keep it secured)
- Push to GitHub
- Deploy to Vercel

### 3. Result
- SEO-optimized portal with AI-generated content
- Secured admin interface with PIN protection
- API protected against unauthorized external access
- Automatic sitemaps and meta tags
- Fast loading with edge caching

## Available Layouts

### Homepage
- **Portal** - Classic news portal with hero section
- **Magazine** - Featured articles with grid layout
- **Blog** - Minimalist single-column design

### Article Page
- **Standard** - Classic layout with sidebar
- **Wide** - Full-width modern layout
- **Minimal** - Distraction-free reading

### List/Tag Pages
- **Grid** - Card-based responsive grid
- **List** - Horizontal cards layout
- **Masonry** - Pinterest-style layout

## Tech Stack

- **Next.js 16** (App Router, ISR, Edge Runtime)
- **TypeScript**
- **Tailwind CSS 4**
- **Google Gemini AI** (Content generation)
- **Unsplash API** (Image sourcing)
- **React 19**

---

**Built by [ITMakeovers](https://github.com/waszuch) & Marcin Waszewski**



