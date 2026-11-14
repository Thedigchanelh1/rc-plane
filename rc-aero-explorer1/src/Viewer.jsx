import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Aircraft from './Aircraft.jsx'
import Wind from './Wind.jsx'
import { SOLVER } from './physics.js'

const SC = 0.01
export const VIEWS = { Perspective: [4.8, 2.7, 7], Side: [0, 0.4, 11], Top: [0, 12, 0.001], Front: [11, 0.4, 0] }

function Rig({ view }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const active = useRef(false)
  useEffect(() => { active.current = view.n > 0 }, [view])
  useFrame((_, dt) => {
    if (!active.current || !controls) return
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 4.5), g = VIEWS[view.name]
    const p = camera.position
    p.x += (g[0] - p.x) * k; p.y += (g[1] - p.y) * k; p.z += (g[2] - p.z) * k
    controls.target.lerp({ x: 0, y: -0.2, z: 0 }, k)
    controls.update()
    if (Math.abs(g[0] - p.x) + Math.abs(g[1] - p.y) + Math.abs(g[2] - p.z) < 0.02) active.current = false
  })
  return null
}

export default function Viewer({ parts, flow, aoa, airspeed, view, opts, hovered, selected, onHover, onSelect }) {
  const wing = parts.find((p) => p.kind === 'wing')
  const [px, py] = wing.pos
  return (
    <Canvas dpr={[1, 2]} onPointerMissed={() => onSelect(null)}>
      <PerspectiveCamera makeDefault position={VIEWS.Perspective} fov={38} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} />
      <directionalLight position={[-6, 3, -5]} intensity={0.5} color="#2ea8ff" />
      <gridHelper args={[30, 60, '#1d4a80', '#12223d']} position={[0, -1.15, 0]} />
      {/* mm space. The aircraft pitches nose-up about the wing quarter-chord while the wind stays horizontal, blowing toward -x. */}
      <group scale={SC}>
        <group position={[px, py, 0]} rotation={[0, 0, (aoa * Math.PI) / 180]}>
          <group position={[-px, -py, 0]}>
            <Aircraft parts={parts} airfoil={SOLVER.airfoil} hovered={hovered} selected={selected} xray={opts.xray}
              spin={Math.max(airspeed, 2) * 4} onHover={onHover} onSelect={onSelect} />
          </group>
        </group>
      </group>
      {opts.flow && <Wind flow={flow} wing={wing} speed={airspeed} />}
      <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={24} />
      <Rig view={view} />
    </Canvas>
  )
}
