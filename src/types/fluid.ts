export interface Fluid {
  name: string
  color: string
  viscosity: number
  withParticle: 'Yes' | 'No'
  particleSize?: number
  particleDensity?: number
}
