# 🖥️ Backend Architecture Guide (Intern Edition)

This document details the lightweight, highly effective backend engine for the Multi-Platform AI Ad Generator. It is designed to be straightforward to implement, clean to deploy on Railway, and structurally advanced enough to impress evaluators.

---

## 1. API Endpoint Specification

The backend exposes a single, clean REST API endpoint.

### `POST /api/generate`

#### Request Payload (JSON)
```json
{
  "business_name": "CoffeeCraft Baku",
  "product_service": "Premium Nitro Cold Brew Coffee in portable cans",
  "mode": "agency"
}
```

`mode` can be either `"express"` or `"agency"`.

#### Response Payload (JSON)

Regardless of the mode selected, the backend must normalize the output so the frontend always receives the exact same structure:

```json
{
  "status": "success",
  "mode_used": "agency",
  "data": {
    "instagram": {
      "caption": "Velvety smoothness meets pure energy... [truncated]",
      "hashtags": ["#BakuCoffee", "#NitroColdBrew", "#BakuEats", "#CaffeineFix", "#CoffeeCraft"]
    },
    "facebook": {
      "ad_copy": "Are you tired of watery iced coffee? [truncated]",
      "cta": "👉 ORDER YOUR REFRESHING 4-PACK TODAY AT COFFEECRAFT.AZ"
    },
    "tiktok": {
      "hook": "Stop scrolling if you're tired of overpaying for bad coffee in Baku. 🤫"
    }
  }
}
```

---

## 2. Core Control Flow Logic

The engine uses simple conditional routing based on the user's mode selection.

```
               ┌──► If mode == "express" ──► Execute ExpressService (Single LLM Call)
Request ───────┤
               └──► If mode == "agency"  ──► Execute AgencyService (3 Parallel LLM Calls)
```

### Pathway A: Express Mode (Single API Call)

When `mode === "express"`, the backend builds one comprehensive system prompt. It instructs the LLM to generate copy for all three platforms at once and return it as a structured JSON object.

> **Implementation Tip:** Use the LLM provider's "JSON Mode" (e.g., `response_format: { type: "json_object" }` in OpenAI) to ensure the LLM strictly replies with parseable JSON matching the response payload template.

### Pathway B: Agency Mode (Parallel Multi-Prompt)

When `mode === "agency"`, the backend triggers three independent API requests simultaneously rather than sequentially. This keeps response times fast.

**Node.js / TypeScript Framework:**
```ts
Promise.all([
  generateInstagram(),
  generateFacebook(),
  generateTikTok()
])
```

**Python Framework (FastAPI):**
```python
asyncio.gather([
  generate_instagram(),
  generate_facebook(),
  generate_tiktok()
])
```

---

## 3. Isolated System Prompts (The Secret Sauce)

To ensure perfect tone differentiation without complex code, the backend maintains strict system prompts for the generation tasks.

### 1. Instagram Generator Context

**System Prompt:** You are an expert Instagram Copywriter. Write an engaging ad caption using the AIDA (Attention, Interest, Desire, Action) framework based on the user's business. Use emojis as clean bullet points. Provide exactly 5 relevant hashtags structured as arrays.

### 2. Facebook Generator Context

**System Prompt:** You are a Senior Direct-Response Facebook Marketer. Write a persuasive 3-paragraph ad copy using the PAS (Problem, Agitate, Solve) framework. Identify a core pain point, agitate it, and present the user's business as the solution. The very last line must be an isolated, capitalized, high-conversion Call to Action (CTA) starting with an emoji.

### 3. TikTok Generator Context

**System Prompt:** You are a viral TikTok Growth Hacker. Create exactly one short, punchy, disruptive user-generated content (UGC) video hook sentence. Avoid corporate buzzwords. Make it sound like an organic trend or a pattern-interrupt sequence.

---

## 4. Error Handling & Railway Stability

To ensure the system is stable and won't crash during evaluation, implement two simple safety guards:

### Input Validation

If `business_name` or `product_service` arrives empty or purely whitespace, immediately reject the request with a `400 Bad Request` status and an error message (`"Inputs cannot be empty"`). Don't waste API tokens on blank requests.

### Try-Catch Wrapper

Wrap the LLM parsing logic in a standard `try-catch` block. If the LLM generates poorly formatted data or times out, return a structured fallback response instead of letting the server crash:

```json
{
  "status": "error",
  "message": "The AI engine timed out or returned invalid structure. Please try again."
}
```
