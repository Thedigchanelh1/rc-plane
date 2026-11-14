import { DIM_LABELS } from './config.js'

const Num = ({ label, value, set }) => (
  <label className="block">
    <div className="mb-1 text-[11px] text-white/40">{label}</div>
    <input type="number" step="0.5" value={value}
      onChange={(e) => { const n = parseFloat(e.target.value); if (!Number.isNaN(n)) set(n) }}
      className="w-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-sm text-white outline-none focus:border-volt" />
  </label>
)

// Only shown when the site is opened with ?edit. Not visible to normal visitors.
export default function Editor({ parts, selected, setSelected, patch, reset }) {
  const sel = parts.find((x) => x.id === selected)
  return (
    <div className="glass absolute left-4 top-16 z-20 max-h-[55vh] w-72 space-y-3 overflow-y-auto p-4">
      <div className="text-xs text-amber">Edit mode (mm, x + nose / − tail, y up, z + right)</div>
      <div className="flex flex-wrap gap-1">
        {parts.map((x) => (
          <button key={x.id} onClick={() => setSelected(x.id)} className={`px-2 py-1 text-xs ${selected === x.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>{x.name}</button>
        ))}
      </div>
      {sel && (
        <div className="space-y-2 border-l-2 border-amber pl-3">
          <input value={sel.name} onChange={(e) => patch(sel.id, { name: e.target.value })}
            className="w-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-volt" />
          <div className="grid grid-cols-3 gap-2">
            {['X', 'Y', 'Z'].map((a, i) => <Num key={a} label={a} value={sel.pos[i]} set={(v) => patch(sel.id, { pos: sel.pos.map((o, j) => (j === i ? v : o)) })} />)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DIM_LABELS[sel.kind].map((l, i) => l && <Num key={l} label={l} value={sel.dims[i]} set={(v) => patch(sel.id, { dims: sel.dims.map((o, j) => (j === i ? v : o)) })} />)}
          </div>
        </div>
      )}
      <div className="flex gap-4 text-xs">
        <button onClick={reset} className="text-white/50 hover:text-amber">Reset</button>
        <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(parts, null, 2))} className="text-white/50 hover:text-volt">Copy JSON (paste into config.js)</button>
      </div>
    </div>
  )
}
