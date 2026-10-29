import { useEffect, useRef } from 'react'

const kCell = 26
const kDotRadius = 1.1
const kBaseColor = '13, 13, 18'
const kBaseAlpha = 0.13
const kLensRadius = 200
const kLensGrowth = 2.2
const kWavePeriodMs = 6400
const kWaveWidth = 220
const kFallbackAccent = '47, 91, 255'

////////////////////////////////////////////////////////////////////////////////
function DotField() {
  const canvas_ref = useRef(null)

  useEffect(() => {
    const canvas = canvas_ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const base = document.createElement('canvas')
    const base_ctx = base.getContext('2d')
    const reduced_motion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cols = 0
    let rows = 0
    let dpr = 1
    let width = 0
    let height = 0
    const pointer = { x: -9999, y: -9999, active: false }
    const lens = { x: -9999, y: -9999, strength: 0 }
    const style = getComputedStyle(canvas)

    // --live-accent is a registered color, so mid-transition it reads as the
    // blended rgb() and the dots fade along with the CSS
    function ReadAccent() {
      const channels = style
        .getPropertyValue('--live-accent')
        .match(/[\d.]+/g)
      return channels ? channels.slice(0, 3).join(', ') : kFallbackAccent
    } //ReadAccent

    function DrawDot(target, c, r, radius, color, alpha) {
      target.fillStyle = `rgba(${color}, ${alpha})`
      target.beginPath()
      target.arc(
        c * kCell + kCell / 2,
        r * kCell + kCell / 2,
        radius,
        0,
        Math.PI * 2
      )
      target.fill()
    } //DrawDot

    function PaintBase() {
      base_ctx.clearRect(0, 0, width, height)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          DrawDot(base_ctx, c, r, kDotRadius, kBaseColor, kBaseAlpha)
        }
      }
    } //PaintBase

    function Resize() {
      const box = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = box.width
      height = box.height
      for (const target of [canvas, base]) {
        target.width = Math.round(width * dpr)
        target.height = Math.round(height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      base_ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(width / kCell)
      rows = Math.ceil(height / kCell)
      PaintBase()
    } //Resize

    let frame_id = null
    let running = false

    function Frame(now) {
      frame_id = null
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(base, 0, 0, width, height)

      const accent = ReadAccent()

      // A soft diagonal band that rolls across the grid, lifting the dots it
      // passes
      const span = width + height + kWaveWidth * 2
      const wave_at =
        ((now % kWavePeriodMs) / kWavePeriodMs) * span - kWaveWidth
      for (let r = 0; r < rows; r++) {
        const y = r * kCell + kCell / 2
        const c0 = Math.max(0, Math.floor((wave_at - kWaveWidth - y) / kCell))
        const c1 = Math.min(cols - 1, Math.ceil((wave_at - y) / kCell))
        for (let c = c0; c <= c1; c++) {
          const fade = 1 - (wave_at - (c * kCell + kCell / 2 + y)) / kWaveWidth
          if (fade <= 0 || fade > 1) continue
          DrawDot(ctx, c, r, kDotRadius + fade * 0.6, accent, 0.28 * fade)
        }
      }

      lens.x += (pointer.x - lens.x) * 0.18
      lens.y += (pointer.y - lens.y) * 0.18
      lens.strength += ((pointer.active ? 1 : 0) - lens.strength) * 0.08

      if (lens.strength > 0.01) {
        const c0 = Math.max(0, Math.floor((lens.x - kLensRadius) / kCell))
        const c1 = Math.min(
          cols - 1,
          Math.ceil((lens.x + kLensRadius) / kCell)
        )
        const r0 = Math.max(0, Math.floor((lens.y - kLensRadius) / kCell))
        const r1 = Math.min(
          rows - 1,
          Math.ceil((lens.y + kLensRadius) / kCell)
        )
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const dx = c * kCell + kCell / 2 - lens.x
            const dy = r * kCell + kCell / 2 - lens.y
            const falloff = 1 - Math.hypot(dx, dy) / kLensRadius
            if (falloff <= 0) continue
            const k = falloff * falloff * lens.strength
            DrawDot(ctx, c, r, kDotRadius + k * kLensGrowth, accent, k * 0.85)
          }
        }
      }

      if (running) frame_id = requestAnimationFrame(Frame)
    } //Frame

    function Start() {
      if (running || reduced_motion) return
      running = true
      frame_id = requestAnimationFrame(Frame)
    } //Start

    function Stop() {
      running = false
      if (frame_id !== null) cancelAnimationFrame(frame_id)
      frame_id = null
    } //Stop

    function HandlePointerMove(event) {
      const box = canvas.getBoundingClientRect()
      pointer.x = event.clientX - box.left
      pointer.y = event.clientY - box.top
      pointer.active =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= box.width &&
        pointer.y <= box.height
    } //HandlePointerMove

    Resize()
    if (reduced_motion) ctx.drawImage(base, 0, 0, width, height)

    const resize_observer = new ResizeObserver(() => {
      Resize()
      if (reduced_motion) ctx.drawImage(base, 0, 0, width, height)
    })
    resize_observer.observe(canvas)

    // Watch the parent: a fixed canvas always "intersects" the viewport
    const visibility_observer = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? Start() : Stop()
    )
    visibility_observer.observe(canvas.parentElement)

    window.addEventListener('pointermove', HandlePointerMove, { passive: true })

    return () => {
      Stop()
      resize_observer.disconnect()
      visibility_observer.disconnect()
      window.removeEventListener('pointermove', HandlePointerMove)
    }
  }, [])

  return <canvas ref={canvas_ref} className="dot-field" aria-hidden="true" />
} //DotField

export default DotField
