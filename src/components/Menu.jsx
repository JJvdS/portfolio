import { useEffect, useEffectEvent, useRef, useState } from 'react'
import '../styles/Menu.sass'
import kProjects from '../data/projects'
import { Navigate } from '../router'
import { JumpTo, PauseScroll, ResumeScroll } from '../smoothScroll'
import PixelCanvas from './PixelCanvas'
import { kEmail, kGithubUrl, kLinkedinUrl } from '../data/contact'

// The first open waits for the hero tape intro (1s delay + 1.5s, Tape.sass)
const kIntroDelayMs = 2600
const kQuickDelayMs = 200
const kToggleLockMs = 1500
const kTileSettleMs = 450
const kTileHoverScale = 0.9

const kResumeHref = '/resume.pdf'

let intro_played = false

const kIcons = {
  top: (
    <>
      <path d="M5 15 16 6l11 9" />
      <path d="M8 12.5V26h16V12.5" />
      <path d="M13.5 26v-7h5v7" />
    </>
  ),
  work: (
    <>
      <rect x="5" y="5" width="9" height="9" />
      <rect x="18" y="5" width="9" height="9" />
      <rect x="5" y="18" width="9" height="9" />
      <rect x="18" y="18" width="9" height="9" />
    </>
  ),
  resume: (
    <>
      <path d="M8 4h11l6 6v18H8z" />
      <path d="M19 4v6h6" />
      <path d="M12 16h9M12 20h9M12 24h5" />
    </>
  ),
  contact: (
    <>
      <path d="M5 7h22v15H14l-6 5v-5H5z" />
      <path d="M11 13h10M11 17h6" />
    </>
  ),
}

// Module-level so the canvases never see a new prop and rebuild
const kItems = [
  {
    id: 'top',
    label: 'Home',
    meta: 'Back to the top',
    accent: '#2f5bff',
    pixels: { colors: ['#a9b9ff', '#2f5bff', '#1a36b8'], gap: 5, speed: 35 },
  },
  {
    id: 'work',
    label: 'Work',
    meta: `${Pad(kProjects.length)} projects`,
    route: '/work',
    accent: '#3d8fb3',
    pixels: { colors: ['#8DC3DA', '#3d8fb3', '#1f5a73'], gap: 5.5, speed: 30 },
  },
  {
    id: 'resume',
    label: 'Resume',
    meta: 'Download PDF',
    href: kResumeHref,
    accent: '#d9952e',
    pixels: { colors: ['#F0BE74', '#d9952e', '#a0661a'], gap: 4.5, speed: 30 },
  },
  {
    id: 'contact',
    label: 'Contact',
    meta: 'Say hello',
    accent: '#ff6b2c',
    pixels: { colors: ['#ffb08c', '#ff6b2c', '#c2410c'], gap: 6, speed: 45 },
  },
]

const kSocials = [
  { label: 'GitHub', href: kGithubUrl },
  { label: 'LinkedIn', href: kLinkedinUrl },
  { label: 'Mail', href: `mailto:${kEmail}` },
]

const kScrollKeys = new Set([
  ' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown',
])

const kExternalLinkProps = { target: '_blank', rel: 'noopener noreferrer' }

////////////////////////////////////////////////////////////////////////////////
function Pad(n) {
  return String(n).padStart(2, '0')
} //Pad

////////////////////////////////////////////////////////////////////////////////
function CurrentSection() {
  const middle = window.innerHeight / 2
  let current = 'top'
  for (const { id, route, href } of kItems) {
    if (route || href) continue
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= middle) current = id
  }
  return current
} //CurrentSection

////////////////////////////////////////////////////////////////////////////////
// Eased in JS: a CSS transition retargeted on every mousemove restarts its
// curve and stutters
function MenuTile({ ref, item, index, current, active, ...handlers }) {
  const tile_ref = useRef(null)
  const follow_ref = useRef(null)

  useEffect(() => {
    const el = tile_ref.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const target = { x: 0, y: 0, s: 1 }
    const value = { x: 0, y: 0, s: 1 }
    let frame_id = null
    let last = null

    function Tick(now) {
      frame_id = null
      const dt = last === null ? 16 : now - last
      last = now
      const factor = 1 - Math.exp(-dt / (kTileSettleMs / 3))
      let settled = true
      for (const key of ['x', 'y', 's']) {
        value[key] += (target[key] - value[key]) * factor
        if (Math.abs(target[key] - value[key]) > 0.001) settled = false
      }
      el.style.setProperty('--tile-x', value.x.toFixed(4))
      el.style.setProperty('--tile-y', value.y.toFixed(4))
      el.style.setProperty('--tile-scale', value.s.toFixed(4))
      if (settled) last = null
      else frame_id = requestAnimationFrame(Tick)
    } //Tick

    function Kick() {
      if (frame_id === null) frame_id = requestAnimationFrame(Tick)
    } //Kick

    function HandlePointerMove(event) {
      if (event.pointerType === 'touch') return
      const box = el.getBoundingClientRect()
      target.x = ((event.clientX - box.left) / box.width - 0.5) * 2
      target.y = ((event.clientY - box.top) / box.height - 0.5) * 2
      Kick()
    } //HandlePointerMove

    el.addEventListener('pointermove', HandlePointerMove)
    follow_ref.current = (on) => {
      target.s = on ? kTileHoverScale : 1
      if (!on) target.x = target.y = 0
      Kick()
    }
    return () => {
      el.removeEventListener('pointermove', HandlePointerMove)
      if (frame_id !== null) cancelAnimationFrame(frame_id)
      follow_ref.current = null
    }
  }, [])

  useEffect(() => {
    follow_ref.current?.(active)
  }, [active])

  const tile_class =
    'menu-tile' +
    (current ? ' is-current' : '') +
    (active ? ' is-hovered' : '')

  return (
    <a
      ref={(node) => {
        tile_ref.current = node
        if (ref) ref.current = node
      }}
      href={item.href ?? item.route ?? `#${item.id}`}
      {...(item.href ? kExternalLinkProps : {})}
      className={tile_class}
      aria-current={current ? 'location' : undefined}
      {...handlers}
    >
      <PixelCanvas active={active} {...item.pixels} />
      <span className="menu-tile-index">{Pad(index + 1)}</span>
      <svg className="menu-tile-icon" viewBox="0 0 32 32" aria-hidden="true">
        {kIcons[item.id]}
      </svg>
      <span className="menu-tile-text">
        <span className="menu-tile-label">{item.label}</span>
        <span className="menu-tile-meta">{item.meta}</span>
      </span>
    </a>
  )
} //MenuTile

////////////////////////////////////////////////////////////////////////////////
function Menu() {
  const [open, SetOpen] = useState(false)
  const [current, SetCurrent] = useState('top')
  const [hovered, SetHovered] = useState(null)
  const locked_ref = useRef(false)
  const first_item_ref = useRef(null)
  const burger_ref = useRef(null)

  // The delay is only read here, since StrictMode runs initializers twice;
  // the intro is flagged as played in the effect below
  const [delay] = useState(() =>
    !intro_played && window.scrollY < window.innerHeight / 2
      ? kIntroDelayMs
      : kQuickDelayMs
  )

  useEffect(() => {
    intro_played = true
  }, [])

  function Toggle(next = !open) {
    if (locked_ref.current || next === open) return
    locked_ref.current = true
    setTimeout(() => (locked_ref.current = false), kToggleLockMs)
    if (next) SetCurrent(CurrentSection())
    else SetHovered(null)
    SetOpen(next)
  } //Toggle

  const close_menu = useEffectEvent(() => Toggle(false))

  // Scroll is blocked by cancelling input rather than overflow: hidden, which
  // would remove the scrollbar and shift the page
  useEffect(() => {
    if (!open) return

    function Block(event) {
      event.preventDefault()
    } //Block

    function HandleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close_menu()
      } else if (
        kScrollKeys.has(event.key) &&
        !event.target.closest?.('a, button')
      ) {
        event.preventDefault()
      }
    } //HandleKeyDown

    PauseScroll()
    const focus_timeout = setTimeout(
      () => first_item_ref.current?.focus({ preventScroll: true }),
      800
    )
    window.addEventListener('wheel', Block, { passive: false })
    window.addEventListener('touchmove', Block, { passive: false })
    window.addEventListener('keydown', HandleKeyDown)
    const burger = burger_ref.current
    return () => {
      clearTimeout(focus_timeout)
      ResumeScroll()
      window.removeEventListener('wheel', Block)
      window.removeEventListener('touchmove', Block)
      window.removeEventListener('keydown', HandleKeyDown)
      burger?.focus({ preventScroll: true })
    }
  }, [open])

  function Go(event, item) {
    if (item.href) return
    event.preventDefault()
    if (item.route) {
      Navigate(item.route, {
        effect: 'glitch',
        label: 'opening // work',
        name: 'Work',
      })
      return
    }
    const el = document.getElementById(item.id)
    if (el) JumpTo(item.id === 'top' ? 0 : el.offsetTop)
    Toggle(false)
  } //Go

  // Only keyboard focus lights a tile, not the focus moved in on open
  function HandleFocus(event, i) {
    if (event.currentTarget.matches(':focus-visible')) SetHovered(i)
  } //HandleFocus

  function Unhover(i) {
    SetHovered((h) => (h === i ? null : h))
  } //Unhover

  return (
    <div
      className={`menu${open ? ' is-open' : ''}`}
      style={{ '--menu-delay': `${delay}ms` }}
    >
      <button
        ref={burger_ref}
        type="button"
        className="menu-burger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => Toggle()}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className="menu-panel"
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <p className="menu-eyebrow menu-reveal" style={{ '--i': 0 }}>
          <span className="menu-eyebrow-dot" />
          Menu // {Pad(kItems.length)} links
        </p>

        <nav className="menu-main" aria-label="Site">
          <ol className="menu-tiles">
            {kItems.map((item, i) => (
              <li
                key={item.id}
                className="menu-reveal"
                style={{ '--i': i + 1, '--accent': item.accent }}
              >
                <MenuTile
                  ref={i === 0 ? first_item_ref : undefined}
                  item={item}
                  index={i}
                  current={current === item.id}
                  active={hovered === i}
                  onClick={(event) => Go(event, item)}
                  onMouseEnter={() => SetHovered(i)}
                  onMouseLeave={() => Unhover(i)}
                  onFocus={(event) => HandleFocus(event, i)}
                  onBlur={() => Unhover(i)}
                />
              </li>
            ))}
          </ol>
        </nav>

        <div
          className="menu-info menu-reveal"
          style={{ '--i': kItems.length + 1 }}
        >
          <p className="menu-blurb">
            Software Developer based in Lisse, NL.
          </p>
          <ul className="menu-socials">
            {kSocials.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(href.startsWith('http') ? kExternalLinkProps : {})}
                >
                  {label}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p
          className="menu-footer menu-reveal"
          style={{ '--i': kItems.length + 2 }}
        >
          <span>© {new Date().getFullYear()} Jens van der Sloot</span>
          <span>Esc to close</span>
        </p>
      </div>
    </div>
  )
} //Menu

export default Menu
