'use client';
import { useEffect, useState } from 'react';

type ContextItem = { id: string; name: string; score: number };

type Citation = { docId?: string; page?: number; quote?: string; offsets?: any; rank?: number };

export default function Home() {
  const [datasetId, setDatasetId] = useState('default');
  const [name, setName] = useState('sample');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [synthesize, setSynthesize] = useState(true);
  const [answer, setAnswer] = useState('');
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [resultRaw, setResultRaw] = useState<string>('');
  const [health, setHealth] = useState<{ status: string; ollama: boolean; tag?: string } | null>(null);
  const [loading, setLoading] = useState<'idle'|'ingest'|'query'>('idle');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3001/healthz');
        if (res.ok) setHealth(await res.json());
      } catch (_) { setHealth(null); }
    })();
  }, []);

  async function onIngest() {
    setError('');
    setLoading('ingest');
    try {
      const res = await fetch('http://localhost:3001/ingest', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId, name, text })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
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
      const res = await fetch('http://localhost:3001/query', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId, query, k: 3, synthesize })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
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
      <h2>Query</h2>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ask..." style={{ width: 400 }} />
      <label style={{ marginLeft: 12 }}>
        <input type="checkbox" checked={synthesize} onChange={e => setSynthesize(e.target.checked)} />
        {' '}Synthesize
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
