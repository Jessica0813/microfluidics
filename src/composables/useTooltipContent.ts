import type { FlowControlProcess } from '@/types/node'

export function useTooltipContent(process: FlowControlProcess) {
  if (process && (process.injection === '' || process.injection === 'Pump')) {
    return `
        <p  style="font-size: 10px">
        <strong>${process.injection}</strong>
        <strong>${process.fluid ? process.fluid.name : 'Fluid'}</strong> into <strong>${process.inlet}</strong> at
        <strong>${process.pressure}</strong> pressure for
        <strong>${process.startTime} - ${process.endTime}s</strong></p>
          `
  } else if (process && process.injection === 'Needle') {
    return `
        <p  style="font-size: 10px">
        <strong>Inject</strong>
        <strong>${process.fluid ? process.fluid.name : 'Fluid'}</strong> into <strong>${process.inlet}</strong> at a
        rate of <strong>${process.flowrate}</strong> for
        <strong>${process.startTime} - ${process.endTime}s</strong></p>
          `
  }
  return ''
}
