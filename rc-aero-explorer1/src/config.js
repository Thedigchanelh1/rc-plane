// EDIT ME. Default aircraft, built from the hand-drawn schematic. Everything is in millimetres / grams.
// To edit visually, open the site with ?edit at the end of the address (e.g. localhost:5173/?edit), then "Copy JSON" and paste here.
//
// pos  = [x, y, z]   x: +nose / -tail,  y: up (y = 0 is the top of the fuselage),  z: +right wing
// dims = size (labels per kind are in DIM_LABELS).
// mirror: also draw the part at -z.  internal: only visible in X-ray.  shell: fades in X-ray.
// The wing `pos` is its QUARTER-CHORD point (the aircraft pitches about it; CG is measured against it).

// Fuselage side/top profile from the schematic (xf = mm back from the nose tip; y = mm below the top line).
export const FUSE = {
  L: 460, H: 75, W: 30,
  top: [[0, -35], [65, -25], [85, 0], [460, 0]],            // nose cut-out: 25 mm drop for 65 mm, ramp over 20 mm
  bot: [[0, -70], [70, -75], [170, -75], [460, -15]],       // 75 mm deep bay (70 + 100 mm), tapering to 15 mm at the tail
  hw: [[0, 6], [70, 15], [170, 15], [460, 6]],              // half-width: 12 mm nose -> 30 mm; tail taper is an assumption
}
export const interp = (pts, x) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1)
  }
  return pts[pts.length - 1][1]
}

const WHITE = '#eef1f7', TAPE = '#d9822f', DARK = '#2b3140'
export const DEFAULT_PARTS = [
  { id: 'fuselage', name: 'Fuselage', kind: 'fuselage', shell: true, color: WHITE, pos: [20, 0, 0], dims: [460, 75, 30] },
  { id: 'wing', name: 'Main Wing', kind: 'wing', shell: true, color: TAPE, pos: [131, 4, 0], dims: [115, 0, 660] },
  { id: 'aileron', name: 'Aileron', kind: 'box', color: WHITE, mirror: true, pos: [55, 4, 235], dims: [20, 3, 150] },
  { id: 'ailservo', name: 'Aileron Servo', kind: 'box', color: DARK, mirror: true, pos: [100, -8, 125], dims: [23, 12, 22] },
  { id: 'hstab', name: 'Horizontal Stabiliser', kind: 'planform', shell: true, color: WHITE, pos: [-172, 2, 0], dims: [75, 3, 200, 50] },
  { id: 'elevator', name: 'Elevator', kind: 'box', color: '#f6d9b8', pos: [-200, 4, 0], dims: [20, 2.5, 200] },
  { id: 'vstab', name: 'Vertical Fin', kind: 'box', shell: true, color: WHITE, pos: [-170, 39, 0], dims: [40, 70, 3] },
  { id: 'rudder', name: 'Rudder', kind: 'box', color: '#f6d9b8', pos: [-200, 39, 0], dims: [20, 70, 3] },
  { id: 'elevservo', name: 'Elevator Servo', kind: 'box', color: DARK, pos: [-25, 0, 6.5], dims: [23, 22, 12] },
  { id: 'rudservo', name: 'Rudder Servo', kind: 'box', color: DARK, pos: [-25, 0, -6.5], dims: [23, 22, 12] },
  { id: 'motor', name: 'Motor', kind: 'cyl', color: '#8a93a6', pos: [262, -52, 0], dims: [25, 11] },
  { id: 'propeller', name: 'Propeller', kind: 'prop', color: '#1f2430', pos: [276, -52, 0], dims: [152] },
  { id: 'esc', name: 'ESC', kind: 'box', internal: true, color: '#2ea8ff', pos: [215, -50, 0], dims: [30, 10, 14] },
  { id: 'battery', name: 'Battery', kind: 'box', internal: true, color: '#2ea8ff', pos: [150, -45, 0], dims: [60, 28, 18] },
  { id: 'receiver', name: 'Receiver', kind: 'box', internal: true, color: '#9aa7bd', pos: [60, -25, 0], dims: [30, 8, 18] },
  { id: 'ballast', name: 'Ballast Weight', kind: 'box', color: '#aeb6c6', pos: [0, 3, 0], dims: [20, 6, 20] },
  { id: 'wheel', name: 'Wheel', kind: 'wheel', color: '#15181f', mirror: true, pos: [175, -78, 24], dims: [8, 17] },
]
export const DIM_LABELS = {
  fuselage: ['Length', 'Depth', 'Width'], wing: ['Chord', null, 'Span'], planform: ['Root chord', 'Thickness', 'Span', 'Tip chord'],
  box: ['X length', 'Y height', 'Z width'], cyl: ['Length', 'Radius'], wheel: ['Width', 'Radius'], prop: ['Diameter'],
}
