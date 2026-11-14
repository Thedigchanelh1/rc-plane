import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const SC = 0.01
const SLOW = [0.18, 0.66, 1.0], FAST = [1.0, 0.54, 0.12]

// Particles ride the streamlines from the physics engine; their speed follows the local velocity ratio.
export default function Wind({ flow, wing, speed }) {
  const pts = useRef()
  const [chord, , span] = wing.dims
  const data = useMemo(() => {
    const zs = []
    for (let i = 0; i < 14; i++) {
      const z = -span * 0.47 + span * 0.94 * (i / 13)
      if (Math.abs(z) > 28) zs.push(z)               // skip the fuselage
    }
    const per = 5, N = flow.lines.length * zs.length * per
    const li = new Uint8Array(N), z = new Float32Array(N), idx = new Float32Array(N)
    let k = 0
    flow.lines.forEach((l, i) => zs.forEach((zz) => {
      for (let j = 0; j < per; j++) { li[k] = i; z[k] = zz; idx[k] = Math.random() * (l.pts.length - 1); k++ }
    }))
    return { N, li, z, idx, pos: new Float32Array(N * 3), col: new Float32Array(N * 3), id: Math.random() }
  }, [flow, span])

  useFrame((_, dt) => {
    if (!pts.current) return
    dt = Math.min(dt, 0.05)
    const { N, li, z, idx, pos, col } = data
    const S = 0.12 * Math.max(speed, 0.5)            // scene units per second, a slow-motion version of the real airspeed
    for (let k = 0; k < N; k++) {
      const l = flow.lines[li[k]], n = l.pts.length
      let i = idx[k]
      const i0 = Math.min(n - 2, Math.floor(i)), f = i - i0
      const a = l.pts[i0], b = l.pts[i0 + 1]
      const vr = l.v[i0] * (1 - f) + l.v[i0 + 1] * f
      i += (dt * S * vr) / (flow.step * chord * SC)
      idx[k] = i >= n - 1 ? 0 : i
      pos[k * 3] = (wing.pos[0] - (a[0] + (b[0] - a[0]) * f) * chord) * SC
      pos[k * 3 + 1] = (wing.pos[1] + (a[1] + (b[1] - a[1]) * f) * chord) * SC
      pos[k * 3 + 2] = z[k] * SC
      const t = Math.max(0, Math.min(1, (vr - 0.75) / 0.7))
      for (let c = 0; c < 3; c++) col[k * 3 + c] = SLOW[c] + (FAST[c] - SLOW[c]) * t
    }
    const g = pts.current.geometry
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true
  })

  return (
    <points ref={pts} key={data.id} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.pos} count={data.N} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={data.col} count={data.N} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.9} depthWrite={false} />
    </points>
  )
}
