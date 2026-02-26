# GajiBN — Know Your Worth 🇧🇳

Brunei's salary and career intelligence platform. Real salary data from official government statistics (DEPS Labour Force Survey, MPEC Salary Guidelines) combined with anonymous community contributions.

## Features

- **Explore Salaries** — Browse by industry, occupation, and MPEC guidelines
- **Am I Paid Fairly?** — Compare your salary against Brunei averages
- **Gov vs Private** — See the real total compensation gap (149%, not just base salary)
- **Anonymous Submissions** — Share your salary to help others
- **Community Data** — Aggregated view of crowd-sourced salary information

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

### Option A: Via GitHub (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" → select this repo
4. Vercel auto-detects Vite — just click "Deploy"
5. Done! You get a URL like `gajibn.vercel.app`

### Option B: Via CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Takes 30 seconds.

## Custom Domain

1. Buy `gajibn.com` on [Namecheap](https://namecheap.com) or [Cloudflare](https://cloudflare.com) (~$10/year)
2. In Vercel dashboard → Settings → Domains → Add `gajibn.com`
3. Update your DNS records as Vercel instructs
4. SSL is automatic

## Data Sources

- [DEPS Labour Force Survey 2024](http://www.deps.gov.bn)
- [MPEC Salary Guideline 2023](https://mpec.gov.bn)
- [ILOSTAT Brunei](https://ilostat.ilo.org)
- Anonymous community contributions

## Tech Stack

- React 18 + Vite
- Recharts for data visualization
- No backend yet — submissions stored in React state (next: Supabase or Firebase)

## Roadmap

- [ ] Supabase backend for persistent anonymous submissions
- [ ] Cost of living module (HargaBN integration)
- [ ] Graduate outcomes tracker
- [ ] Employer profiles and job listings
- [ ] Mobile-optimized PWA

## License

MIT
