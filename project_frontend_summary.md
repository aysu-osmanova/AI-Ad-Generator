# Project Frontend Summary

Below is a tree view of the project and the complete frontend code (HTML, JS) and styling (CSS).

## Project tree

```
Ai Engineer pos/
├─ AI-prompts.md
├─ AI.md
├─ backend.md
├─ frontend.md
├─ instructions.md
├─ ai-ad-generator/
│  ├─ package.json
│  ├─ README.md
│  ├─ .env.example (optional)
│  └─ public/
│     ├─ index.html
│     ├─ app.js
│     └─ styles.css
│  └─ server/
│     └─ index.js
└─ server/  (not present or project-specific)
```

---

## Main frontend file: index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>AI Ad Generator</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="container">
      <h1>AI Ad Generator</h1>

      <form id="genForm">
        <label>Business Name
          <input id="business" name="business_name" required />
        </label>

        <label>Product / Service
          <input id="product" name="product_service" required />
        </label>

        <label>Mode
          <select id="mode" name="mode">
            <option value="express">Express</option>
            <option value="agency">Agency</option>
          </select>
        </label>

        <button id="generate">Generate</button>
      </form>

      <section id="results" class="hidden">
        <div class="card" id="instagramCard">
          <h2>Instagram</h2>
          <div id="instagram" class="result-content"></div>
        </div>

        <div class="card" id="facebookCard">
          <h2>Facebook</h2>
          <div id="facebook" class="result-content"></div>
        </div>

        <div class="card" id="tiktokCard">
          <h2>TikTok</h2>
          <div id="tiktok" class="result-content"></div>
        </div>
      </section>

      <script src="/app.js"></script>
    </main>
  </body>
</html>
```

---

## Frontend logic: app.js

```javascript
function normalizeNewlines(value) {
  return (value || '').toString().replace(/\\n/g, '\n').trim();
}

function renderPlatformResult(elementId, sections) {
  const element = document.getElementById(elementId);
  element.replaceChildren();

  sections
    .filter((section) => section.value)
    .forEach((section) => {
      const block = document.createElement('div');
      block.className = 'result-block';

      if (section.label) {
        const label = document.createElement('div');
        label.className = 'result-label';
        label.textContent = section.label;
        block.appendChild(label);
      }

      const content = document.createElement('div');
      content.className = section.className || 'result-copy';
      content.textContent = normalizeNewlines(section.value);
      block.appendChild(content);
      element.appendChild(block);
    });
}

document.getElementById('genForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const business = document.getElementById('business').value;
  const product = document.getElementById('product').value;
  const mode = document.getElementById('mode').value;

  const generateButton = document.getElementById('generate');
  generateButton.disabled = true;
  generateButton.textContent = 'Generating... ⏳';

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_name: business, product_service: product, mode })
    });

    const json = await resp.json();
    if (json.status !== 'success') {
      alert(json.message || 'Generation failed');
      return;
    }

    const { instagram, facebook, tiktok } = json.data;

    document.getElementById('results').classList.remove('hidden');
    renderPlatformResult('instagram', [
      { label: 'Caption', value: instagram.caption },
      { label: 'Hashtags', value: (instagram.hashtags || []).join(' '), className: 'result-tags' }
    ]);
    renderPlatformResult('facebook', [
      { label: 'Ad Copy', value: facebook.ad_copy },
      { label: 'CTA', value: facebook.cta, className: 'result-cta' }
    ]);
    renderPlatformResult('tiktok', [
      { label: 'Hook', value: tiktok.hook, className: 'result-hook' }
    ]);
  } catch (err) {
    console.error(err);
    alert('Request failed. See console for details.');
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = 'Generate';
  }
});
```

---

## Styling: styles.css

```css
:root{--bg:#f7fafc;--card:#ffffff;--accent:#0f172a}
*{box-sizing:border-box;font-family:Inter,system-ui,Segoe UI,Roboto,"Helvetica Neue",Arial}
body{margin:0;background:var(--bg);color:var(--accent);padding:24px}
.container{max-width:820px;margin:0 auto}
h1{margin:0 0 16px}
form{display:grid;gap:12px;margin-bottom:18px}
label{display:block}
input,select{width:100%;padding:10px;border:1px solid #e6edf3;border-radius:6px}
button{padding:10px 14px;background:#0ea5a8;border:none;color:white;border-radius:6px;cursor:pointer}
.hidden{display:none}
.card{background:var(--card);padding:14px;border-radius:8px;box-shadow:0 6px 18px rgba(2,6,23,0.06);margin-bottom:12px}
.result-content{margin:0}
.result-block{margin-top:14px}
.result-block:first-child{margin-top:0}
.result-label{margin-bottom:6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#64748b}
.result-copy{white-space:pre-wrap;line-height:1.5}
.result-tags{line-height:1.7;color:#0f766e;font-weight:700}
.result-cta{white-space:pre-wrap;color:#0f766e;font-weight:800}
.result-hook{font-size:22px;line-height:1.35;font-weight:800}
```

---

File created: `project_frontend_summary.md`
