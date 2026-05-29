# CAT Quant Prep App
Interactive CAT Quantitative Aptitude practice app based on **Arun Sharma's** book.

**1945 questions · 11 chapters · LOD 1/2/3 · Analytics · CAT Sim Mode**

---

## Features
| Feature | Details |
|---|---|
| 📖 Chapter Notes | Key concepts + formulas per chapter |
| 🧪 Quiz Engine | LOD 1/2/3, per-question timer, MCQ + TITA |
| ✅ Answer Flow | Select → Check Answer → Reveal Explanation |
| 🔥 Accuracy Heatmap | Topic accuracy bar chart |
| ⏱️ Time Tracker | Avg time/Q vs CAT benchmark |
| 📋 Mistake Log | Every wrong attempt, filterable + re-attemptable |
| 📈 Progress | Daily streak, accuracy trend, LOD breakdown |
| ⚡ CAT Sim | 34Q in 40min, mixed topics, CAT scoring |
| 🔖 Bookmarks | Save questions to revisit |

---

## Deploy to Vercel (Recommended — 2 minutes)

### Option A: Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repo
3. Vercel auto-detects Next.js → click **Deploy**
4. Live at `your-project.vercel.app`

### Option B: GitHub Actions (auto-deploy on push)
1. Run `npm i -g vercel && vercel login && vercel link`
2. Add these GitHub repo secrets (Settings → Secrets → Actions):
   - `VERCEL_TOKEN` — vercel.com/account/tokens
   - `VERCEL_ORG_ID` — from `.vercel/project.json`
   - `VERCEL_PROJECT_ID` — from `.vercel/project.json`
3. Push to `main` → auto-deploys

---

## Local Dev
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Tech Stack
Next.js 15 · TypeScript · Tailwind CSS · Recharts · localStorage · Vercel
