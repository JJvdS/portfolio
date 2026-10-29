import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import '../styles/Projects.sass'
import kProjects from '../data/projects'
import { IsProjectOpen } from '../data/caseStudies'
import ProjectRow from './ProjectRow'
import FadeIn from './FadeIn'
import ScatterHeadline from './ScatterHeadline'
import { Back, HandleLinkClick } from '../router'
import { IsPhone } from '../breakpoints'

const kDesignWidth = 1913

// Module-level so ScatterHeadline doesn't rebind its listeners every render
const kHeadlines = {
  selected: [
    { text: 'SELECTED', stagger: 2, spins: 10 },
    {
      text: 'WORK',
      stagger: 2,
      spins: 16,
      className: 'headline-line--outline',
    },
  ],
  all: [
    { text: 'ALL', stagger: 2, spins: 10 },
    {
      text: 'WORK',
      stagger: 2,
      spins: 16,
      className: 'headline-line--outline',
    },
  ],
}

const kYears = kProjects.map((project) => Number(project.year))
const kYearRange = `${Math.min(...kYears)}–${Math.max(...kYears)}`

const kPreviewOffset = 36
const kPreviewEase = 0.2

////////////////////////////////////////////////////////////////////////////////
function Pad(n, length = 2) {
  return String(n).padStart(length, '0')
} //Pad

////////////////////////////////////////////////////////////////////////////////
// The text is doubled so the marquee loops by sliding exactly one half
function Marquee({ text, variant }) {
  const run = Array.from({ length: 8 }, () => text).join(' ')
  return (
    <div
      className={`showcase-tape showcase-tape--${variant}`}
      aria-hidden="true"
    >
      <div className="showcase-tape-track">
        <span>{run}&nbsp;</span>
        <span>{run}&nbsp;</span>
      </div>
    </div>
  )
} //Marquee

////////////////////////////////////////////////////////////////////////////////
// Lives outside the scaled canvas: a transformed ancestor would turn
// position: fixed into position: absolute
function Preview({ project }) {
  const el_ref = useRef(null)

  // After an Esc remount no pointermove fires, but mouseover still carries
  // the cursor position
  useEffect(() => {
    const el = el_ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const current = { ...target }
    let frame_id = null
    let placed = false

    function Tick() {
      current.x += (target.x - current.x) * kPreviewEase
      current.y += (target.y - current.y) * kPreviewEase
      const width = el.offsetWidth + kPreviewOffset
      const height = el.offsetHeight + kPreviewOffset
      const flip_x = target.x + width > window.innerWidth
      const flip_y = target.y + height > window.innerHeight
      const x = flip_x ? current.x - width : current.x + kPreviewOffset
      const y = flip_y ? current.y - height : current.y + kPreviewOffset
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      const distance =
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y)
      frame_id = distance > 0.1 ? requestAnimationFrame(Tick) : null
    } //Tick

    function HandlePointerMove(event) {
      target.x = event.clientX
      target.y = event.clientY
      if (!placed) {
        placed = true
        current.x = target.x
        current.y = target.y
      }
      if (frame_id === null) frame_id = requestAnimationFrame(Tick)
    } //HandlePointerMove

    window.addEventListener('pointermove', HandlePointerMove, { passive: true })
    window.addEventListener('mouseover', HandlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', HandlePointerMove)
      window.removeEventListener('mouseover', HandlePointerMove)
      if (frame_id !== null) cancelAnimationFrame(frame_id)
    }
  }, [])

  const locked = project && !IsProjectOpen(project)
  const preview_class =
    'showcase-preview' +
    (project ? ' is-visible' : '') +
    (locked ? ' showcase-preview--wip' : '')

  return (
    <div ref={el_ref} className={preview_class} aria-hidden="true">
      <div className="showcase-preview-bar">
        <span className="showcase-preview-dots">
          <span />
          <span />
          <span />
        </span>
        <span className="showcase-preview-url">
          /work/{project?.slug ?? ''}
        </span>
      </div>
      <div className="showcase-preview-screen">
        {project?.image && !locked ? (
          <img key={project.index} src={project.image} alt="" />
        ) : (
          <span className="placeholder-shimmer" />
        )}
        {locked && (
          <span className="showcase-preview-wip">Work in progress</span>
        )}
      </div>
      <div className="showcase-preview-foot">
        <span>{project?.title ?? ''}</span>
        <span>{locked ? 'Coming soon' : 'Click to open →'}</span>
      </div>
    </div>
  )
} //Preview

////////////////////////////////////////////////////////////////////////////////
function Projects({ items, variant = 'selected' }) {
  const [active_index, SetActiveIndex] = useState(null)
  const [hover_tick, SetHoverTick] = useState(0)
  const [enter_tick, SetEnterTick] = useState(0)
  const section_ref = useRef(null)
  const viewport_ref = useRef(null)
  const canvas_ref = useRef(null)
  const [scale, SetScale] = useState(1)
  const [canvas_height, SetCanvasHeight] = useState(0)
  const show_all = variant === 'all'

  useLayoutEffect(() => {
    const viewport_el = viewport_ref.current
    const canvas_el = canvas_ref.current
    if (!viewport_el || !canvas_el) return

    function Update() {
      const width = viewport_el.offsetWidth
      const next_scale = IsPhone() ? 1 : width / kDesignWidth
      SetScale(next_scale)
      SetCanvasHeight(canvas_el.scrollHeight * next_scale)
    } //Update

    Update()
    const observer = new ResizeObserver(Update)
    observer.observe(viewport_el)
    observer.observe(canvas_el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = section_ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) SetEnterTick((t) => t + 1)
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const wip = active_index !== null && !IsProjectOpen(items[active_index])

  useEffect(() => {
    if (!wip) return
    const root = document.documentElement
    root.classList.add('is-wip')
    return () => root.classList.remove('is-wip')
  }, [wip])

  function Activate(i) {
    SetActiveIndex(i)
    SetHoverTick((t) => t + 1)
  } //Activate

  function HandleBackClick(event) {
    event.preventDefault()
    Back('/', { effect: 'glitch', label: 'back // home', name: 'Home' })
  } //HandleBackClick

  function HandleAllWorkClick(event) {
    HandleLinkClick(event, '/work', {
      effect: 'glitch',
      label: 'opening // work',
      name: 'Work',
    })
  } //HandleAllWorkClick

  const entries = show_all
    ? `${Pad(items.length)} entries`
    : `${Pad(items.length)} of ${Pad(kProjects.length)} entries`
  const eof_text = show_all
    ? `${Pad(items.length)} projects · more on the way`
    : `${Pad(items.length)} of ${Pad(kProjects.length)} projects shown`
  const list_class =
    'showcase-list' + (active_index !== null ? ' showcase-list--focused' : '')
  const canvas_style =
    scale === 1 ? undefined : { transform: `scale(${scale})` }

  return (
    <section className="showcase" id="work" ref={section_ref}>
      <Marquee
        variant="ink"
        text="IT COMPILED ON THE FIRST TRY ✦ (IT DID NOT) ✦"
      />
      <Marquee variant="accent" text="OPEN TO NEW PROJECTS ✦ SAY HELLO ✦" />

      <div
        className="showcase-viewport"
        ref={viewport_ref}
        style={{ height: canvas_height || undefined }}
      >
        <div className="showcase-canvas" ref={canvas_ref} style={canvas_style}>
          <div className="showcase-header">
            <FadeIn as="p" className="showcase-eyebrow">
              <span className="showcase-eyebrow-dot" />
              {show_all ? 'Index // Work' : '02 // Work'}
            </FadeIn>
            <FadeIn as="p" className="showcase-stats">
              {entries} <span>·</span> {kYearRange}
            </FadeIn>
          </div>

          <div className="showcase-intro">
            <ScatterHeadline
              className="showcase-intro-title"
              lines={kHeadlines[variant]}
              trigger={enter_tick}
            />
            <FadeIn as="p" className="showcase-intro-copy">
              Projects I’ve worked on, some finished, some still in
              progress.{' '}
              <span className="showcase-hint showcase-hint--pointer">
                Hover to preview, click to dive in.
              </span>
              <span className="showcase-hint showcase-hint--touch">
                Tap a project to dive in.
              </span>
            </FadeIn>
          </div>

          <div className="showcase-columns" aria-hidden="true">
            <span>No.</span>
            <span>Project</span>
            <span>Stack / Status</span>
          </div>

          <ul className={list_class}>
            {items.map((project, i) => (
              <FadeIn
                as="li"
                key={project.index}
                className="showcase-list-item"
              >
                <ProjectRow
                  project={project}
                  active={active_index === i}
                  hover_tick={hover_tick}
                  on_hover={() => Activate(i)}
                  on_leave={() => SetActiveIndex(null)}
                />
              </FadeIn>
            ))}
          </ul>

          <FadeIn className="showcase-eof">
            <p className="showcase-eof-text">
              {eof_text}
              <span className="caret" />
            </p>
            {show_all ? (
              <a
                className="showcase-eof-link"
                href="/"
                onClick={HandleBackClick}
              >
                <span className="showcase-eof-link-wipe" aria-hidden="true" />
                <span className="showcase-eof-link-text">
                  <span aria-hidden="true">←</span> Back to home
                </span>
              </a>
            ) : (
              <a
                className="showcase-eof-link"
                href="/work"
                onClick={HandleAllWorkClick}
              >
                <span className="showcase-eof-link-wipe" aria-hidden="true" />
                <span className="showcase-eof-link-text">
                  See all work <span aria-hidden="true">→</span>
                </span>
              </a>
            )}
          </FadeIn>
        </div>
      </div>

      <Preview project={active_index !== null ? items[active_index] : null} />
    </section>
  )
} //Projects

export default Projects
