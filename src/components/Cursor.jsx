import { useEffect, useRef } from 'react'
import '../styles/Cursor.sass'

// Anything that reacts to a click gets the glass lens. The ring takes
// kRingSettleMs to catch up, independent of frame rate
const kClickable =
  'a, button, [role="button"], [tabindex]:not([tabindex="-1"]), label, ' +
  '.tape-colorwheel-segment'
const kRingSettleMs = 180

////////////////////////////////////////////////////////////////////////////////
function Cursor() {
  const dot_ref = useRef(null)
  const ring_ref = useRef(null)

  // Touch and pens keep their own pointer
  useEffect(() => {
    const fine_pointer =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine_pointer) return

    const dot = dot_ref.current
    const ring = ring_ref.current
    const root = document.documentElement
    const target = { x: -100, y: -100 }
    const current = { x: -100, y: -100 }
    let frame_id = null
    let last = null
    let placed = false

    function Tick(now) {
      frame_id = null
      const dt = last === null ? 16 : now - last
      last = now
      const factor = 1 - Math.exp(-dt / (kRingSettleMs / 3))
      current.x += (target.x - current.x) * factor
      current.y += (target.y - current.y) * factor
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      const distance =
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y)
      if (distance > 0.1) frame_id = requestAnimationFrame(Tick)
      else last = null
    } //Tick

    function HandlePointerMove(event) {
      target.x = event.clientX
      target.y = event.clientY
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      if (!placed) {
        placed = true
        current.x = target.x
        current.y = target.y
        root.classList.add('has-cursor')
      }
      root.classList.add('is-cursor-visible')
      root.classList.toggle(
        'is-cursor-hover',
        Boolean(event.target.closest?.(kClickable))
      )
      if (frame_id === null) frame_id = requestAnimationFrame(Tick)
    } //HandlePointerMove

    function HandleLeave(event) {
      if (!event.relatedTarget) root.classList.remove('is-cursor-visible')
    } //HandleLeave

    function Press() {
      root.classList.add('is-cursor-down')
    } //Press

    function Release() {
      root.classList.remove('is-cursor-down')
    } //Release

    window.addEventListener('pointermove', HandlePointerMove, { passive: true })
    window.addEventListener('pointerdown', Press)
    window.addEventListener('pointerup', Release)
    document.addEventListener('mouseout', HandleLeave)
    return () => {
      window.removeEventListener('pointermove', HandlePointerMove)
      window.removeEventListener('pointerdown', Press)
      window.removeEventListener('pointerup', Release)
      document.removeEventListener('mouseout', HandleLeave)
      if (frame_id !== null) cancelAnimationFrame(frame_id)
      root.classList.remove(
        'has-cursor',
        'is-cursor-visible',
        'is-cursor-hover',
        'is-cursor-down'
      )
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor-ring" ref={ring_ref}>
        <span className="cursor-lens" />
      </div>
      <div className="cursor-dot" ref={dot_ref}>
        <span />
      </div>
    </div>
  )
} //Cursor

export default Cursor
