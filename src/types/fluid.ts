export interface Fluid {
  id: string
  name: string
  color: string
  viscosity: number
  withParticle: 'Yes' | 'No'
  particleSize?: number
  particleDensity?: number
}
