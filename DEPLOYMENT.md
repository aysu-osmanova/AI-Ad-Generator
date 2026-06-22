# 🚀 Deployment Guide — AI Ad Generator (Railway)

How to deploy the **AI Ad Generator** to [Railway](https://railway.com).

This is a standalone guide. The implementation spec lives in `instructions.md`;
this file only covers shipping the finished app to production.

---

## How it's set up

The actual app lives in the **`ai-ad-generator/`** subfolder and ships with a
`Dockerfile` and `railway.json`, so Railway builds it on Linux inside Docker.

- `node_modules/`, `dist/`, and `.env` are **gitignored** and never committed.
- Railway installs fresh from `package-lock.json`, which pins binaries for every
  platform — so it deploys identically whether you develop on **Windows**,
  **macOS**, or **Linux**. A `node_modules/` copied from one OS is never used.
- The server reads the `PORT` Railway injects and binds `0.0.0.0:$PORT`.
- `/api/health` is wired up as the Railway health check.
- The model and all prompts have built-in defaults, so the **only required
  variable is `OPENROUTER_API_KEY`**.

---

## Prerequisites

- A [Railway](https://railway.com) account.
- An **OpenRouter API key** → https://openrouter.ai/keys
- The project pushed to a **GitHub repository** (for the dashboard flow).

---

## Option A — Railway Dashboard (recommended)

1. Push this repository to GitHub.
2. On [railway.com](https://railway.com): **New Project → Deploy from GitHub repo**,
   then connect your account and select the repository.
3. ⚠️ **Set the service Root Directory.** Open the service →
   **Settings → Root Directory** and set it to **`ai-ad-generator`**.
   The app is in a subfolder; without this Railway can't find the
   `Dockerfile` / `railway.json` and the build fails.
4. Open the **Variables** tab and add the API key:
   ```
   OPENROUTER_API_KEY=sk-or-...
   ```
   (Optional overrides: `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`,
   `PROMPT_EXPRESS`, `PROMPT_IG`, `PROMPT_FB`, `PROMPT_TT`,
   `LLM_TEMPERATURE`, `LLM_MAX_TOKENS`.)
5. Railway builds and deploys automatically. **Do not set `PORT`** — Railway
   provides it.
6. Under **Settings → Networking**, click **Generate Domain** for a public URL.

---

## Option B — Railway CLI

```bash
npm i -g @railway/cli
railway login

cd ai-ad-generator
railway init                                  # create / link a project
railway variables set OPENROUTER_API_KEY=sk-or-...
railway up                                    # build & deploy from this folder
railway domain                                # generate a public URL
```

---

## Verify the deployment

- Open the **live URL** Railway generated.
- Health check: `https://<your-domain>/api/health` should return
  ```json
  { "status": "ok" }
  ```
- Run a test generation in both **Express** and **Agency** mode to confirm the
  production server reaches the LLM API.

---

## Test the production build locally (optional)

The same Docker image Railway builds can be run on your machine:

```bash
cd ai-ad-generator
docker build -t ai-ad-generator .
docker run --rm -p 8080:3000 -e OPENROUTER_API_KEY=sk-or-... ai-ad-generator
# open http://localhost:8080
```

---

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Build fails: "no Dockerfile found" | Root Directory not set to `ai-ad-generator` (Step 3). |
| App boots but every generation errors | `OPENROUTER_API_KEY` missing or invalid in **Variables**. |
| 502 / "AI provider error" | Bad/expired key, no OpenRouter credit, or chosen `OPENROUTER_MODEL` unavailable. Check deploy logs. |
| Health check failing | App not binding `$PORT`. Don't override `PORT` — let Railway set it. |
