import { flip, shift, computePosition, offset } from '@floating-ui/vue'

export function useMenuPositionCalculator(
  targetRef: HTMLElement | null,
  floatingRef: HTMLElement | null
) {
  if (!targetRef || !floatingRef) {
    return
  }

  try {
    computePosition(targetRef, floatingRef, {
      placement: 'top',
      middleware: [offset(30), flip(), shift()]
    }).then((pos) => {
      Object.assign(floatingRef.style, {
        left: `${pos.x}px`,
        top: `${pos.y}px`
      })
    })
  } catch (error) {
    console.error('Error calculating position:', error)
  }
}
