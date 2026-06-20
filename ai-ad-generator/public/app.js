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

function setFormDisabled(disabled){
  const form = document.getElementById('genForm');
  const elements = form.querySelectorAll('input,select,button,textarea');
  elements.forEach((el)=> el.disabled = disabled);
  if(disabled) form.classList.add('form-disabled');
  else form.classList.remove('form-disabled');
}

function copyToClipboard(targetId, btn){
  const el = document.getElementById(targetId);
  if(!el) return;
  const text = el.innerText || el.textContent || '';
  navigator.clipboard?.writeText(text).then(()=>{
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(()=> btn.textContent = orig, 1400);
  }).catch(()=> alert('Copy failed'));
}

function attachCopyButtons(){
  document.querySelectorAll('.copy-btn').forEach(btn => {
    // avoid adding multiple listeners
    if (btn._attached) return;
    btn.addEventListener('click', (e)=>{
      const target = btn.getAttribute('data-target');
      copyToClipboard(target, btn);
    });
    btn._attached = true;
  });
}

attachCopyButtons();

document.getElementById('genForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const business = document.getElementById('business').value;
  const product = document.getElementById('product').value;
  const mode = document.getElementById('mode').value;

  const generateButton = document.getElementById('generate');
  // loading state
  generateButton.disabled = true;
  generateButton.classList.add('button-loading');
  generateButton.innerHTML = '<span class="spinner"></span>Generating...';
  setFormDisabled(true);

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

    // reveal results and remove placeholder
    const resultsEl = document.getElementById('results');
    const placeholder = document.getElementById('placeholder');
    if(placeholder) placeholder.style.display = 'none';
    resultsEl.classList.remove('hidden');
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

    // animate cards
    document.querySelectorAll('.card').forEach((c, i)=>{
      c.classList.remove('fade-in');
      void c.offsetWidth;
      c.classList.add('fade-in');
    });

    // re-attach copy buttons (in case of dynamic changes)
    attachCopyButtons();
  } catch (err) {
    console.error(err);
    alert('Request failed. See console for details.');
  } finally {
    generateButton.disabled = false;
    generateButton.classList.remove('button-loading');
    generateButton.textContent = 'Generate';
    setFormDisabled(false);
  }
});
