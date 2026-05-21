import { ref, nextTick } from 'vue'

export function useDragSort(items, { onOrderChange } = {}) {
  const dragIndex = ref(-1)
  const isDragging = ref(false)
  let state = null

  function startDrag(e, index) {
    if (e.button !== 0 || e.target.closest('button')) return

    const el = e.currentTarget
    const rect = el.getBoundingClientRect()

    const overlay = el.cloneNode(true)
    overlay.classList.add('drag-overlay')
    Object.assign(overlay.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      translate: '0px 0px',
    })
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      overlay.classList.add('drag-overlay--lifted')
    })

    // Snapshot all card rects BEFORE drag starts (stable positions)
    const children = Array.from(el.parentElement.children)
    const rects = children.map(c => {
      const r = c.getBoundingClientRect()
      return { left: r.left, top: r.top, width: r.width, height: r.height }
    })

    state = {
      overlay,
      container: el.parentElement,
      currentIndex: index,
      originX: rect.left,
      originY: rect.top,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      swapping: false,
      swapCooldown: 0,
      rects,
    }

    dragIndex.value = index
    isDragging.value = true
    document.body.classList.add('is-dragging')

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
  }

  function onMove(e) {
    if (!state) return

    const dx = e.clientX - state.offsetX - state.originX
    const dy = e.clientY - state.offsetY - state.originY
    state.overlay.style.translate = `${dx}px ${dy}px`

    if (state.swapping || Date.now() < state.swapCooldown) return

    const target = getTargetIndex(e.clientX, e.clientY)
    if (target !== -1 && target !== state.currentIndex) {
      doSwap(target)
    }
  }

  function getTargetIndex(mx, my) {
    // Use stable rects (snapshotted positions), adjusted for current order
    // Re-read rects from DOM only for non-dragged, settled cards
    const children = state.container.children
    for (let i = 0; i < children.length; i++) {
      if (i === state.currentIndex) continue
      const el = children[i]
      // Skip cards that are mid-FLIP (have inline transform from TransitionGroup)
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (Math.abs(mx - cx) < r.width * 0.35 && Math.abs(my - cy) < r.height * 0.35) {
        return i
      }
    }
    return -1
  }

  async function doSwap(to) {
    state.swapping = true
    const from = state.currentIndex
    const [item] = items.value.splice(from, 1)
    items.value.splice(to, 0, item)
    state.currentIndex = to
    dragIndex.value = to
    await nextTick()
    // Cooldown: wait for FLIP animation to mostly complete before next swap
    state.swapCooldown = Date.now() + 280
    state.swapping = false
  }

  function onEnd() {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onEnd)
    document.body.classList.remove('is-dragging')
    if (!state) return

    const el = state.container.children[state.currentIndex]
    if (el) {
      const r = el.getBoundingClientRect()
      state.overlay.classList.add('drag-overlay--dropping')
      state.overlay.classList.remove('drag-overlay--lifted')
      state.overlay.style.translate = `${r.left - state.originX}px ${r.top - state.originY}px`
    }

    const overlay = state.overlay
    state = null
    setTimeout(() => {
      overlay.remove()
      dragIndex.value = -1
      isDragging.value = false
      onOrderChange?.()
    }, 380)
  }

  return { dragIndex, isDragging, startDrag }
}
