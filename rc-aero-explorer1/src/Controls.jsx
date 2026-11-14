const compass = (d) => ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round(d / 45) % 8]

function Meter({ label, pct, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-white/60"><span>{label}</span></div>
      <div className="h-1.5 w-full bg-white/10"><div className={`h-1.5 transition-[width] duration-300 ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}
const Toggle = ({ label, v, set }) => (
  <button onClick={() => set(!v)} className={`px-3 py-1.5 text-xs transition ${v ? 'bg-volt/20 text-white' : 'text-white/50 hover:text-white'}`}>{label}</button>
)

function status(m) {
  if (m.stalled) return ['Too steep: the air can’t follow the wing, so lift drops. This is a stall.', 'text-amber']
  if (m.liftPct < 8) return ['Not tilted enough: the wing makes almost no lift.', 'text-white/60']
  if (m.liftPct > 80) return ['Maximum lift, right on the edge of a stall.', 'text-amber']
  return ['Smooth airflow and good lift.', 'text-volt']
}

export default function Controls({ aoa, setAoa, m, wind, useLive, setUseLive, manual, setManual, opts, setOpts, view, setView }) {
  const [msg, tone] = status(m)
  return (
    <div className="glass mx-auto w-full max-w-5xl p-4 sm:p-5">
      <div className="grid gap-5 md:grid-cols-[1.5fr_1fr_1fr] md:gap-8">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-white/70">Wing tilt</span>
            <span className="text-2xl font-light tabular-nums">{aoa}°</span>
          </div>
          <input type="range" min={-5} max={20} step={0.5} value={aoa} onChange={(e) => setAoa(+e.target.value)} className="my-2 w-full accent-volt" />
          <p className={`text-sm ${tone}`}>{msg}</p>
        </div>

        <div className="space-y-3">
          <Meter label="Lift" pct={m.liftPct} color="bg-volt" />
          <Meter label="Air resistance (drag)" pct={m.dragPct} color="bg-amber" />
        </div>

        <div>
          <div className="text-sm text-white/70">Wind in Bengaluru now</div>
          <div className="text-2xl font-light tabular-nums">{wind ? (useLive ? wind.speed : manual) : '…'}<span className="ml-1 text-sm text-white/40">m/s</span></div>
          <div className="text-xs leading-relaxed text-white/45">
            {useLive
              ? wind?.live ? <>from the {compass(wind.direction)}{wind.time && ` · updated ${wind.time.slice(11)}`}</> : 'Live data unavailable right now'
              : 'Set by you'}
            {' · '}<button onClick={() => setUseLive(!useLive)} className="underline decoration-white/30 hover:text-white">{useLive ? 'Adjust' : 'Use live wind'}</button>
          </div>
          {!useLive && <input type="range" min={0} max={20} step={0.5} value={manual} onChange={(e) => setManual(+e.target.value)} className="mt-2 w-full accent-volt" />}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <div className="flex">
          <Toggle label="Show airflow" v={opts.flow} set={(v) => setOpts({ ...opts, flow: v })} />
          <Toggle label="See inside" v={opts.xray} set={(v) => setOpts({ ...opts, xray: v })} />
        </div>
        <div className="flex">
          {['Angled', 'Side', 'Top', 'Front'].map((n) => (
            <button key={n} onClick={() => setView({ name: n === 'Angled' ? 'Perspective' : n, n: Date.now() })}
              className={`px-3 py-1.5 text-xs transition ${view.name === (n === 'Angled' ? 'Perspective' : n) ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
