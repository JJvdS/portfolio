// Lenis eases the real scroll position rather than transforming the page, so
// fixed/sticky elements, scrollY readers and IntersectionObservers keep
// working. A lower lerp is floatier
import Lenis from 'lenis'

const kLerp = 0.075

let lenis = null

////////////////////////////////////////////////////////////////////////////////
export function StartSmoothScroll() {
  const reduced_motion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenis || reduced_motion) return
  lenis = new Lenis({ lerp: kLerp, autoRaf: true })
} //StartSmoothScroll

////////////////////////////////////////////////////////////////////////////////
// Jumps must go through Lenis, or mid-glide it drags the page back to its
// own target. `force` works even while paused
export function JumpTo(y) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo(0, y)
} //JumpTo

////////////////////////////////////////////////////////////////////////////////
export function GlideTo(target, options) {
  if (lenis) {
    lenis.scrollTo(target, options)
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
} //GlideTo

////////////////////////////////////////////////////////////////////////////////
export function PauseScroll() {
  lenis?.stop()
} //PauseScroll

////////////////////////////////////////////////////////////////////////////////
export function ResumeScroll() {
  lenis?.start()
} //ResumeScroll
