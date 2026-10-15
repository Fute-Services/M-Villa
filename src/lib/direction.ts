import { Vector3 } from 'three'

const rad = (deg: number) => (deg * Math.PI) / 180

/** Direction for a tour yaw/pitch (degrees): yaw 0 looks at the front face, positive yaw turns right. */
export const directionFor = (yawDeg: number, pitchDeg: number) =>
  new Vector3(
    Math.sin(rad(yawDeg)) * Math.cos(rad(pitchDeg)),
    Math.sin(rad(pitchDeg)),
    -Math.cos(rad(yawDeg)) * Math.cos(rad(pitchDeg)),
  )
