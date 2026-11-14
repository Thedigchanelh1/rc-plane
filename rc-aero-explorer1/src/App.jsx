import { useEffect, useMemo, useState } from 'react'
import Viewer from './Viewer.jsx'
import Controls from './Controls.jsx'
import Editor from './Editor.jsx'
import { DEFAULT_PARTS } from './config.js'
import { SOLVER, analyze } from './physics.js'
import { INTRO, PUSHRODS, infoFor } from './info.js'
import { getWind } from './wind.js'

const EDIT = typeof location !== 'undefined' && new URLSearchParams(location.search).has('edit')
const KEY = 'rc-parts-v3'
const load = () => { if (!EDIT) return DEFAULT_PARTS; try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULT_PARTS } catch { return DEFAULT_PARTS } }
const CRUISE = 7   // assumed forward speed (m/s) added to the wind for the airflow animation

export default function App() {
  const [parts, setParts] = useState(load)
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [aoa, setAoa] = useState(5)
  const [wind, setWind] = useState(null)
  const [useLive, setUseLive] = useState(true)
  const [manual, setManual] = useState(4)
  const [view, setView] = useState({ name: 'Perspective', n: 0 })
  const [opts, setOpts] = useState({ flow: true, xray: false })

  const windSpeed = useLive ? wind?.speed ?? 3 : manual
  const airspeed = windSpeed + CRUISE
  const flow = useMemo(() => SOLVER.lines(aoa), [aoa])
  const m = useMemo(() => analyze(parts, aoa), [parts, aoa])
  const all = useMemo(() => [...parts, PUSHRODS], [parts])

  useEffect(() => { if (EDIT) try { localStorage.setItem(KEY, JSON.stringify(parts)) } catch {} }, [parts])
  useEffect(() => {
    const go = () => getWind().then(setWind)
    go(); const id = setInterval(go, 600000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => { document.body.style.cursor = hovered ? 'pointer' : 'auto' }, [hovered])

  const select = (id) => {
    setSelected(id)
    if (id && parts.find((p) => p.id === id)?.internal) setOpts((o) => ({ ...o, xray: true }))   // reveal hidden parts
  }
  const patch = (id, change) => setParts((ps) => ps.map((p) => (p.id === id ? { ...p, ...change } : p)))
  const reset = () => { setParts(DEFAULT_PARTS); setSelected(null) }

  const active = all.find((p) => p.id === (hovered ?? selected))
  const info = active ? infoFor(active) : null

  return (
    <div className="grid-bg relative h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Viewer {...{ parts, flow, aoa, airspeed, view, opts, hovered, selected }} onHover={setHovered} onSelect={select} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-3 p-4 sm:p-6 md:bottom-44 md:flex-row md:justify-between">
        <div className="pointer-events-none md:w-56">
          <h1 className="text-xl font-light tracking-tight sm:text-2xl">How our RC plane flies</h1>
          {!EDIT && (
            <ul className="pointer-events-auto mt-3 flex gap-1 overflow-x-auto pb-1 md:mt-6 md:block md:space-y-0.5 md:overflow-y-auto md:pb-0 md:max-h-[calc(100%-5rem)]">
              {all.map((p) => (
                <li key={p.id} className="shrink-0">
                  <button onClick={() => select(p.id)} onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}
                    className={`whitespace-nowrap px-2 py-1 text-sm transition ${active?.id === p.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}>{p.name}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="glass pointer-events-none max-h-[34vh] self-start overflow-y-auto p-5 md:max-h-full md:w-[380px]">
          {info ? (
            <><h2 className="text-xl font-light">{active.name}</h2><div className="mt-1 text-sm text-amber">{info.role}</div><p className="mt-3 text-sm leading-relaxed text-white/75">{info.text}</p></>
          ) : (
            <><h2 className="text-xl font-light">{INTRO.title}</h2><div className="mt-1 text-sm text-amber">{INTRO.role}</div><p className="mt-3 text-sm leading-relaxed text-white/75">{INTRO.text}</p></>
          )}
        </div>
      </div>

      {EDIT && <Editor {...{ parts, selected, setSelected: select, patch, reset }} />}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <Controls {...{ aoa, setAoa, m, wind, useLive, setUseLive, manual, setManual, opts, setOpts, view, setView }} />
      </div>
    </div>
  )
}
