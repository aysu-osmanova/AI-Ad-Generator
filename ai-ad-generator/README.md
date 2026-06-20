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
