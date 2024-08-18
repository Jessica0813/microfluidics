export function useElementInView(viewPort: HTMLElement | null, target: HTMLElement) {
  if (viewPort === null) {
    return false
  }

  const { left, top, right, bottom } = viewPort.getBoundingClientRect()

  const x = target.getBoundingClientRect()
  const targetLeft = x.left
  const targetTop = x.top
  const targetRight = x.right
  const targetBottom = x.bottom

  return targetRight > left && targetBottom > top && targetLeft < right && targetTop < bottom
}
