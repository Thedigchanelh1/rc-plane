// Physics engine (runs in the browser): potential flow around a Joukowski airfoil + a finite-wing lift/drag model.
const E = 0.85, A0 = 2 * Math.PI, CL_MAX = 1.2, CD0 = 0.045
const D2R = Math.PI / 180

// ---- tiny complex-number helpers: [re, im]
const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const div = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d] }
const abs = (a) => Math.hypot(a[0], a[1])
const exp = (t) => [Math.cos(t), Math.sin(t)]
const scale = (a, s) => [a[0] * s, a[1] * s]
const sqrt = (z) => { const r = abs(z); return [Math.sqrt((r + z[0]) / 2), (z[1] < 0 ? -1 : 1) * Math.sqrt(Math.max(0, (r - z[0]) / 2))] }

const YS = [-.7, -.5, -.35, -.25, -.18, -.12, -.08, -.05, -.025, 0, .025, .05, .08, .12, .18, .25, .35, .5, .7]

// m = thickness, n = camber of the Joukowski circle offset. Flow: free stream 1, Kutta condition at the trailing edge.
export function makeSolver(m = 0.05, n = 0.025) {
  const B = 1, C0 = [-m, n], A = abs(sub([B, 0], C0))
  const zs = Array.from({ length: 120 }, (_, k) => {
    const zeta = add(C0, scale(exp((2 * Math.PI * k) / 120), A))
    return add(zeta, div([1, 0], zeta))
  })
  const xs = zs.map((z) => z[0])
  const chord = Math.max(...xs) - Math.min(...xs)
  const XQ = Math.min(...xs) + 0.25 * chord
  const YQ = zs.reduce((s, z) => s + z[1], 0) / zs.length
  const airfoil = zs.map((z) => [+((z[0] - XQ) / chord).toFixed(4), +((z[1] - YQ) / chord).toFixed(4)])
  const alphaL0 = Math.atan2(-n, 1 + m)          // zero-lift angle (rad): camber makes it negative

  const inv = (z) => {
    const s = sqrt(sub(mul(z, z), [4 * B * B, 0]))
    const z1 = scale(add(z, s), 0.5), z2 = scale(sub(z, s), 0.5)
    return abs(sub(z1, C0)) >= abs(sub(z2, C0)) ? z1 : z2
  }
  const gamma = (al) => {
    const z1 = sub([B, 0], C0)
    const t = scale(sub(mul(z1, exp(-al)), div(scale(exp(al), A * A), z1)), -1)
    return 2 * Math.PI * t[1]
  }
  const vel = (z, al, g) => {
    const zeta = inv(z), zp = sub(zeta, C0)
    let dw = sub(exp(-al), div(scale(exp(al), A * A), mul(zp, zp)))
    dw = add(dw, div([0, g / (2 * Math.PI)], zp))
    const w = div(dw, sub([1, 0], div([B * B, 0], mul(zeta, zeta))))
    return [w[0], -w[1]]
  }
  const dir = (z, al, g) => { const v = vel(z, al, g), s = abs(v); return s > 1e-9 ? scale(v, 1 / s) : [1, 0] }

  // Streamlines in the wind frame: chord = 1, quarter chord at the origin, wind along +x, leading edge toward -x.
  function lines(alphaDeg, h = 0.02, xStart = -1.5, xEnd = 2.5) {
    const al = alphaDeg * D2R, g = gamma(al), out = []
    const toWind = (z) => mul([(z[0] - XQ) / chord, (z[1] - YQ) / chord], exp(-al))
    for (const y0 of YS) {
      let z = add(scale(mul([xStart, y0], exp(al)), chord), [XQ, YQ])
      const pts = [], v = []
      for (let i = 0; i < 400; i++) {
        const w = toWind(z)
        if (abs(sub(inv(z), C0)) < A * 1.003 || w[0] > xEnd) break
        pts.push([+w[0].toFixed(4), +w[1].toFixed(4)]); v.push(+abs(vel(z, al, g)).toFixed(3))
        const d = h * chord
        const k1 = dir(z, al, g), k2 = dir(add(z, scale(k1, d / 2)), al, g)
        const k3 = dir(add(z, scale(k2, d / 2)), al, g), k4 = dir(add(z, scale(k3, d)), al, g)
        z = add(z, scale(add(add(k1, scale(k2, 2)), add(scale(k3, 2), k4)), d / 6))
      }
      if (pts.length > 5) out.push({ pts, v })
    }
    return { lines: out, step: h }
  }
  return { airfoil, alphaL0, gamma, lines }
}
export const SOLVER = makeSolver()

// ---- lift / drag indicators for the wing (shown as simple meters, no absolute numbers)
export function analyze(parts, aoaDeg) {
  const wing = parts.find((p) => p.kind === 'wing')
  const AR = wing.dims[2] / wing.dims[0]
  const a = A0 / (1 + A0 / (Math.PI * E * AR))
  const al0 = SOLVER.alphaL0
  const stallDeg = CL_MAX / a / D2R + al0 / D2R
  const stalled = aoaDeg > stallDeg
  let CL = a * (aoaDeg * D2R - al0)
  if (stalled) CL = Math.max(0.5, CL_MAX - 0.06 * (aoaDeg - stallDeg))
  CL = Math.max(CL, -CL_MAX)
  const CD = CD0 + CL * CL / (Math.PI * E * AR) + (stalled ? 0.02 * (aoaDeg - stallDeg) : 0)
  const clamp = (v) => Math.max(0, Math.min(100, v))
  return { CL, CD, stalled, stallDeg, liftPct: clamp((CL / CL_MAX) * 100), dragPct: clamp(((CD - CD0) / 0.25) * 100) }
}
