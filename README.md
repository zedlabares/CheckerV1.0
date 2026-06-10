# POS File Checker

A **Progressive Web Application (PWA)** for validating POS `.001` remittance files against admin-computed expected values.

[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/pos-file-checker/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/pos-file-checker/actions/workflows/deploy.yml)

**Live demo:** `https://YOUR_USERNAME.github.io/pos-file-checker/`

---

## Key facts

- **100% client-side.** All parsing, validation, and calculation runs in the browser. Files never leave the device.
- **No backend required.** No Node.js runtime, no server, no database. Deployable as a pure static site.
- **PWA.** Installable to the home screen; works offline after first load.
- **GitHub Pages native.** Built specifically for free GitHub Pages hosting.

---

## Quick deploy (5 minutes)

### Step 1 — Fork or push to GitHub

```bash
# Clone / copy the project, then:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings → Pages**
3. Under **Source**, select **GitHub Actions**
4. Save

That's it. The workflow runs automatically on every push to `main`.

### Step 3 — Watch the deployment

Go to **Actions** tab → **Deploy to GitHub Pages** → watch the build. Once the green tick appears, your app is live at:

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

---

## Local development

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.0 |
| npm | ≥ 9.0 |

```bash
npm install       # Install dependencies
npm run dev       # Development server → http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

### Test GitHub Pages build locally

```bash
REPO_NAME=pos-file-checker npm run build:gh
npm run preview:gh
# → http://localhost:4173/pos-file-checker/
```

---

## How the GitHub Actions workflow works

File: `.github/workflows/deploy.yml`

```
push to main
     │
     ▼
[Build job]
  checkout → setup Node 20 → npm ci → tsc --noEmit → vite build
  VITE_BASE=/<repo-name>/          ← derived automatically from repo name
     │
     ▼ dist/ artifact uploaded
     │
[Deploy job]
  actions/deploy-pages → GitHub Pages
     │
     ▼
https://<user>.github.io/<repo>/
```

The workflow sets `VITE_BASE` to `/<repo-name>/` automatically using `github.event.repository.name`. You never need to hard-code your repo name.

**Permissions required** (already set in the workflow):
- `pages: write`
- `id-token: write`

---

## Custom domain

If you want `https://checker.yourdomain.com/` instead:

1. Add a `CNAME` file to `public/` containing your domain
2. Configure DNS per [GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
3. In `.github/workflows/deploy.yml`, change the env line to:
   ```yaml
   VITE_BASE: /
   ```

---

## Project structure

```
pos-file-checker/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions CI/CD
├── public/
│   ├── 404.html                ← SPA routing fallback for GitHub Pages
│   ├── favicon.ico
│   ├── apple-touch-icon.png    ← iOS home screen icon
│   ├── pwa-192x192.png         ← PWA icon
│   └── pwa-512x512.png         ← PWA icon (maskable)
├── src/
│   ├── components/             ← React UI components
│   │   ├── ErrorBanner.tsx
│   │   ├── ExportButtons.tsx
│   │   ├── FileUploader.tsx
│   │   ├── Header.tsx
│   │   ├── ValidationSummary.tsx
│   │   └── ValidationTable.tsx
│   ├── hooks/
│   │   ├── store.ts            ← Zustand state
│   │   └── useFileProcessor.ts ← Upload → parse → validate pipeline
│   ├── lib/
│   │   ├── calculator.ts       ← 11 admin-value formulas (VBA port)
│   │   ├── exportUtils.ts      ← PDF + Excel export
│   │   ├── lineItemDefinitions.ts ← Static metadata for 65 line items
│   │   ├── parser.ts           ← .001 file decoder
│   │   └── validator.ts        ← Orchestrator + formatters
│   ├── types/
│   │   └── posFile.ts          ← TypeScript interfaces
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts              ← Reads VITE_BASE env for GitHub Pages
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Business logic (client-side only)

### File format

Each `.001` line: `[2-char line#][12-char value][CRLF]`
- Currency lines: raw integer ÷ 100 = PHP amount
- Integer lines (32–34): plain integer, no division
- Text lines (1–3, 35): raw string

Encoding: UTF-8 → Windows-1252 → ISO-8859-1 fallback

### The 11 validated fields

All computation happens in `src/lib/calculator.ts`. No server involved.

| Line | Field | Formula |
|------|-------|---------|
| 5 | New Accumulated Sales (VAT) | `OldAcc/100 + (Gross−Ded)/1.12/100` |
| 6 | Total Gross Amount (VAT) | `Gross/100` *(structural identity)* |
| 7 | Total Deductions (VAT) | `Σ lines 7–22 / 100` |
| 24 | Total Non-Approved Discounts | `Σ lines 25–29 / 100` |
| 30 | Total VAT/Tax Amount | `(Gross−Ded) × 12/112 / 100` |
| 31 | Total Net Sales (VAT) | `(Gross−Ded) / 1.12 / 100` |
| 36 | Amount (Non-VAT section) | Same as line 31 |
| 38 | New Accumulated Sales (Non-VAT) | `OldAccNV/100 + (GrossNV−DedNV)/100` |
| 40 | Total Deductions (Non-VAT) | `Σ lines 41–56 / 100` |
| 64 | Total Net Sales (Non-VAT) | `(GrossNV−DedNV) / 100` |
| 65 | Grand Total Net Sales | `NetVAT + NetNonVAT` |

Pass/Fail: both values rounded to 2 dp before comparison.

### Known anomaly — Line item 57

Replicated faithfully from the original VBA: the Non-VAT NASD total is written without ÷100. The field is not validated. The UI shows a ⚠️ warning tooltip.

---

## Offline / PWA behaviour

After the first visit, the Workbox service worker precaches all assets. The app works fully offline — including file upload, parsing, validation, and PDF/Excel export.

Install prompt appears automatically in Chrome/Edge. On iOS, use Safari → Share → Add to Home Screen.

---

## Customising branding

Edit `src/components/Header.tsx` — swap the `<ShieldCheck />` icon for your logo and update the wordmark. Colors are in `tailwind.config.js` under `navy`, `pass`, and `fail`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page after deploy | Check **Settings → Pages → Source** is set to **GitHub Actions**, not a branch |
| 404 on hard refresh | Ensure `public/404.html` is present in the repo |
| Wrong base path | The workflow sets `VITE_BASE` automatically from `github.event.repository.name` |
| Build fails on `tsc` | Run `npm run type-check` locally and fix any TypeScript errors |
| PWA not installing | Must be served over HTTPS (GitHub Pages always uses HTTPS) |
| Fonts not loading offline | The app uses Google Fonts; they won't load offline. To make fonts fully offline, download them and put them in `public/fonts/` |

---

## Licence

Placeholder — add your organisation's licence here.
