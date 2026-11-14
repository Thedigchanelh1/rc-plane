import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FUSE, interp } from './config.js'

// ---------- geometry builders (all in mm; the whole aircraft sits inside a 0.01-scaled group)
function Fuselage({ dims }) {
  const geo = useMemo(() => {
    const ls = dims[0] / FUSE.L, hs = dims[1] / FUSE.H, ws = dims[2] / FUSE.W
    const xs = [...new Set([...FUSE.top, ...FUSE.bot, ...FUSE.hw].map((q) => q[0]))].sort((a, b) => a - b)
    const st = xs.map((xf) => ({ x: (FUSE.L / 2 - xf) * ls, yt: interp(FUSE.top, xf) * hs, yb: interp(FUSE.bot, xf) * hs, w: interp(FUSE.hw, xf) * ws }))
    const out = []
    const tri = (a, b, c, h) => {
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
      if (n[0] * h[0] + n[1] * h[1] + n[2] * h[2] < 0) [b, c] = [c, b]
      out.push(...a, ...b, ...c)
    }
    const quad = (a, b, c, d, h) => { tri(a, b, c, h); tri(a, c, d, h) }
    for (let i = 0; i < st.length - 1; i++) {
      const s = st[i], t = st[i + 1]
      quad([s.x, s.yt, s.w], [s.x, s.yt, -s.w], [t.x, t.yt, -t.w], [t.x, t.yt, t.w], [0, 1, 0])
      quad([s.x, s.yb, s.w], [s.x, s.yb, -s.w], [t.x, t.yb, -t.w], [t.x, t.yb, t.w], [0, -1, 0])
      quad([s.x, s.yt, s.w], [s.x, s.yb, s.w], [t.x, t.yb, t.w], [t.x, t.yt, t.w], [0, 0, 1])
      quad([s.x, s.yt, -s.w], [s.x, s.yb, -s.w], [t.x, t.yb, -t.w], [t.x, t.yt, -t.w], [0, 0, -1])
    }
    const a = st[0], z = st[st.length - 1]
    quad([a.x, a.yt, a.w], [a.x, a.yt, -a.w], [a.x, a.yb, -a.w], [a.x, a.yb, a.w], [1, 0, 0])
    quad([z.x, z.yt, z.w], [z.x, z.yt, -z.w], [z.x, z.yb, -z.w], [z.x, z.yb, z.w], [-1, 0, 0])
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3))
    g.computeVertexNormals()
    return g
  }, [dims[0], dims[1], dims[2]])
  return <primitive object={geo} attach="geometry" />
}

// Airfoil section (from the physics engine) extruded along the span. Streamline x runs LE -> TE and the nose is +x, so x is mirrored.
function Wing({ airfoil, dims }) {
  const geo = useMemo(() => {
    const [c, , span] = dims
    const s = new THREE.Shape()
    airfoil.forEach(([x, y], i) => (i ? s.lineTo(-x * c, y * c) : s.moveTo(-x * c, y * c)))
    const g = new THREE.ExtrudeGeometry(s, { depth: span, bevelEnabled: false })
    g.translate(0, 0, -span / 2); g.computeVertexNormals()
    return g
  }, [airfoil, dims[0], dims[2]])
  return <primitive object={geo} attach="geometry" />
}

function Planform({ dims }) {
  const geo = useMemo(() => {
    const [r, t, s, tip] = dims
    const sh = new THREE.Shape()
    ;[[-r / 2, -s / 2], [-r / 2, s / 2], [-r / 2 + tip, s / 2], [r / 2, 0], [-r / 2 + tip, -s / 2]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)))
    const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false })
    g.rotateX(-Math.PI / 2); g.translate(0, -t / 2, 0); g.computeVertexNormals()
    return g
  }, [dims[0], dims[1], dims[2], dims[3]])
  return <primitive object={geo} attach="geometry" />
}

function Shape({ p, airfoil }) {
  const [a, b, c] = p.dims
  switch (p.kind) {
    case 'fuselage': return <Fuselage dims={p.dims} />
    case 'wing': return <Wing airfoil={airfoil} dims={p.dims} />
    case 'planform': return <Planform dims={p.dims} />
    case 'cyl': return <cylinderGeometry args={[b, b, a, 28]} />
    case 'wheel': return <cylinderGeometry args={[b, b, a, 28]} />
    case 'prop': return <boxGeometry args={[2, 8, a]} />
    default: return <boxGeometry args={[a, b, c]} />
  }
}
const rotationOf = (k) => (k === 'cyl' ? [0, 0, Math.PI / 2] : k === 'wheel' ? [Math.PI / 2, 0, 0] : [0, 0, 0])

function PartMesh({ p, side, airfoil, hovered, selected, xray, spin, onHover, onSelect }) {
  const ref = useRef()
  useFrame((_, dt) => { if (p.kind === 'prop' && ref.current) ref.current.rotation.x += dt * spin })
  const hidden = p.internal && !xray
  const faded = p.shell && xray            // shells let the pointer through in X-ray so internals can be hovered
  const live = !hidden && !faded
  const glow = selected ? '#ff8a1f' : hovered ? '#2ea8ff' : '#000000'
  return (
    <group position={[p.pos[0], p.pos[1], p.pos[2] * side]} visible={!hidden}>
      <mesh ref={ref} rotation={rotationOf(p.kind)}
        onPointerOver={(e) => { if (live) { e.stopPropagation(); onHover(p.id) } }}
        onPointerOut={() => { if (live) onHover(null) }}
        onClick={(e) => { if (live) { e.stopPropagation(); onSelect(p.id) } }}>
        <Shape p={p} airfoil={airfoil} />
        <meshStandardMaterial color={p.color} transparent opacity={faded ? 0.2 : 1} metalness={0.15} roughness={0.6}
          side={THREE.DoubleSide} emissive={glow} emissiveIntensity={selected ? 0.55 : 0.45} />
      </mesh>
    </group>
  )
}

// Thin steel wires that carry servo movement to the elevator and rudder; ends follow the servo / surface positions.
function Rod({ a, b, active, onHover, onSelect }) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A)
    return { pos: A.clone().add(B).multiplyScalar(0.5), len: d.length(), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()) }
  }, [a.join(), b.join()])
  return (
    <mesh position={pos} quaternion={quat}
      onPointerOver={(e) => { e.stopPropagation(); onHover('pushrods') }} onPointerOut={() => onHover(null)}
      onClick={(e) => { e.stopPropagation(); onSelect('pushrods') }}>
      <cylinderGeometry args={[1.3, 1.3, len, 8]} />
      <meshStandardMaterial color={active ? '#2ea8ff' : '#c9d0dd'} emissive={active ? '#2ea8ff' : '#000000'} emissiveIntensity={0.5} metalness={0.6} roughness={0.35} />
    </mesh>
  )
}

function Wires({ parts, active, onHover, onSelect }) {
  const P = (id) => parts.find((p) => p.id === id)
  const es = P('elevservo'), rs = P('rudservo'), el = P('elevator'), ru = P('rudder')
  if (!es || !rs || !el || !ru) return null
  const arm = (s) => [s.pos[0] - s.dims[0] / 2 + 3, s.pos[1] + s.dims[1] / 2 + 1, s.pos[2]]
  return (
    <group>
      <Rod a={arm(es)} b={[el.pos[0] + 2, el.pos[1] + el.dims[1] / 2 + 7, es.pos[2] + 2]} active={active} onHover={onHover} onSelect={onSelect} />
      <Rod a={arm(rs)} b={[ru.pos[0] + 2, ru.pos[1] - 22, -4]} active={active} onHover={onHover} onSelect={onSelect} />
    </group>
  )
}

export default function Aircraft({ parts, airfoil, hovered, selected, xray, spin, onHover, onSelect }) {
  return (
    <group>
      {parts.flatMap((p) => (p.mirror ? [1, -1] : [1]).map((side) => (
        <PartMesh key={p.id + side} {...{ p, side, airfoil, xray, spin, onHover, onSelect }}
          hovered={hovered === p.id} selected={selected === p.id} />
      )))}
      <Wires parts={parts} active={hovered === 'pushrods' || selected === 'pushrods'} onHover={onHover} onSelect={onSelect} />
    </group>
  )
}
