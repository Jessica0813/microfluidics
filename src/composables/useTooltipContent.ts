import type { FlowControlProcess } from '@/types/node'

export function useTooltipContent(process: FlowControlProcess) {
  if (process) {
    const { injection, inlet, fluid, pressure, startTime, endTime, flowrate, inletState } = process

    let injectionDetails = ''
    let stateDetails = ''

    if (injection === '' || injection === 'pump') {
      stateDetails =
        inletState === 'connect'
          ? `then <strong>connect</strong> <strong>${inlet}</strong> to air`
          : `then <strong>block</strong> <strong>${inlet}</strong> from air`

      injectionDetails = `
        <strong>Inject</strong> 
        <strong>${fluid ? fluid.name : 'fluid'}</strong> 
        into <strong>${inlet}</strong> with a 
        <strong>${injection}</strong> at 
        <strong>${pressure}</strong> psi for 
        <strong>${startTime} - ${endTime}</strong>s,
        <span style="font-size: 10px">${stateDetails}</span>
      `
    } else if (injection === 'needle') {
      injectionDetails = `
        <strong>Inject</strong> 
        <strong>${fluid ? fluid.name : 'fluid'}</strong> 
        into <strong>${inlet}</strong> with a 
        <strong>${injection}</strong> at 
        <strong>${flowrate}</strong> µL/min for 
        <strong>${startTime} - ${endTime}</strong>s,
        <span style="font-size: 10px">${stateDetails}</span>
      `
    }

    return `
      <span style="font-size: 10px">
        ${injectionDetails}
      </span>
    `
  }
  return ''
}
