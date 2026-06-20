import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Check,
  Camera,
  ChevronDown,
  Clipboard,
  Copy,
  Loader2,
  Send,
  Sparkles,
  ThumbsUp,
  WandSparkles,
  Zap
} from 'lucide-react';
import './styles.css';

const emptyResults = {
  instagram: {
    caption: '',
    hashtags: []
  },
  facebook: {
    ad_copy: '',
    cta: ''
  },
  tiktok: {
    hook: ''
  }
};

const sampleResults = {
  instagram: {
    caption:
      'Meet the ad concept that makes your product feel instantly easier to choose. Clear benefit, sharp emotion, and a scroll-stopping reason to act today.',
    hashtags: ['#softlaunch', '#growth', '#brandvoice', '#adcreative', '#conversion']
  },
  facebook: {
    ad_copy:
      'Turn product details into a crisp customer story with copy that explains the value fast and keeps the next step obvious.',
    cta: 'Create your first campaign'
  },
  tiktok: {
    hook: 'Your next best-performing ad might be hiding in one product sentence.'
  }
};

const modes = [
  {
    value: 'express',
    label: 'Express',
    description: 'Fast multi-platform copy'
  },
  {
    value: 'agency',
    label: 'Agency',
    description: 'Separate specialist agents'
  }
];

function normalizeNewlines(value) {
  return (value || '').toString().replace(/\\n/g, '\n').trim();
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Field({ id, label, children, hint }) {
  return (
    <label htmlFor={id} className="group block space-y-2">
      <span className="flex items-center justify-between text-sm font-semibold text-slate-600">
        {label}
        {hint ? <span className="text-xs font-medium text-slate-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function TextInput({ id, value, onChange, placeholder, disabled }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-14 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-[15px] font-medium text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04),0_1px_0_rgba(255,255,255,0.85)] outline-none transition duration-200 placeholder:text-slate-300 focus:border-mint-300 focus:ring-2 focus:ring-emerald-300/75 disabled:cursor-not-allowed disabled:bg-slate-50"
    />
  );
}

function ModeSelect({ value, onChange, disabled }) {
  const selectedMode = modes.find((mode) => mode.value === value) || modes[0];

  return (
    <div className="relative">
      <select
        id="mode"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-14 w-full appearance-none rounded-2xl border border-slate-200/80 bg-white px-4 pr-12 text-[15px] font-semibold text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04),0_1px_0_rgba(255,255,255,0.85)] outline-none transition duration-200 focus:border-mint-300 focus:ring-2 focus:ring-emerald-300/75 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        {modes.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label} - {mode.description}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
      />
      <p className="mt-2 text-xs font-medium text-slate-400">{selectedMode.description}</p>
    </div>
  );
}

function GeneratorPanel({ form, setForm, onSubmit, loading, error }) {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-feather ring-1 ring-slate-900/[0.03] sm:p-7">
        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-100 text-mint-600 shadow-[0_10px_30px_rgba(174,226,211,0.55)]">
            <WandSparkles className="h-6 w-6" />
          </div>
          <h1 className="bg-gradient-to-r from-slate-950 via-mint-600 to-emerald-400 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
            AI Ad Generator
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
            High-converting, platform-native ad copy in a clean creative workflow.
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <Field id="business" label="Business Name">
            <TextInput
              id="business"
              value={form.business}
              onChange={(business) => setForm((current) => ({ ...current, business }))}
              placeholder="Luma Studio"
              disabled={loading}
            />
          </Field>

          <Field id="product" label="Product / Service" hint="Required">
            <TextInput
              id="product"
              value={form.product}
              onChange={(product) => setForm((current) => ({ ...current, product }))}
              placeholder="AI content subscription"
              disabled={loading}
            />
          </Field>

          <Field id="mode" label="Generation Mode">
            <ModeSelect
              value={form.mode}
              onChange={(mode) => setForm((current) => ({ ...current, mode }))}
              disabled={loading}
            />
          </Field>

          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mint-300 via-emerald-300 to-teal-400 px-5 text-[15px] font-extrabold text-slate-900 shadow-mint transition duration-200 hover:scale-[1.02] hover:from-mint-200 hover:via-emerald-300 hover:to-teal-300 hover:shadow-[0_22px_55px_rgba(73,202,174,0.45)] focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:scale-100 disabled:cursor-wait disabled:opacity-75"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 transition group-hover:rotate-12" />
            )}
            {loading ? 'Generating...' : 'Generate Ads'}
          </button>
        </form>

        <div className="mt-7 grid grid-cols-3 gap-3 text-center">
          {[
            ['3', 'Platforms'],
            ['5', 'Hashtags'],
            ['2x', 'Modes']
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-2 py-3">
              <div className="text-lg font-extrabold text-slate-900">{value}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="group/copy relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 hover:border-mint-200 hover:bg-mint-50 hover:text-mint-600"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="pointer-events-none absolute right-0 top-12 z-20 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover/copy:translate-y-0 group-hover/copy:opacity-100">
        {copied ? 'Copied' : 'Copy to clipboard'}
      </span>
    </button>
  );
}

function HashtagPill({ tag }) {
  return (
    <span className="rounded-full bg-mint-50 px-3 py-1.5 text-sm font-bold text-mint-600 ring-1 ring-mint-200/70">
      {tag}
    </span>
  );
}

function ResultSection({ label, children }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      {children}
    </div>
  );
}

function PlatformCard({ platform, icon: Icon, gradient, title, description, children, text }) {
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] transition duration-300 hover:-translate-y-1 hover:shadow-feather sm:p-6">
      <div className={cn('absolute inset-x-0 top-0 h-1', gradient)} />
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-100">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-slate-950">{platform}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
          </div>
        </div>
        <CopyButton text={text} label={`Copy ${platform} ad`} />
      </header>
      <div className="space-y-5">
        <ResultSection label={title}>{children}</ResultSection>
      </div>
    </article>
  );
}

function ResultsFeed({ results, loading, hasGenerated }) {
  const displayResults = hasGenerated ? results : sampleResults;

  const copyText = useMemo(
    () => ({
      instagram: [
        normalizeNewlines(displayResults.instagram.caption),
        ...(displayResults.instagram.hashtags || [])
      ]
        .filter(Boolean)
        .join('\n\n'),
      facebook: [normalizeNewlines(displayResults.facebook.ad_copy), displayResults.facebook.cta]
        .filter(Boolean)
        .join('\n\n'),
      tiktok: normalizeNewlines(displayResults.tiktok.hook)
    }),
    [displayResults]
  );

  if (loading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-sm"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded-full bg-slate-100" />
                <div className="h-3 w-44 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full rounded-full bg-slate-100" />
              <div className="h-3 w-11/12 rounded-full bg-slate-100" />
              <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-[1.75rem] border border-white/80 bg-white/70 p-5 shadow-sm ring-1 ring-slate-900/[0.02] sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint-600">
            {hasGenerated ? 'Generated Output' : 'Live Preview'}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Platform-ready ad set</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
          <Clipboard className="h-4 w-4 text-mint-500" />
          Copy-ready cards
        </div>
      </div>

      <PlatformCard
        platform="Instagram"
        icon={Camera}
        gradient="bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-600"
        title="Caption"
        description="Short, visual, and hashtag-ready."
        text={copyText.instagram}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
          {normalizeNewlines(displayResults.instagram.caption)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(displayResults.instagram.hashtags || []).map((tag) => (
            <HashtagPill key={tag} tag={tag} />
          ))}
        </div>
      </PlatformCard>

      <PlatformCard
        platform="Facebook"
        icon={ThumbsUp}
        gradient="bg-gradient-to-r from-[#1877F2] to-[#0A56C2]"
        title="Ad Copy"
        description="Clear value story with a direct CTA."
        text={copyText.facebook}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
          {normalizeNewlines(displayResults.facebook.ad_copy)}
        </p>
        {displayResults.facebook.cta ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-mint-50 px-4 py-2 text-sm font-extrabold text-mint-600 ring-1 ring-mint-200/70">
            <Send className="h-4 w-4" />
            {displayResults.facebook.cta}
          </div>
        ) : null}
      </PlatformCard>

      <PlatformCard
        platform="TikTok"
        icon={Zap}
        gradient="bg-gradient-to-r from-cyan-300 via-slate-900 to-rose-400"
        title="Hook"
        description="One-sentence opener for quick attention."
        text={copyText.tiktok}
      >
        <p className="text-2xl font-extrabold leading-snug text-slate-950">
          {normalizeNewlines(displayResults.tiktok.hook)}
        </p>
      </PlatformCard>
    </div>
  );
}

function App() {
  const [form, setForm] = useState({
    business: '',
    product: '',
    mode: 'express'
  });
  const [results, setResults] = useState(emptyResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.business.trim() || !form.product.trim()) {
      setError('Add a business name and product or service to generate ads.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business,
          product_service: form.product,
          mode: form.mode
        })
      });
      const payload = await response.json();

      if (!response.ok || payload.status !== 'success') {
        throw new Error(payload.message || 'Generation failed. Please try again.');
      }

      setResults(payload.data);
      setHasGenerated(true);
    } catch (generationError) {
      setError(generationError.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-[1480px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(340px,35%)_minmax(0,65%)] lg:px-8 lg:py-6">
        <GeneratorPanel
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        <section className="min-h-0 rounded-[2rem] border border-white/80 bg-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-900/[0.02] sm:p-4 lg:h-[calc(100vh-3rem)]">
          <div className="h-full overflow-y-auto rounded-[1.5rem] pr-1 lg:pr-2">
            <ResultsFeed results={results} loading={loading} hasGenerated={hasGenerated} />
          </div>
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
