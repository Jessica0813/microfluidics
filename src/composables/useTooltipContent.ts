import type { FlowControlProcess } from '@/types/flowControl'

export function useTooltipContent(process: FlowControlProcess) {
  if (process && (process.injection === '' || process.injection === 'pump')) {
    return `
        <p  style="font-size: 10px">
        <strong>${process.fluid}</strong> is injected into
        <strong>${process.inlet}</strong> using
        <strong>${process.injection}</strong> at a pressure of
        <strong>${process.pressure}</strong> between
        <strong>${process.startTime} - ${process.endTime}s</strong></p>
          `
  } else if (process && process.injection === 'needle') {
    return `
        <p  style="font-size: 10px">
        <strong>${process.fluid}</strong> is injected into
        <strong>${process.inlet}</strong> using
        <strong>${process.injection}</strong>  at a flowrate of
        <strong>${process.flowrate}</strong> from
        <strong>${process.startTime} - ${process.endTime}s</strong></p>
          `
  }
  return ''
}
