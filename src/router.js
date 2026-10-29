import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { PrepareGlitch } from './transitions/glitch'
import { JumpTo } from './smoothScroll'

// Module state: route listeners, plus the options Back() hands to the
// popstate it triggers, so an in-page Back button can pick its transition
// while the browser's own back button keeps the fade
const listeners = new Set()
let pending_back_options = null

////////////////////////////////////////////////////////////////////////////////
function Notify() {
  listeners.forEach((listener) => listener(window.location.pathname))
} //Notify

////////////////////////////////////////////////////////////////////////////////
// flushSync makes React commit inside the callback, which is what the view
// transition snapshots against
function WithTransition(update, options = {}) {
  const reduced_motion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduced_motion) {
    update()
    return
  }
  const glitch = options.effect === 'glitch' ? PrepareGlitch(options) : null
  const transition = document.startViewTransition(() => flushSync(update))
  glitch?.Attach(transition)
} //WithTransition

////////////////////////////////////////////////////////////////////////////////
export function Navigate(to, options) {
  if (to === window.location.pathname) return

  const history = window.history
  history.replaceState({ ...history.state, scroll_y: window.scrollY }, '')
  history.pushState(
    { scroll_y: 0, from_site: true, from: window.location.pathname },
    '',
    to
  )

  WithTransition(() => {
    Notify()
    JumpTo(0)
  }, options)
} //Navigate

////////////////////////////////////////////////////////////////////////////////
// Only step back if the previous entry is on this site; otherwise go home
export function Back(fallback = '/', options) {
  if (window.history.state?.from_site) {
    pending_back_options = options ?? null
    window.history.back()
  } else {
    Navigate(fallback, options)
  }
} //Back

////////////////////////////////////////////////////////////////////////////////
export function usePath() {
  const [path, SetPath] = useState(window.location.pathname)

  useEffect(() => {
    listeners.add(SetPath)

    function HandlePopState() {
      const scroll_y = window.history.state?.scroll_y ?? 0
      const options = pending_back_options ?? undefined
      pending_back_options = null
      WithTransition(() => {
        SetPath(window.location.pathname)
        JumpTo(scroll_y)
      }, options)
    } //HandlePopState

    window.history.scrollRestoration = 'manual'
    window.addEventListener('popstate', HandlePopState)
    return () => {
      listeners.delete(SetPath)
      window.removeEventListener('popstate', HandlePopState)
    }
  }, [])

  return path
} //usePath

////////////////////////////////////////////////////////////////////////////////
// Plain left clicks only, so modified clicks still open a new tab
export function HandleLinkClick(event, to, options) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  Navigate(to, options)
} //HandleLinkClick
