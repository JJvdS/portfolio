// Temporary lock while the site isn't done: two red tapes cross the screen
// corner to corner over a wash, and the page underneath can't be clicked,
// focused or scrolled. Remove it by turning off kUnderConstruction in App
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../styles/UnderConstruction.sass'
import { PauseScroll, ResumeScroll } from '../smoothScroll'

const kTapes = [
  { variant: 'down', text: 'WORK IN PROGRESS ✦' },
  { variant: 'up', text: 'WORK IN PROGRESS ✦' },
]

const kScrollKeys = new Set([
  ' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown',
])

////////////////////////////////////////////////////////////////////////////////
// The text is doubled so the tape loops by sliding exactly one half
function ConstructionTape({ text, variant }) {
  const run = Array.from({ length: 16 }, () => text).join(' ')
  return (
    <div className={`construction-tape construction-tape--${variant}`}>
      <div className="construction-tape-track">
        <span>{run}&nbsp;</span>
        <span>{run}&nbsp;</span>
      </div>
    </div>
  )
} //ConstructionTape

////////////////////////////////////////////////////////////////////////////////
// The page root goes inert so nothing behind the overlay takes clicks or
// focus. Keys are caught in the capture phase, before the page's own Escape
// handlers, and scroll keys are cancelled on top of the paused scroll
function UnderConstruction() {
  useEffect(() => {
    const root = document.documentElement
    const page = document.getElementById('root')

    function HandleKeyDown(event) {
      event.stopImmediatePropagation()
      if (kScrollKeys.has(event.key)) event.preventDefault()
    } //HandleKeyDown

    function Block(event) {
      event.preventDefault()
    } //Block

    PauseScroll()
    root.classList.add('is-under-construction')
    if (page) page.inert = true
    window.addEventListener('keydown', HandleKeyDown, true)
    window.addEventListener('wheel', Block, { passive: false })
    window.addEventListener('touchmove', Block, { passive: false })
    return () => {
      ResumeScroll()
      root.classList.remove('is-under-construction')
      if (page) page.inert = false
      window.removeEventListener('keydown', HandleKeyDown, true)
      window.removeEventListener('wheel', Block)
      window.removeEventListener('touchmove', Block)
    }
  }, [])

  return createPortal(
    <div
      className="construction"
      role="alertdialog"
      aria-modal="true"
      aria-label="This site is a work in progress."
    >
      {kTapes.map((tape) => (
        <ConstructionTape key={tape.variant} {...tape} />
      ))}
    </div>,
    document.body
  )
} //UnderConstruction

export default UnderConstruction
