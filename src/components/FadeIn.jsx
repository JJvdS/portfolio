import { useEffect, useRef, useState } from 'react'
import '../styles/FadeIn.sass'

// Kept in sync with FadeIn.sass: the longest transition, and the hidden
// translateY. Elements at the threshold can fire bursts of observer events
// (sub-pixel jitter, or the fade's own transform), so state settles for the
// debounce before acting. While visible, the root grows upward by the shift
// plus slack so the shifted box can't flip-flop in and out
const kTransitionMs = 1100
const kDebounceMs = 120
const kFadeShiftPx = 32
const kExitSlackPx = 24

////////////////////////////////////////////////////////////////////////////////
function FadeIn({
  as: Tag = 'div',
  className = '',
  children,
  threshold = 0.15,
  ...rest
}) {
  const el_ref = useRef(null)
  const running_ref = useRef(false)
  const transition_timeout_ref = useRef(null)
  const debounce_timeout_ref = useRef(null)
  const latest_ref = useRef(false)
  const visible_ref = useRef(false)
  const [visible, SetVisible] = useState(false)

  useEffect(() => {
    const el = el_ref.current
    if (!el) return

    function ScheduleCommit() {
      if (debounce_timeout_ref.current !== null) {
        clearTimeout(debounce_timeout_ref.current)
      }
      debounce_timeout_ref.current = setTimeout(TryCommit, kDebounceMs)
    } //ScheduleCommit

    function TryCommit() {
      debounce_timeout_ref.current = null
      if (running_ref.current) return
      if (latest_ref.current === visible_ref.current) return

      running_ref.current = true
      visible_ref.current = latest_ref.current
      SetVisible(latest_ref.current)
      Observe()
      transition_timeout_ref.current = setTimeout(
        FinishTransition,
        kTransitionMs
      )
    } //TryCommit

    function FinishTransition() {
      running_ref.current = false
      transition_timeout_ref.current = null
      if (latest_ref.current !== visible_ref.current) ScheduleCommit()
    } //FinishTransition

    let observer = null

    // rootMargin can't change on a live observer
    function Observe() {
      observer?.disconnect()
      const top_margin = visible_ref.current ? kFadeShiftPx + kExitSlackPx : 0
      observer = new IntersectionObserver(
        ([entry]) => {
          latest_ref.current = entry.isIntersecting
          ScheduleCommit()
        },
        { threshold, rootMargin: `${top_margin}px 0px 0px 0px` }
      )
      observer.observe(el)
    } //Observe

    Observe()

    return () => {
      observer.disconnect()
      if (transition_timeout_ref.current !== null) {
        clearTimeout(transition_timeout_ref.current)
      }
      if (debounce_timeout_ref.current !== null) {
        clearTimeout(debounce_timeout_ref.current)
      }
    }
  }, [threshold])

  const classes = ['fadein', visible && 'fadein--visible', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={el_ref} className={classes} {...rest}>
      {children}
    </Tag>
  )
} //FadeIn

export default FadeIn
