import type { ZoomBehavior } from 'd3-zoom'
import type { Selection } from 'd3-selection'

export type D3Zoom = ZoomBehavior<HTMLElement, unknown>
export type D3Selection = Selection<HTMLElement, any, any, any>
export type Transform = {x: number, y: number, k: number}
