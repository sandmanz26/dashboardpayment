import { useEffect, useMemo, useRef, useState } from 'react';
import { chartLabels, chartRanges, chartValues, fmt } from '../data/mock';

const H = 419;
const M = { top: 8, right: 0, bottom: 40, left: 70 };
const TICKS = [250e6, 500e6, 750e6, 1e9];
const yLabel = (v: number) => (v >= 1e9 ? `${v / 1e9}B` : `${v / 1e6}M`);

/** Fritsch–Carlson monotone cubic path so the line never overshoots the data. */
function monotonePath(pts: [number, number][]): string {
  const n = pts.length;
  const dx: number[] = [], m: number[] = [], t: number[] = new Array(n);
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0];
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${pts[i][0] + h},${pts[i][1] + t[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - t[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}

export default function BalanceChart() {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const { pts, line, area, x, y, plotBottom } = useMemo(() => {
    const plotW = w - M.left - M.right;
    const plotBottom = H - M.bottom;
    const max = 1.1e9;
    const x = (i: number) => M.left + (i / (chartValues.length - 1)) * plotW;
    const y = (v: number) => M.top + (1 - v / max) * (plotBottom - M.top);
    const pts = chartValues.map((v, i) => [x(i), y(v)] as [number, number]);
    const line = monotonePath(pts);
    const area = `${line}L${x(chartValues.length - 1)},${plotBottom}L${x(0)},${plotBottom}Z`;
    return { pts, line, area, x, y, plotBottom };
  }, [w]);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    let best = 0;
    pts.forEach((p, i) => { if (Math.abs(p[0] - px) < Math.abs(pts[best][0] - px)) best = i; });
    setHover(best);
  };

  const tipW = 282;
  const hx = hover != null ? pts[hover][0] : 0;
  const tipLeft = hover != null && hx + 12 + tipW > w ? hx - 12 - tipW : hx + 12;

  return (
    <div ref={wrap} className="chart" >
      <svg width={w} height={H} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B5FFF" stopOpacity="0.14" />
            <stop offset="1" stopColor="#0B5FFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={w - M.right} y1={y(t)} y2={y(t)} stroke="#e2e6ec" strokeDasharray="3 3" />
            <text x={M.left - 23} y={y(t) + 4} textAnchor="middle" className="axis">{yLabel(t)}</text>
          </g>
        ))}
        <line x1={M.left} x2={M.left} y1={M.top} y2={plotBottom} stroke="#eef0f4" />
        <path d={area} fill="url(#area)" />
        <path d={line} fill="none" stroke="#0B5FFF" strokeWidth="2" />
        {chartLabels.map((l, i) => (
          <text key={l} x={x(i)} y={plotBottom + 28} textAnchor={i === chartLabels.length - 1 ? 'end' : 'middle'} className="axis">{l}</text>
        ))}
        {hover != null && (
          <g>
            <line x1={hx} x2={hx} y1={M.top} y2={plotBottom} stroke="#111827" strokeDasharray="4 4" />
            <circle cx={hx} cy={pts[hover][1]} r="7" fill="#fff" stroke="#0B5FFF" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="chart-tip" style={{ left: tipLeft, top: M.top + 174, width: tipW }}>
          <div className="tip-head"><strong>{chartRanges[hover]}</strong><span>All Balances (IDR)</span></div>
          <div className="tip-row"><span><i />Closing Balance</span><b>IDR {fmt(chartValues[hover])}</b></div>
        </div>
      )}
      <div className="legend"><span><i />Closing Balance</span></div>
    </div>
  );
}
