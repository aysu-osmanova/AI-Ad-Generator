const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

// Load .env from project root (ai-ad-generator/.env)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');
const clientDir = fs.existsSync(path.join(distDir, 'index.html')) ? distDir : publicDir;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || null;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || null;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

// Built-in prompt defaults so the app works out-of-the-box on a fresh deploy
// (e.g. Fly.io) when only OPENROUTER_API_KEY is configured. Any of these can
// still be overridden via the matching environment variable / .env entry.
const DEFAULT_PROMPTS = {
  express: 'You are an expert Multi-Platform AI Copywriter. Your task is to generate ad copy for three different platforms based on the User\'s Business Name and Product/Service.\n\nYou must adapt your tone for each platform:\n- Instagram: Visual, engaging, lifestyle-oriented.\n- Facebook: Informative, problem-solving, value-driven.\n- TikTok: High-energy, conversational, trend-conscious.\n\nYou MUST respond ONLY with a valid JSON object using the exact structure below. Do not include markdown formatting like ```json or any other text outside the JSON.\n\n{\n  "instagram": {\n    "caption": "[Engaging caption with emojis]",\n    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]\n  },\n  "facebook": {\n    "ad_copy": "[Persuasive copy explaining the problem and solution]",\n    "cta": "[Strong, capitalized Call to Action]"\n  },\n  "tiktok": {\n    "hook": "[A 1-sentence attention-grabbing conversational hook]"\n  }\n}\n\nBusiness Name: {business_name}\nProduct/Service: {product_service}\nGenerate the ads.',
  ig: 'You are a Luxury Brand Instagram Copywriter. Write an engaging ad caption using the AIDA (Attention, Interest, Desire, Action) framework based on the user\'s business and product.\n\nConstraints:\n1. Start with a compelling one-liner statement.\n2. Use emojis strategically as clean bullet points to list 3 key benefits.\n3. End with a soft, inviting call to action.\n4. Provide exactly 5 hashtags: 2 broad industry tags, 2 specific product tags, and 1 community/lifestyle tag.\n\nFormat your response strictly as a JSON object:\n{\n  "caption": "[Your generated AIDA caption]",\n  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]\n}',
  fb: 'You are a Senior Direct-Response Facebook Marketer. Write a highly persuasive 3-paragraph ad copy using the PAS (Problem, Agitate, Solve) framework based on the user\'s business.\n\nConstraints:\n1. Paragraph 1 (Problem): Identify a core, frustrating problem the target audience faces.\n2. Paragraph 2 (Agitate): Amplify that pain point emotionally.\n3. Paragraph 3 (Solve): Introduce the business/product as the ultimate relief.\n4. Provide a standalone, capitalized, high-conversion Call to Action (CTA) starting with an emoji.\n\nFormat your response strictly as a JSON object:\n{\n  "ad_copy": "[Your 3-paragraph PAS copy]",\n  "cta": "[YOUR CAPITALIZED CTA HERE]"\n}',
  tt: 'You are a Gen-Z TikTok Viral Content Creator. Your task is to write exactly ONE short, punchy, disruptive video hook sentence based on the user\'s business.\n\nConstraints:\n1. Zero corporate fluff or formal marketing language.\n2. It must sound like organic User-Generated Content (UGC).\n3. Use a psychological angle: Curiosity ("The secret..."), Negative Bias ("Stop doing..."), or Relatability ("I was today years old...").\n\nFormat your response strictly as a JSON object:\n{\n  "hook": "[Your single-sentence TikTok hook]"\n}'
};
const STRICT_OUTPUT_RULES = `
Critical output contract:
- Return only one valid JSON object. No markdown, commentary, or code fences.
- Keep every field separate. Do not duplicate content across fields.
- Instagram caption must not contain hashtags and must not contain any "#" characters.
- Instagram hashtags must be exactly 5 strings, each starting with "#".
- Facebook ad_copy must not include the CTA. Put the CTA only in the cta field.
- TikTok hook must be exactly one sentence and must not contain hashtags.
`;

function sanitizeInput(s) {
  return (s || '').toString().trim();
}

function generateHashtags(business, product) {
  const sanitize = (s) => s.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const b = sanitize(business).split(/\s+/).filter(Boolean);
  const p = sanitize(product).split(/\s+/).filter(Boolean);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const base1 = b[0] ? `#${b[0]}` : '#brand';
  const base2 = p[0] ? `#${p[0]}` : '#product';
  const possible = ['#premium', '#handmade', '#local', '#smallbatch', '#limited', '#new', '#musttry', '#shoplocal'];
  const tagSet = new Set([base1.toLowerCase(), base2.toLowerCase()]);
  while (tagSet.size < 5) tagSet.add(pick(possible));
  return Array.from(tagSet).slice(0, 5);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callOpenRouter(messages, opts = {}) {
  if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API key not configured');

  const model = opts.model || OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const url = `${OPENROUTER_BASE_URL.replace(/\/$/, '')}/chat/completions`;
  const body = {
    model,
    messages,
    temperature: opts.temperature ?? Number(process.env.LLM_TEMPERATURE || 0.7),
    max_tokens: opts.max_tokens ?? Number(process.env.LLM_MAX_TOKENS || 800)
  };
  if ((process.env.LLM_RESPONSE_FORMAT || 'json_object').toLowerCase() !== 'off') {
    body.response_format = { type: 'json_object' };
  }

  const timeoutMs = opts.timeoutMs ?? 15000;
  const maxAttempts = opts.retries ?? 3;

  // Attempt to find a fetch implementation (global fetch or node-fetch)
  let fetchImpl = globalThis.fetch;
  if (!fetchImpl) {
    try {
      const nf = await import('node-fetch');
      fetchImpl = nf.default || nf;
    } catch (err) {
      throw new Error('Global fetch is not available in this Node runtime and node-fetch could not be loaded. Use Node 18+ or install node-fetch.');
    }
  }

  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.OPENROUTER_APP_NAME || 'AI Ad Generator'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(id);

      if (!resp.ok) {
        const text = await resp.text();
        lastErr = new Error(`OpenRouter error ${resp.status}: ${text}`);
        // Retry on rate limit or server errors
        if ((resp.status === 429 || resp.status >= 500) && attempt < maxAttempts) {
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }
        throw lastErr;
      }

      const j = await resp.json();

      // Extract text content from common response shapes
      let text = null;
      if (j?.choices && j.choices.length > 0) {
        const choice = j.choices[0];
        if (choice.message && typeof choice.message.content === 'string') text = choice.message.content;
        else if (typeof choice.text === 'string') text = choice.text;
        else if (choice.delta && typeof choice.delta.content === 'string') text = choice.delta.content;
      }
      if (!text && typeof j?.output === 'string') text = j.output;
      if (!text) text = JSON.stringify(j);

      return text;
    } catch (err) {
      clearTimeout(id);
      lastErr = err;
      // AbortError indicates timeout — retry if attempts remain
      const isAbort = err && (err.name === 'AbortError' || err.code === 'ABORT_ERR');
      const causeText = err?.cause ? `${err.cause.code || ''} ${err.cause.message || ''}` : '';
      const isTransient = isAbort || /ECONNRESET|ETIMEDOUT|network|ENOTFOUND/i.test(`${err?.message || ''} ${causeText}`);
      if (attempt < maxAttempts && (isTransient || /429|5\d\d/.test(String(err.message)))) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
      // no more retries
      throw err;
    }
  }
  throw lastErr || new Error('OpenRouter request failed');
}

function extractJsonObject(text) {
  if (!text) return null;
  // Remove simple code fences
  let s = text.trim().replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
  // Find first JSON object substring
  const match = s.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (err) {
    return null;
  }
}

function cleanGeneratedText(value) {
  return (value || '').toString().replace(/\\n/g, '\n').trim();
}

function extractHashtags(value) {
  return cleanGeneratedText(value).match(/#[\p{L}\p{N}_]+/gu) || [];
}

function normalizeHashtag(value) {
  const match = extractHashtags(value)[0] || value;
  const tag = cleanGeneratedText(match)
    .replace(/^#+/, '')
    .replace(/[^\p{L}\p{N}_]/gu, '');
  return tag ? `#${tag}` : null;
}

function normalizeHashtags(values, business, product) {
  const source = Array.isArray(values) ? values : extractHashtags(values);
  const defaultTags = generateHashtags(business, product);
  const unique = [];
  const seen = new Set();

  [...source, ...defaultTags].forEach((value) => {
    const tag = normalizeHashtag(value);
    if (!tag) return;

    const key = tag.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    unique.push(tag);
  });

  return unique.slice(0, 5);
}

function stripHashtags(value) {
  return cleanGeneratedText(value)
    .replace(/#[\p{L}\p{N}_]+/gu, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function removeTextOnce(value, textToRemove) {
  const text = cleanGeneratedText(value);
  const removable = cleanGeneratedText(textToRemove);
  return removable ? text.replace(removable, '').replace(/\n{3,}/g, '\n\n').trim() : text;
}

function normalizeAiOutput(data, business, product) {
  const instagram = data?.instagram || {};
  const facebook = data?.facebook || {};
  const tiktok = data?.tiktok || {};

  const hashtags = normalizeHashtags(
    [...(Array.isArray(instagram.hashtags) ? instagram.hashtags : []), ...extractHashtags(instagram.caption)],
    business,
    product
  );
  const cta = cleanGeneratedText(facebook.cta);

  return {
    instagram: {
      caption: stripHashtags(instagram.caption),
      hashtags
    },
    facebook: {
      ad_copy: removeTextOnce(facebook.ad_copy, cta),
      cta
    },
    tiktok: {
      hook: stripHashtags(tiktok.hook)
    }
  };
}

function formatError(err) {
  const message = err && err.message ? err.message : String(err);
  const cause = err?.cause ? ` (${err.cause.code || 'cause'}: ${err.cause.message || err.cause})` : '';
  return `${message}${cause}`;
}

async function generateWithOpenRouter(systemPrompt, business, product) {
  const messages = [
    { role: 'system', content: `${systemPrompt}\n\n${STRICT_OUTPUT_RULES}` },
    { role: 'user', content: `Business Name: ${business}\nProduct/Service: ${product}\nGenerate the ads.` }
  ];

  try {
    const text = await callOpenRouter(messages);
    const parsed = extractJsonObject(text);
    return { raw: text, parsed, error: false };
  } catch (err) {
    const message = formatError(err);
    console.error('OpenRouter call failed:', message);
    return { raw: message, parsed: null, error: true };
  }
}

app.post('/api/generate', async (req, res) => {
  const { business_name, product_service, mode } = req.body || {};
  const b = sanitizeInput(business_name);
  const p = sanitizeInput(product_service);
  const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
  console.log(`[req ${reqId}] /api/generate received; mode=${mode}`);

  if (!b || !p) {
    return res.status(400).json({ status: 'error', message: 'Inputs cannot be empty' });
  }

    try {
      const useOpenRouter = Boolean(OPENROUTER_API_KEY);
      if (!useOpenRouter) {
        console.error(`[req ${reqId}] OpenRouter API key not configured`);
        return res.status(500).json({ status: 'error', message: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env.' });
      }

      if ((mode || '').toString().toLowerCase() === 'agency') {
        // Parallel OpenRouter calls for each agent (each returns {raw, parsed, error})
        const [igRes, fbRes, ttRes] = await Promise.all([
          generateWithOpenRouter(process.env.PROMPT_IG || DEFAULT_PROMPTS.ig, b, p),
          generateWithOpenRouter(process.env.PROMPT_FB || DEFAULT_PROMPTS.fb, b, p),
          generateWithOpenRouter(process.env.PROMPT_TT || DEFAULT_PROMPTS.tt, b, p)
        ]);

        // If any agent failed, return an error.
        if (igRes.error || !igRes.parsed) {
          console.error(`[req ${reqId}] Instagram generation failed:`, igRes.raw);
          return res.status(502).json({ status: 'error', message: 'AI provider error (Instagram). Check server logs.' });
        }
        if (fbRes.error || !fbRes.parsed) {
          console.error(`[req ${reqId}] Facebook generation failed:`, fbRes.raw);
          return res.status(502).json({ status: 'error', message: 'AI provider error (Facebook). Check server logs.' });
        }
        if (ttRes.error || !ttRes.parsed) {
          console.error(`[req ${reqId}] TikTok generation failed:`, ttRes.raw);
          return res.status(502).json({ status: 'error', message: 'AI provider error (TikTok). Check server logs.' });
        }

        const data = normalizeAiOutput({ instagram: igRes.parsed, facebook: fbRes.parsed, tiktok: ttRes.parsed }, b, p);
        return res.json({ status: 'success', mode_used: 'agency', data });
      }

      // Express mode
      const resObj = await generateWithOpenRouter(process.env.PROMPT_EXPRESS || DEFAULT_PROMPTS.express, b, p);
      if (resObj.error || !resObj.parsed) {
        console.error(`[req ${reqId}] Express generation failed:`, resObj.raw);
        return res.status(502).json({ status: 'error', message: 'AI provider error. Check server logs.' });
      }
      const data = normalizeAiOutput(resObj.parsed, b, p);
      return res.json({ status: 'success', mode_used: 'express', data });
  } catch (err) {
    console.error(`[req ${reqId}] Generation error:`, err && err.stack ? err.stack : err);
    return res.status(500).json({ status: 'error', message: 'The AI engine timed out or returned invalid structure. Please try again.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static(clientDir));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ status: 'error', message: 'API route not found' });
  }

  return res.sendFile(path.join(clientDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Ad Generator server running on port ${PORT}`);
});
