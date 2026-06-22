# AI Ad Generator

A multi-platform AI ad copy generator built with React, Tailwind CSS, and an Express backend powered by OpenRouter.

---

## Prerequisites

- Node.js 18 or higher
- An [OpenRouter](https://openrouter.ai) API key

---

## Setup

**1. Install dependencies**

```bash
cd ai-ad-generator
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```
OPENROUTER_API_KEY=your_key_here
```

All other settings (model, prompts, temperature) have defaults and are optional.

---

## Running the app

### Development mode (hot reload)

You need two terminals running at the same time.

**Terminal 1 — API server:**

```bash
npm run dev:server
```

**Terminal 2 — Vite frontend:**

```bash
npm run dev
```

Then open **http://127.0.0.1:5173** in your browser.

> If `dev:server` fails with `EADDRINUSE`, something is already on port 3000.
> Kill it with: `lsof -ti:3000 | xargs kill -9`

---

### Production mode (single server)

```bash
npm run build
npm start
```

Then open **http://localhost:3000** in your browser.

The Express server serves both the built frontend and the `/api` routes from a single process.

---

## Deploying to Railway

The app ships with a `Dockerfile` and `railway.json`, so the build runs on Linux
inside Docker — it deploys the same way regardless of whether you develop on
Windows, macOS, or Linux. The Windows-specific contents of a local
`node_modules/` are never used; Railway installs fresh from `package-lock.json`.

### Option A — from the Railway dashboard (no CLI)

1. Push this repo to GitHub.
2. On [railway.com](https://railway.com): **New Project → Deploy from GitHub repo**, pick the repo.
3. Open the service → **Settings → Root Directory** and set it to **`ai-ad-generator`**
   (the app lives in a subfolder, not the repo root). Railway will then pick up
   `railway.json` + `Dockerfile`.
4. **Variables** tab → add `OPENROUTER_API_KEY = sk-or-...` (the only required one).
5. Deploy. Under **Settings → Networking**, click **Generate Domain** to get a public URL.

### Option B — Railway CLI

```bash
npm i -g @railway/cli
railway login
cd ai-ad-generator
railway init                       # create/link a project
railway variables set OPENROUTER_API_KEY=sk-or-...
railway up                         # build & deploy from this folder
```

Railway automatically injects a `PORT` env var; the server already binds
`0.0.0.0:$PORT`, and `/api/health` is configured as the health check. Prompts
and model have sensible built-in defaults, so **only `OPENROUTER_API_KEY` is
required**. Override `OPENROUTER_MODEL`, `PROMPT_*`, `LLM_TEMPERATURE`, etc. by
adding more Railway variables if desired.

> Build/verify the image locally before deploying:
> ```bash
> docker build -t ai-ad-generator .
> docker run --rm -p 8080:3000 -e OPENROUTER_API_KEY=sk-or-... ai-ad-generator
> ```

---

## Project structure

```
ai-ad-generator/
├── server/
│   └── index.js          # Express API server
├── src/
│   ├── main.jsx          # React app entry point
│   └── styles.css        # Tailwind CSS entry
├── public/               # Static assets
├── .env.example          # Environment variable template
├── vite.config.js        # Vite config (React plugin + API proxy)
├── tailwind.config.js    # Tailwind theme (mint colors, animations)
└── package.json
```

---

## Notes

- The server requires `OPENROUTER_API_KEY`. Without it, all generation requests return an error.
- Prompts for each platform (Instagram, Facebook, TikTok) are configurable via `.env` — see `.env.example` for the full list.
- Two generation modes are available: **Express** (single call, all platforms) and **Agency** (parallel calls, one per platform).
