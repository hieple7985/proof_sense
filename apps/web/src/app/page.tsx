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
    <div style={{
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#fafafa',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '300',
          color: '#2c3e50',
          marginBottom: '0.5rem'
        }}>ProofSense</h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          Local Contract Analysis with Transparent Citations
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '0.9rem',
          color: '#555'
        }}>
          <span>Backend: <strong style={{ color: health?.status === 'ok' ? '#27ae60' : '#e74c3c' }}>{health?.status || 'unknown'}</strong></span>
          <span>•</span>
          <span>Model: <strong style={{ color: health?.ollama ? '#27ae60' : '#e74c3c' }}>{health?.ollama ? 'ready' : 'unavailable'}</strong></span>
        </div>
      </header>
      {error && <div style={{
        color: 'white',
        background: '#e74c3c',
        padding: '1rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

        {/* Ingest Section */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            color: '#2c3e50',
            marginBottom: '1rem',
            borderBottom: '2px solid #3498db',
            paddingBottom: '0.5rem'
          }}>📄 Ingest Documents</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>
              Dataset ID
            </label>
            <input
              value={datasetId}
              onChange={e => setDatasetId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ecf0f1',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3498db'}
              onBlur={e => e.target.style.borderColor = '#ecf0f1'}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>
              Document Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="contract.md"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ecf0f1',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3498db'}
              onBlur={e => e.target.style.borderColor = '#ecf0f1'}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>
              Contract Text
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your contract text here..."
              rows={8}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ecf0f1',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'vertical',
                fontFamily: 'Monaco, Consolas, monospace'
              }}
              onFocus={e => e.target.style.borderColor = '#3498db'}
              onBlur={e => e.target.style.borderColor = '#ecf0f1'}
            />
          </div>

          <button
            onClick={onIngest}
            disabled={loading !== 'idle'}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading === 'ingest' ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading === 'ingest' ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading === 'ingest' ? '📤 Ingesting...' : '📤 Ingest Document'}
          </button>
        </div>
        {/* Query & Fine-tune Section */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            color: '#2c3e50',
            marginBottom: '1rem',
            borderBottom: '2px solid #e67e22',
            paddingBottom: '0.5rem'
          }}>🔍 Query & Analysis</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#555' }}>
              Question
            </label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="What are the payment terms?"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ecf0f1',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#e67e22'}
              onBlur={e => e.target.style.borderColor = '#ecf0f1'}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={synthesize}
                onChange={e => setSynthesize(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500', color: '#555' }}>Generate Answer</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useFT}
                onChange={e => setUseFT(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '500', color: '#555' }}>Use Fine-tuned Model</span>
            </label>
          </div>

          <button
            onClick={onQuery}
            disabled={loading !== 'idle'}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading === 'query' ? '#95a5a6' : '#e67e22',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading === 'query' ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '1.5rem'
            }}
          >
            {loading === 'query' ? '🔍 Analyzing...' : '🔍 Ask Question'}
          </button>

          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '500',
            color: '#8e44ad',
            marginBottom: '1rem',
            borderBottom: '1px solid #ecf0f1',
            paddingBottom: '0.5rem'
          }}>🧠 Fine-tuning</h3>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={startFTJob}
              style={{
                padding: '0.5rem 1rem',
                background: '#8e44ad',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Start Training
            </button>
            <button
              onClick={loadFTJobs}
              style={{
                padding: '0.5rem 1rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ fontSize: '0.9rem' }}>
            {ftJobs.length === 0 ? (
              <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No fine-tuning jobs yet</p>
            ) : (
              ftJobs.map((job) => (
                <div key={job.id} style={{
                  background: '#f8f9fa',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  border: `2px solid ${job.status === 'completed' ? '#27ae60' : job.status === 'running' ? '#f39c12' : '#95a5a6'}`
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {job.id} • <span style={{
                      color: job.status === 'completed' ? '#27ae60' : job.status === 'running' ? '#f39c12' : '#95a5a6'
                    }}>{job.status}</span>
                  </div>
                  {job.metrics && (
                    <div style={{ color: '#555', fontSize: '0.8rem' }}>
                      Loss: {job.metrics.loss} • Accuracy: {((job.metrics.accuracy || 0) * 100).toFixed(1)}%
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
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            color: '#2c3e50',
            marginBottom: '1rem',
            borderBottom: '2px solid #27ae60',
            paddingBottom: '0.5rem'
          }}>💡 Analysis Results</h2>

          {answer && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#27ae60', marginBottom: '0.5rem' }}>
                Answer
              </h3>
              <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #27ae60',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                fontSize: '1rem'
              }}>
                {answer}
              </div>
            </div>
          )}

          {citations.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#e74c3c', marginBottom: '0.5rem' }}>
                📚 Source Citations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {citations.map((c, idx) => (
                  <div key={idx} style={{
                    background: '#fff5f5',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #fed7d7',
                    fontSize: '0.9rem'
                  }}>
                    <strong>Document:</strong> {c.docId?.split('-')[0] || 'Unknown'}
                    {typeof c.page === 'number' && <span> • Page {c.page}</span>}
                    <span style={{ marginLeft: '0.5rem', color: '#666' }}>#{c.rank}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contexts.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#3498db', marginBottom: '0.5rem' }}>
                🔍 Retrieved Context
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {contexts.map((c) => (
                  <div key={c.id} style={{
                    background: '#f0f8ff',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #bee5eb',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      {c.name} • Relevance: {(c.score * 100).toFixed(1)}%
                    </div>
                    {(c as any).text && (
                      <div style={{
                        color: '#555',
                        fontSize: '0.8rem',
                        fontFamily: 'Monaco, Consolas, monospace',
                        background: 'white',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        marginTop: '0.5rem',
                        maxHeight: '100px',
                        overflow: 'auto'
                      }}>
                        {(c as any).text.substring(0, 200)}...
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
