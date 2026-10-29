import { useEffect, useRef, useState } from 'react'
import '../styles/Stack.sass'
import kStack, { kFocusNames, kToolCount } from '../data/stack'
import FadeIn from './FadeIn'
import ScatterHeadline from './ScatterHeadline'
import { useScramble } from './Scramble'

// Module-level so ScatterHeadline doesn't rebind its listeners every render
const kHeadline = [
  { text: 'TECH', stagger: 2, spins: 10 },
  { text: 'STACK', stagger: 2, spins: 16, className: 'headline-line--outline' },
]

const kMagnetRadius = 140
const kMagnetPull = 10
const kMagnetSettleMs = 260
const kLevels = 5

const kFocusJson = `[${kFocusNames.map((name) => `"${name}"`).join(', ')}]`

////////////////////////////////////////////////////////////////////////////////
function Pad(n) {
  return String(n).padStart(2, '0')
} //Pad

////////////////////////////////////////////////////////////////////////////////
function Tier({ tier, index }) {
  const row_ref = useRef(null)
  const [entered, SetEntered] = useState(false)

  useEffect(() => {
    const el = row_ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        SetEntered(true)
        observer.disconnect()
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const tier_class =
    'stack-tier' +
    (entered ? ' is-in' : '') +
    (tier.faded ? ' stack-tier--faded' : '')

  return (
    <div ref={row_ref} className={tier_class}>
      <span className="stack-tier-index">{Pad(index + 1)}</span>

      <div className="stack-tier-head">
        <h3 className="stack-tier-label">{tier.label}</h3>
        <p className="stack-tier-caption">{tier.caption}</p>
        {tier.level && (
          <span
            className="stack-meter"
            role="img"
            aria-label={`${tier.level} out of ${kLevels}`}
          >
            {Array.from({ length: kLevels }, (_, i) => (
              <span
                key={i}
                className={i < tier.level ? 'is-on' : ''}
                style={{ '--i': i }}
              />
            ))}
          </span>
        )}
      </div>

      <ul className="stack-tiles">
        {tier.items.map((item, i) => (
          <li
            key={item.id}
            className={`stack-tile${item.focus ? ' stack-tile--focus' : ''}`}
            style={{ '--i': i }}
          >
            <span
              className="stack-tile-body"
              tabIndex={0}
              aria-label={
                item.focus ? `${item.name}, current focus` : item.name
              }
            >
              <img
                src={item.icon}
                alt=""
                width="64"
                height="64"
                draggable="false"
              />
              {item.focus && (
                <span className="stack-tile-badge" aria-hidden="true" />
              )}
            </span>
            <span className="stack-tile-name" aria-hidden="true">
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
} //Tier

////////////////////////////////////////////////////////////////////////////////
function Stack() {
  const section_ref = useRef(null)
  const [tick, SetTick] = useState(0)
  const focus = useScramble(kFocusJson, tick, { stagger: 1.4, spins: 10 })

  useEffect(() => {
    const el = section_ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) SetTick((t) => t + 1)
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Tiles lean toward the cursor. Eased in JS: a CSS transition retargeted
  // on every pointermove restarts its curve and stutters
  useEffect(() => {
    const section_el = section_ref.current
    if (!section_el) return
    const skip =
      window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)')
        .matches
    if (skip) return

    const tiles = [...section_el.querySelectorAll('.stack-tile')].map(
      (el) => ({
        el,
        target: { x: 0, y: 0 },
        value: { x: 0, y: 0 },
      })
    )
    let frame_id = null
    let last = null

    function Tick(now) {
      frame_id = null
      const dt = last === null ? 16 : now - last
      last = now
      const factor = 1 - Math.exp(-dt / (kMagnetSettleMs / 3))
      let settled = true
      for (const tile of tiles) {
        tile.value.x += (tile.target.x - tile.value.x) * factor
        tile.value.y += (tile.target.y - tile.value.y) * factor
        const distance =
          Math.abs(tile.target.x - tile.value.x) +
          Math.abs(tile.target.y - tile.value.y)
        if (distance > 0.05) settled = false
        const x = tile.value.x.toFixed(2)
        const y = tile.value.y.toFixed(2)
        tile.el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      if (settled) last = null
      else frame_id = requestAnimationFrame(Tick)
    } //Tick

    function Kick() {
      if (frame_id === null) frame_id = requestAnimationFrame(Tick)
    } //Kick

    function HandlePointerMove(event) {
      for (const tile of tiles) {
        const box = tile.el.getBoundingClientRect()
        const dx = event.clientX - (box.left + box.width / 2)
        const dy = event.clientY - (box.top + box.height / 2)
        const distance = Math.hypot(dx, dy)
        const pull =
          distance < kMagnetRadius
            ? (1 - distance / kMagnetRadius) * kMagnetPull
            : 0
        tile.target.x = distance ? (dx / distance) * pull : 0
        tile.target.y = distance ? (dy / distance) * pull : 0
      }
      Kick()
    } //HandlePointerMove

    function HandlePointerLeave() {
      for (const tile of tiles) tile.target.x = tile.target.y = 0
      Kick()
    } //HandlePointerLeave

    section_el.addEventListener('pointermove', HandlePointerMove, {
      passive: true,
    })
    section_el.addEventListener('pointerleave', HandlePointerLeave)
    return () => {
      section_el.removeEventListener('pointermove', HandlePointerMove)
      section_el.removeEventListener('pointerleave', HandlePointerLeave)
      if (frame_id !== null) cancelAnimationFrame(frame_id)
    }
  }, [])

  return (
    <section className="stack" id="stack" ref={section_ref}>
      <div className="stack-inner">
        <div className="stack-header">
          <FadeIn as="p" className="stack-eyebrow">
            <span className="stack-eyebrow-dot" />
            03 // Stack
          </FadeIn>
          <FadeIn as="p" className="stack-stats">
            {Pad(kToolCount)} tools <span>·</span> {Pad(kStack.length)} tiers
          </FadeIn>
        </div>

        <div className="stack-intro">
          <ScatterHeadline
            className="stack-title"
            lines={kHeadline}
            trigger={tick}
          />
          <FadeIn className="stack-intro-side">
            <p className="stack-intro-copy">
              The languages and tools I build with, from the ones I reach for
              every day to the ones I’ve shipped something in once. Drawn to
              functional programming and low-level systems.
            </p>
            <p className="stack-terminal">
              <span className="stack-terminal-prompt">~ $</span> focus --now
              --json
              <span
                className="stack-terminal-out"
                aria-label={kFocusNames.join(', ')}
              >
                <span aria-hidden="true">{focus}</span>
                <span className="caret" />
              </span>
            </p>
          </FadeIn>
        </div>

        <ol className="stack-tiers">
          {kStack.map((tier, i) => (
            <FadeIn as="li" key={tier.id} className="stack-tiers-item">
              <Tier tier={tier} index={i} />
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  )
} //Stack

export default Stack
