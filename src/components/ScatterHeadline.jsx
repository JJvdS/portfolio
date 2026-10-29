import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useScramble } from './Scramble'

////////////////////////////////////////////////////////////////////////////////
function ScatterLine({ text, trigger, className = '', stagger, spins }) {
  const output = useScramble(text, trigger, { stagger, spins })
  return (
    <span className={`headline-line ${className}`}>
      {output.split('').map((ch, i) => (
        <span key={i} className="headline-letter">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
} //ScatterLine

////////////////////////////////////////////////////////////////////////////////
// Transforms only, so the glowing outline never repaints; overwrite: true
// stops tweens piling up when sweeping across letters
function ScatterHeadline({ lines, trigger, className, id }) {
  const headline_ref = useRef(null)

  useEffect(() => {
    const headline_el = headline_ref.current
    const reduced_motion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!headline_el || reduced_motion) return
    const letters = headline_el.querySelectorAll('.headline-letter')

    function HandleEnter(event) {
      gsap.to(letters, {
        x: () => gsap.utils.random(-2, 2),
        y: () => gsap.utils.random(-2, 2),
        scale: 0.94,
        rotation: () => gsap.utils.random(-3, 3),
        duration: 0.6,
        ease: 'power3.out',
        overwrite: true,
      })
      gsap.to(event.currentTarget, {
        x: gsap.utils.random(-6, 6),
        y: gsap.utils.random(-8, -2),
        scale: 1.1,
        rotation: gsap.utils.random(-4, 4),
        duration: 0.6,
        ease: 'back.out(2)',
        overwrite: true,
      })
    } //HandleEnter

    function HandleLeave() {
      gsap.to(letters, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.6)',
        overwrite: true,
      })
    } //HandleLeave

    letters.forEach((letter) => {
      letter.addEventListener('mouseenter', HandleEnter)
      letter.addEventListener('mouseleave', HandleLeave)
    })

    return () => {
      gsap.killTweensOf(letters)
      letters.forEach((letter) => {
        letter.removeEventListener('mouseenter', HandleEnter)
        letter.removeEventListener('mouseleave', HandleLeave)
      })
    }
  }, [lines])

  return (
    <h2
      className={className}
      id={id}
      ref={headline_ref}
      aria-label={lines.map((line) => line.text).join(' ')}
    >
      {lines.map((line) => (
        <ScatterLine key={line.text} trigger={trigger} {...line} />
      ))}
    </h2>
  )
} //ScatterHeadline

export default ScatterHeadline
