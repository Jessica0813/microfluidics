import { flip, shift, computePosition, offset } from '@floating-ui/vue'
import { type Ref } from 'vue'

export function useMenuPositionCalculator(
  targetRef: Ref<HTMLElement | null>,
  floatingRef: Ref<HTMLElement | null>
) {
  if (!targetRef.value || !floatingRef.value) {
    return
  }

  try {
    computePosition(targetRef.value, floatingRef.value, {
      placement: 'right',
      middleware: [offset(5), flip(), shift()]
    }).then((pos) => {
      Object.assign(floatingRef.value!.style, {
        left: `${pos.x}px`,
        top: `${pos.y}px`
      })
    })
  } catch (error) {
    console.error('Error calculating position:', error)
  }
}
