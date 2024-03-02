import type { Ref } from 'vue'
import { ref } from 'vue'

export interface DesignCanvasControl {
  isDesignCanvasVisible: Ref<boolean>
  designCanvasSize: Ref<'small' | 'large'>
  toggleDesignCanvasSize: () => void
  toggleDesignCanvasVisibility: () => void
}

export const defaultDesignCanvasControl: DesignCanvasControl = {
  isDesignCanvasVisible: ref(false),
  designCanvasSize: ref('small'),
  toggleDesignCanvasSize: () => {},
  toggleDesignCanvasVisibility: () => {}
}
