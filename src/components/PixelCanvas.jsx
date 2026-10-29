import { useEffect, useRef } from 'react'

const kFrameMs = 1000 / 60
const kMinSize = 0.5
const kMaxSize = 2

////////////////////////////////////////////////////////////////////////////////
function Random(min, max) {
  return Math.random() * (max - min) + min
} //Random

////////////////////////////////////////////////////////////////////////////////
function Appear(pixel) {
  pixel.idle = false
  if (pixel.counter <= pixel.delay) {
    pixel.counter += pixel.counter_step
    return false
  }
  if (pixel.size >= pixel.max_size) pixel.shimmer = true
  if (pixel.shimmer) {
    if (pixel.size >= pixel.max_size) pixel.reverse = true
    else if (pixel.size <= kMinSize) pixel.reverse = false
    pixel.size += pixel.reverse ? -pixel.speed : pixel.speed
  } else {
    pixel.size += pixel.size_step
  }
  return true
} //Appear

////////////////////////////////////////////////////////////////////////////////
function Disappear(pixel) {
  pixel.shimmer = false
  pixel.counter = 0
  pixel.size -= 0.1
  if (pixel.size <= 0) {
    pixel.size = 0
    pixel.idle = true
    return false
  }
  return true
} //Disappear

////////////////////////////////////////////////////////////////////////////////
function PixelCanvas({ active, colors, gap = 5, speed = 35 }) {
  const canvas_ref = useRef(null)
  const run_ref = useRef(null)

  useEffect(() => {
    const canvas = canvas_ref.current
    const ctx = canvas.getContext('2d')
    const reduced_motion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pixel_speed = reduced_motion
      ? 0
      : Math.min(Math.max(speed, 0), 100) * 0.001
    const pixel_gap = Math.min(Math.max(gap, 4), 50)

    let width = 0
    let height = 0
    let groups = []
    let frame_id = null
    let last = 0

    function Init() {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.floor(rect.width)
      height = Math.floor(rect.height)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      groups = colors.map((color) => ({ color, pixels: [] }))
      const counter_step = (width + height) * 0.01
      for (let x = 0; x < width; x += pixel_gap) {
        for (let y = 0; y < height; y += pixel_gap) {
          const group = groups[Math.floor(Math.random() * groups.length)]
          group.pixels.push({
            x,
            y,
            speed: Random(0.1, 0.9) * pixel_speed,
            size: 0,
            size_step: Math.random() * 0.4,
            max_size: Random(kMinSize, kMaxSize),
            delay: reduced_motion
              ? 0
              : Math.hypot(x - width / 2, y - height / 2),
            counter: 0,
            counter_step: Math.random() * 4 + counter_step,
            idle: true,
            reverse: false,
            shimmer: false,
          })
        }
      }
    } //Init

    function Run(mode) {
      const step = mode === 'appear' ? Appear : Disappear
      if (frame_id !== null) cancelAnimationFrame(frame_id)

      function Tick(now) {
        frame_id = requestAnimationFrame(Tick)
        const passed = now - last
        if (passed < kFrameMs) return
        last = now - (passed % kFrameMs)

        ctx.clearRect(0, 0, width, height)
        let idle = true
        for (const group of groups) {
          ctx.fillStyle = group.color
          for (const pixel of group.pixels) {
            if (step(pixel)) {
              const offset = kMaxSize * 0.5 - pixel.size * 0.5
              ctx.fillRect(
                pixel.x + offset,
                pixel.y + offset,
                pixel.size,
                pixel.size
              )
            }
            if (!pixel.idle) idle = false
          }
        }
        if (idle) {
          cancelAnimationFrame(frame_id)
          frame_id = null
        }
      } //Tick

      frame_id = requestAnimationFrame(Tick)
    } //Run

    Init()
    const observer = new ResizeObserver(Init)
    observer.observe(canvas)
    run_ref.current = Run

    return () => {
      observer.disconnect()
      if (frame_id !== null) cancelAnimationFrame(frame_id)
      run_ref.current = null
    }
  }, [colors, gap, speed])

  useEffect(() => {
    run_ref.current?.(active ? 'appear' : 'disappear')
  }, [active])

  return <canvas ref={canvas_ref} className="pixel-canvas" aria-hidden="true" />
} //PixelCanvas

export default PixelCanvas
