'use client';
import { useState } from 'react';

export default function Home() {
  const [datasetId, setDatasetId] = useState('default');
  const [name, setName] = useState('sample');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string>('');

  async function onIngest() {
    const res = await fetch('http://localhost:3001/ingest', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ datasetId, name, text })
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  }

  async function onQuery() {
    const res = await fetch('http://localhost:3001/query', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ datasetId, query, k: 3 })
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1>ProofSense</h1>
      <div>
        <label>DatasetId: </label>
        <input value={datasetId} onChange={e => setDatasetId(e.target.value)} />
      </div>
      <h2>Ingest</h2>
      <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="name" />
      </div>
      <div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="paste contract text here" rows={6} cols={80} />
      </div>
      <button onClick={onIngest}>Ingest</button>
      <h2>Query</h2>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ask..." />
      <button onClick={onQuery}>Ask</button>
      <h2>Result</h2>
      <pre>{result}</pre>
    </div>
  );
}
