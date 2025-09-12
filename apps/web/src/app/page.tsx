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

  // Judge Quick Test helpers
  const sampleText = 'Payment is due within 30 days from invoice date. Termination requires 30 days written notice. Liability is capped at 2x fees.';
  const sampleQuestion = 'What are the payment terms?';
  const [quickRunning, setQuickRunning] = useState(false);

  function fillSample() {
    setDatasetId('default');
    setName('sample');
    setText(sampleText);
    setQuery(sampleQuestion);
    setSynthesize(true);
    setUseFT(false);
  }

  async function runQuickTest() {
    try {
      setError('');
      setQuickRunning(true);
      fillSample();
      await fetchJson(`${API}/ingest`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId: 'default', name: 'sample', text: sampleText })
      });
      const data = await fetchJson(`${API}/query`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ datasetId: 'default', query: sampleQuestion, k: 3, synthesize: true, useFT: false })
      });
      setResultRaw(JSON.stringify(data, null, 2));
      setContexts(Array.isArray(data.contexts) ? data.contexts : []);
      setCitations(Array.isArray(data.citations) ? data.citations : []);
      setAnswer(data.answer || '');
    } catch (e: any) {
      setError(`Quick test failed: ${e?.message || e}`);
    } finally {
      setQuickRunning(false);
    }
  }

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
    <div style={{
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      background: '#fff',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '0.25rem',
          margin: 0
        }}>ProofSense</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>
          Local Contract Analysis
        </p>
        <div style={{
          fontSize: '0.8rem',
          color: '#888',
          marginTop: '0.5rem'
        }}>
          Backend: <span style={{ color: health?.status === 'ok' ? '#28a745' : '#dc3545' }}>{health?.status || 'unknown'}</span>
          {' • '}
          Model: <span style={{ color: health?.ollama ? '#28a745' : '#dc3545' }}>{health?.ollama ? 'ready' : 'unavailable'}</span>
        </div>
      </header>
      {error && <div style={{
        color: '#721c24',
        background: '#f8d7da',
        padding: '0.75rem',
        marginBottom: '1rem',
        borderRadius: '4px',
        border: '1px solid #f5c6cb',
        fontSize: '0.9rem'
      }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Ingest Section */}
        <div style={{
          border: '1px solid #ddd',
          padding: '1rem',
          borderRadius: '4px'
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '0.75rem',
            margin: '0 0 0.75rem 0'
          }}>Ingest</h2>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
              Dataset ID
            </label>
            <input
              value={datasetId}
              onChange={e => setDatasetId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
              Document Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="contract.md"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
              Contract Text
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste contract text here..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'Monaco, Consolas, monospace'
              }}
            />
          </div>

          <button
            onClick={onIngest}
            disabled={loading !== 'idle'}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: loading === 'ingest' ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.9rem',
              cursor: loading === 'ingest' ? 'not-allowed' : 'pointer'
            }}
          >
            {loading === 'ingest' ? 'Ingesting...' : 'Ingest'}
          </button>
        </div>
        {/* Query Section */}
        <div style={{
          border: '1px solid #ddd',
          padding: '1rem',
          borderRadius: '4px'
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '0.75rem',
            margin: '0 0 0.75rem 0'
          }}>Query</h2>

          {/* Judge Quick Test */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeeba',
            color: '#856404',
            padding: '0.6rem',
            borderRadius: '3px',
            marginBottom: '0.75rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ marginBottom: '0.4rem', fontWeight: 600 }}>Judge Quick Test</div>
            <ol style={{ margin: '0 0 0.5rem 1rem', padding: 0 }}>
              <li>Click “Fill sample” to prefill inputs</li>
              <li>Click “Run quick test” (ingest → query)</li>
            </ol>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={fillSample} style={{ padding: '0.35rem 0.6rem', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Fill sample</button>
              <button onClick={runQuickTest} disabled={quickRunning} style={{ padding: '0.35rem 0.6rem', background: quickRunning ? '#6c757d' : '#20c997', color: '#fff', border: 'none', borderRadius: 3, cursor: quickRunning ? 'not-allowed' : 'pointer' }}>{quickRunning ? 'Running…' : 'Run quick test'}</button>
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#555' }}>
              Question
            </label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What are the payment terms?"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={synthesize}
                onChange={e => setSynthesize(e.target.checked)}
              />
              <span>Generate Answer</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useFT}
                onChange={e => setUseFT(e.target.checked)}
              />
              <span>Use Fine-tuned</span>
            </label>
          </div>

          <button
            onClick={onQuery}
            disabled={loading !== 'idle'}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: loading === 'query' ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.9rem',
              cursor: loading === 'query' ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {loading === 'query' ? 'Querying...' : 'Query'}
          </button>

          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '0.5rem',
            borderBottom: '1px solid #eee',
            paddingBottom: '0.25rem'
          }}>Fine-tuning</h3>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={startFTJob}
              style={{
                padding: '0.4rem 0.8rem',
                background: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Start
            </button>
            <button
              onClick={loadFTJobs}
              style={{
                padding: '0.4rem 0.8rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ fontSize: '0.8rem' }}>
            {ftJobs.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>No jobs yet</p>
            ) : (
              ftJobs.map((job) => (
                <div key={job.id} style={{
                  background: '#f8f9fa',
                  padding: '0.5rem',
                  borderRadius: '3px',
                  marginBottom: '0.5rem',
                  border: `1px solid ${job.status === 'completed' ? '#28a745' : job.status === 'running' ? '#ffc107' : '#6c757d'}`
                }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    {job.id.slice(-8)} • <span style={{
                      color: job.status === 'completed' ? '#28a745' : job.status === 'running' ? '#ffc107' : '#6c757d'
                    }}>{job.status}</span>
                  </div>
                  {job.metrics && (
                    <div style={{ color: '#666', fontSize: '0.75rem' }}>
                      Loss: {job.metrics.loss} • Acc: {((job.metrics.accuracy || 0) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Results Section */}
      {(answer || contexts.length > 0) && (
        <div style={{
          border: '1px solid #ddd',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '0.75rem',
            margin: '0 0 0.75rem 0'
          }}>Results</h2>

          {answer && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                Answer
              </h3>
              <div style={{
                background: '#f8f9fa',
                padding: '0.75rem',
                borderRadius: '3px',
                border: '1px solid #dee2e6',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
                fontSize: '0.9rem'
              }}>
                {answer}
              </div>
            </div>
          )}

          {citations.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                Citations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {citations.map((c, idx) => (
                  <div key={idx} style={{
                    background: '#f8f9fa',
                    padding: '0.5rem',
                    borderRadius: '3px',
                    border: '1px solid #dee2e6',
                    fontSize: '0.8rem'
                  }}>
                    Doc: {c.docId?.split('-')[0] || 'Unknown'}
                    {typeof c.page === 'number' && <span> • Page {c.page}</span>}
                    <span style={{ marginLeft: '0.5rem', color: '#666' }}>#{c.rank}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contexts.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                Context
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {contexts.map((c) => (
                  <div key={c.id} style={{
                    background: '#f8f9fa',
                    padding: '0.5rem',
                    borderRadius: '3px',
                    border: '1px solid #dee2e6',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                      {c.name} • {(c.score * 100).toFixed(1)}%
                    </div>
                    {(c as any).text && (
                      <div style={{
                        color: '#666',
                        fontSize: '0.75rem',
                        fontFamily: 'Monaco, Consolas, monospace',
                        background: 'white',
                        padding: '0.4rem',
                        borderRadius: '2px',
                        marginTop: '0.25rem',
                        maxHeight: '80px',
                        overflow: 'auto'
                      }}>
                        {(c as any).text.substring(0, 150)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
