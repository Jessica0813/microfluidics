import { flip, shift, computePosition, offset } from '@floating-ui/vue'
interface Position {
  x: number
  y: number
}

export function useMenuPositionCalculator(
  targetRef: HTMLElement | null,
  floatingRef: HTMLElement | null
): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!targetRef || !floatingRef) {
      reject('Invalid target or floating element reference')
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
        resolve({ x: pos.x, y: pos.y })
      })
    } catch (error) {
      console.error('Error calculating position:', error)
      reject(error)
    }
  })
}
