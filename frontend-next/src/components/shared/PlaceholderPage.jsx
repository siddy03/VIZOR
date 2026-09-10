'use client';

// Mirrors the simple inline-template pages (benchmarks/tools/exchange/meetings/admin).
export function PlaceholderPage({ heading, text }) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 400, color: '#202124', marginBottom: 16 }}>{heading}</h2>
      <p style={{ fontSize: 14, color: '#5f6368' }}>{text}</p>
    </div>
  );
}
