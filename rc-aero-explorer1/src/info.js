// Plain-language explanations for every part. No measurements on purpose.
export const PUSHRODS = { id: 'pushrods', name: 'Control Wires' }

export const INTRO = {
  title: 'How does a plane fly?',
  role: 'Four forces, one wing',
  text: 'Every plane has four forces on it: lift pulls up, weight pulls down, thrust pushes forward and drag holds it back. The wing makes lift when air flows over it. Move the Wing tilt slider and watch the air bend around the wing. Then hover over or tap any part of the plane to see what it does.',
}

const INFO = {
  wing: ['Holds the plane up', 'As the plane moves forward, air flows over and under the wing. The wing is shaped and tilted so it pushes the air downward, and the air pushes the wing up. That push is called lift. A little tilt gives more lift. Tilt it too far and the air can no longer follow the wing, so lift suddenly drops. Pilots call that a stall.'],
  aileron: ['Makes the plane roll', 'Ailerons are the hinged flaps at the back edge of each wing. They always move in opposite directions. The flap that goes down gives its wing more lift and the flap that goes up gives its wing less, so the plane tilts to one side. That tilt is how the plane starts a turn.'],
  ailservo: ['Moves the ailerons', 'A servo is a tiny motor that moves a flap exactly where the pilot asks. These two sit under the wings, so the top surface of the wing, which makes most of the lift, stays smooth.'],
  hstab: ['Keeps the nose steady', 'The horizontal stabiliser is a small wing at the tail. If a gust pushes the nose up, the tail meets the air at a different angle and gently pushes the nose back down. It works like the feathers on an arrow.'],
  elevator: ['Points the nose up or down', 'The elevator is the hinged flap on the back of the horizontal tail. Raising it pushes the tail down, so the nose rises and the plane climbs. Lowering it does the opposite and the plane descends.'],
  vstab: ['Keeps the plane pointing straight', 'The vertical fin works like a weather vane. If the nose swings sideways, the air pushes on the fin and swings it back in line with the wind.'],
  rudder: ['Turns the nose left or right', 'The rudder is the hinged flap on the fin. When it swings to one side, the air pushes the tail the other way, so the nose turns. Together with the ailerons it helps the plane make smooth, coordinated turns.'],
  elevservo: ['Moves the elevator', 'This servo sits on top of the body, just behind the wing, side by side with the rudder servo. A thin wire carries its movement back to the elevator.'],
  rudservo: ['Moves the rudder', 'This servo sits next to the elevator servo on top of the body. A thin wire carries its movement back to the rudder.'],
  pushrods: ['Link servos to the flaps', 'Thin steel wires run from each servo to a small arm on the flap it controls. When the servo turns, the wire pushes or pulls the arm and the flap moves.'],
  fuselage: ['The body of the plane', 'The fuselage holds every part together. Its slim, smooth shape lets air slide past with little resistance, and the long tail keeps the tail surfaces far from the wing, which gives them more leverage to steer the plane.'],
  motor: ['Pulls the plane forward', 'A small electric motor spins the propeller. The forward pull it creates is called thrust. The wing only makes lift when air is flowing over it, so thrust is what gets that air moving.'],
  propeller: ['Creates thrust', 'Each propeller blade is a tiny wing moving in a circle. It throws air backwards and the air pushes the plane forwards. That fast air also flows over the wing, which adds a little extra lift.'],
  esc: ['Controls the motor power', 'The electronic speed controller reads the pilot’s throttle and sends the right amount of battery power to the motor, like a gas pedal for an electric plane.'],
  battery: ['The power source', 'The battery stores the energy for the motor and servos. It is the heaviest part, so where it sits matters. Here it sits in the body under the wing, close to the plane’s balance point.'],
  receiver: ['Listens to the remote', 'The receiver picks up radio signals from the pilot’s controller and passes them on as commands to the servos and the motor.'],
  ballast: ['Helps the plane balance', 'A plane balances like a seesaw around a point called the centre of gravity, which should sit near the middle of the wing. The motor and battery are at the front, so this small square of metal behind the wing moves the balance point back. Too much weight at the front makes the plane dive, and too much at the back makes it wobbly.'],
  wheel: ['Rolling take-off and landing', 'The wheels let the plane roll along the ground to take off and land smoothly. In the air they stick out into the wind and add a little drag.'],
}

export function infoFor(p) {
  const i = INFO[p.id]
  return i ? { role: i[0], text: i[1] } : { role: p.name, text: 'A part of the plane.' }
}
