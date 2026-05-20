# Dev's Portfolio Website

A clean, minimal professional website with animated geodesic globe, hover interactions, and a serverless contact form — ready to deploy on Vercel.

---

## Project Structure

```
Personal_Website
├── index.html          # Main page
├── style.css           # All styles
├── globe.js            # Animated rotating wireframe globe (Canvas 2D)
├── interactions.js     # Hover effects + contact form submission
├── api/
│   └── contact.js      # Vercel serverless function (contact form backend)
├── vercel.json         # Vercel deployment config
├── package.json
└── README.md
```

---

## Deploy to Vercel

### Option 1 — Via GitHub (recommended)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Click **Deploy** — no build config needed

### Option 2 — Vercel CLI

```bash
npm install -g vercel
cd awright-associates
vercel
```

---

## Local Development

```bash
npm install -g vercel
vercel dev
```

Then open `http://localhost:3000`

---

## Contact Form (Optional Email)

The contact form POSTs to `/api/contact`. By default it logs submissions to the console.

To send real emails via [Resend](https://resend.com):

1. Sign up at resend.com and get an API key
2. Add `RESEND_API_KEY` to your Vercel environment variables
3. Uncomment the Resend block in `api/contact.js`

---

## Customization

- **Content**: Edit `index.html` — all copy is inline
- **Colors**: Edit CSS variables at the top of `style.css`
- **Globe speed**: Change `angleY += 0.0025` in `globe.js`
- **Globe detail**: Change `createIcosphere(2)` subdivision level (1–4)
