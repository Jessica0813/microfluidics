export interface NodeExportModel {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
}

export interface EdgeExportModel {
  id: string
  type: string
  source: string
  target: string
  sourceHandle: string | undefined | null
  targetHandle: string | undefined | null
}
