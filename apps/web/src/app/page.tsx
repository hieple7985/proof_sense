'use client';
import { useEffect, useState } from 'react';

type ContextItem = { id: string; name: string; score: number };

type Citation = { docId?: string; page?: number; quote?: string; offsets?: any; rank?: number };

type FTJob = {
  id: string;
  datasetId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  model: string;
  recipe: 'lora' | 'qlora';
  metrics?: { loss?: number; accuracy?: number };
  createdAt: string;
  completedAt?: string;
};

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function fetchJson(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${json?.error || text}`);
    return json;
  } catch (e) {
    const errMsg = `HTTP ${res.status} · ${text.slice(0, 160)}`;
    throw new Error(errMsg);
  }
}

export default function Home() {
  const [datasetId, setDatasetId] = useState('default');
  const [name, setName] = useState('sample');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [synthesize, setSynthesize] = useState(true);
  const [useFT, setUseFT] = useState(false);
  const [answer, setAnswer] = useState('');
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [resultRaw, setResultRaw] = useState<string>('');
  const [health, setHealth] = useState<{ status: string; ollama: boolean; tag?: string } | null>(null);
  const [loading, setLoading] = useState<'idle'|'ingest'|'query'>('idle');
  const [error, setError] = useState<string>('');
  const [ftJobs, setFtJobs] = useState<FTJob[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJson(`${API}/healthz`);
        setHealth(data);
      } catch (_) { setHealth(null); }
    })();
  }, []);

  async function loadFTJobs() {
    try {
      const data = await fetchJson(`${API}/finetune/jobs`);
      setFtJobs(data);
    } catch (_) { setFtJobs([]); }
  }

  async function startFTJob() {
    try {
      await fetchJson(`${API}/finetune`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId, recipe: 'lora' })
      });
      await loadFTJobs();
      setError('');
    } catch (e: any) {
      setError(`FT job failed: ${e?.message || e}`);
    }
  }

  async function onIngest() {
    setError('');
    setLoading('ingest');
    try {
      const data = await fetchJson(`${API}/ingest`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId, name, text })
      });
      setResultRaw(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setError(`Ingest failed: ${e?.message || e}`);
    } finally {
      setLoading('idle');
    }
  }

  async function onQuery() {
    setError('');
    setLoading('query');
    try {
      const data = await fetchJson(`${API}/query`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId, query, k: 3, synthesize, useFT })
      });
      setResultRaw(JSON.stringify(data, null, 2));
      setContexts(Array.isArray(data.contexts) ? data.contexts : []);
      setCitations(Array.isArray(data.citations) ? data.citations : []);
      setAnswer(data.answer || '');
    } catch (e: any) {
      setError(`Query failed: ${e?.message || e}`);
    } finally {
      setLoading('idle');
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 900 }}>
      <h1>ProofSense</h1>
      <div style={{ marginBottom: 8 }}>
        <strong>Backend:</strong> {health ? `${health.status}` : 'unknown'} · <strong>Ollama:</strong> {health ? (health.ollama ? `available${health.tag ? ' ('+health.tag+')' : ''}` : 'unavailable') : 'unknown'}
        <div style={{ fontSize: 12, color: '#555' }}>API: {API}</div>
      </div>
      {error && <div style={{ color: 'white', background:'#c0392b', padding:8, marginBottom:8 }}>{error}</div>}
      <div>
        <label>DatasetId: </label>
        <input value={datasetId} onChange={e => setDatasetId(e.target.value)} />
      </div>
      <h2>Ingest</h2>
      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="name" />
      </div>
      <div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="paste contract text here" rows={6} cols={90} />
      </div>
      <button onClick={onIngest} disabled={loading !== 'idle'}>{loading==='ingest' ? 'Ingesting...' : 'Ingest'}</button>
      <h2>Fine-tune Jobs</h2>
      <button onClick={startFTJob}>Start FT Job</button>
      <button onClick={loadFTJobs} style={{ marginLeft: 8 }}>Refresh</button>
      <ul>
        {ftJobs.map((job) => (
          <li key={job.id}>
            <strong>{job.id}</strong> · {job.status} · {job.recipe} · {job.metrics ? `loss: ${job.metrics.loss}, acc: ${job.metrics.accuracy}` : ''}
          </li>
        ))}
      </ul>
      <h2>Query</h2>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ask..." style={{ width: 400 }} />
      <label style={{ marginLeft: 12 }}>
        <input type="checkbox" checked={synthesize} onChange={e => setSynthesize(e.target.checked)} />
        {' '}Synthesize
      </label>
      <label style={{ marginLeft: 12 }}>
        <input type="checkbox" checked={useFT} onChange={e => setUseFT(e.target.checked)} />
        {' '}Use FT
      </label>
      <button onClick={onQuery} style={{ marginLeft: 8 }} disabled={loading !== 'idle'}>{loading==='query' ? 'Asking...' : 'Ask'}</button>
      <h2>Answer</h2>
      <div style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 8 }}>{answer}</div>
      <h2>Citations</h2>
      <ul>
        {citations.map((c, idx) => (
          <li key={idx}>
            <strong>doc:</strong> {c.docId || '-'} {typeof c.page === 'number' ? ` · page ${c.page}` : ''}
          </li>
        ))}
      </ul>
      <h2>Contexts</h2>
      <ul>
        {contexts.map((c) => (
          <li key={c.id}>
            <code>{c.id}</code> · <strong>{c.name}</strong> · score: {c.score.toFixed(4)}
          </li>
        ))}
      </ul>
      <h2>Raw</h2>
      <pre>{resultRaw}</pre>
    </div>
  );
}
