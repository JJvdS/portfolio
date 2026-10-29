import { useEffect, useMemo, useState } from 'react'
import '../styles/CaseStudy.sass'
import { kEmail } from '../data/contact'
import { Back } from '../router'
import { GlideTo } from '../smoothScroll'
import CodeBlock from './CodeBlock'
import FadeIn from './FadeIn'
import DotField from './DotField'
import ScatterHeadline from './ScatterHeadline'

// Mirrors the winning table in board.h, with a label per line
const kCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]
const kComboLabels = [
  'Row 1', 'Row 2', 'Row 3',
  'Col 1', 'Col 2', 'Col 3',
  'Diagonal', 'Anti-diagonal',
]

////////////////////////////////////////////////////////////////////////////////
function FindWin(squares) {
  return kCombinations.find(
    ([a, b, c]) =>
      squares[a] !== '.' &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
  )
} //FindWin

////////////////////////////////////////////////////////////////////////////////
function Pad(n) {
  return String(n).padStart(2, '0')
} //Pad

////////////////////////////////////////////////////////////////////////////////
function Combos() {
  return (
    <div className="cs-combos">
      {kCombinations.map((combo, i) => (
        <figure className="cs-combo" key={i}>
          <div className="cs-combo-grid" aria-hidden="true">
            {Array.from({ length: 9 }, (_, square) => (
              <span
                key={square}
                className={combo.includes(square) ? 'is-on' : ''}
              />
            ))}
          </div>
          <figcaption>
            <span className="cs-combo-label">{kComboLabels[i]}</span>
            <span className="cs-combo-indices">{`{${combo.join(', ')}}`}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
} //Combos

////////////////////////////////////////////////////////////////////////////////
function Playground({ text }) {
  const [squares, SetSquares] = useState(() => Array(9).fill('.'))
  const [player, SetPlayer] = useState('A')
  const win = FindWin(squares)
  const moves = squares.filter((s) => s !== '.').length
  const over = Boolean(win) || moves === 9

  function HandleMove(position) {
    if (over || squares[position] !== '.') return
    const next = [...squares]
    next[position] = player === 'A' ? 'X' : 'O'
    SetSquares(next)
    if (!FindWin(next)) SetPlayer(player === 'A' ? 'B' : 'A')
  } //HandleMove

  function Reset() {
    SetSquares(Array(9).fill('.'))
    SetPlayer('A')
  } //Reset

  let status = `Player ${player}, choose a square (1-9)`
  if (win) {
    status = `Player ${player} won! The game took a total of ${moves} moves.`
  } else if (over) {
    status = 'Game is drawn!'
  }

  const ascii = [0, 3, 6]
    .map((row) => `[ ${squares.slice(row, row + 3).join(' ')} ]`)
    .join('\n')

  return (
    <div className="cs-play">
      <p className="cs-play-intro">{text}</p>
      <div className="cs-play-stage">
        <div className={`cs-play-board${over ? ' is-over' : ''}`}>
          {squares.map((square, i) => (
            <button
              type="button"
              key={i}
              className={
                'cs-play-square' +
                (win?.includes(i) ? ' is-win' : '') +
                (square !== '.' ? ` is-${square.toLowerCase()}` : '')
              }
              onClick={() => HandleMove(i)}
              disabled={over || square !== '.'}
              aria-label={
                square === '.'
                  ? `Square ${i + 1}, empty`
                  : `Square ${i + 1}, ${square}`
              }
            >
              {square === '.' ? (
                <span className="cs-play-hint">{i + 1}</span>
              ) : (
                square
              )}
            </button>
          ))}
        </div>
        <div className="cs-play-side">
          <pre className="cs-play-ascii" aria-hidden="true">
            {ascii}
          </pre>
          <p className="cs-play-status" aria-live="polite">
            {status}
          </p>
          <button type="button" className="cs-play-reset" onClick={Reset}>
            [ New game ]
          </button>
        </div>
      </div>
    </div>
  )
} //Playground

////////////////////////////////////////////////////////////////////////////////
function Block({ block }) {
  switch (block.type) {
    case 'p':
      return (
        <FadeIn as="p" className="cs-p">
          {block.text}
        </FadeIn>
      )
    case 'code':
      return (
        <FadeIn>
          <CodeBlock code={block.code} lang={block.lang} file={block.file} />
        </FadeIn>
      )
    case 'terminal':
      return (
        <FadeIn>
          <CodeBlock code={block.code} terminal />
        </FadeIn>
      )
    case 'callout':
      return (
        <FadeIn
          as="aside"
          className={`cs-callout cs-callout--${block.tone ?? 'note'}`}
        >
          <p className="cs-callout-label">{block.label}</p>
          <p className="cs-callout-text">{block.text}</p>
        </FadeIn>
      )
    case 'stats':
      return (
        <FadeIn as="dl" className="cs-stats">
          {block.items.map(([value, label]) => (
            <div className="cs-stat" key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </FadeIn>
      )
    case 'list':
      return (
        <FadeIn as="dl" className="cs-list">
          {block.items.map(([term, text]) => (
            <div className="cs-list-item" key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </FadeIn>
      )
    case 'combos':
      return (
        <FadeIn>
          <Combos />
        </FadeIn>
      )
    case 'play':
      return (
        <FadeIn>
          <Playground text={block.text} />
        </FadeIn>
      )
    default:
      return null
  }
} //Block

////////////////////////////////////////////////////////////////////////////////
function CaseStudy({ study }) {
  const [active_section, SetActiveSection] = useState(study.sections[0].id)
  const index = `#${study.index}`

  // Memoised so ScatterHeadline doesn't rebind its listeners every render
  const headline = useMemo(
    () => [{ text: study.title, stagger: 2.4, spins: 12 }],
    [study.title]
  )
  const headline_chars = Math.max(...headline.map((line) => line.text.length))

  useEffect(() => {
    const previous_title = document.title
    document.title = `${study.title} · Case Study · Jens van der Sloot`
    document.documentElement.classList.add('is-case-study')
    return () => {
      document.title = previous_title
      document.documentElement.classList.remove('is-case-study')
    }
  }, [study.title])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) SetActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    study.sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [study.sections])

  const [from_index] = useState(() =>
    /^\/work\/?$/.test(window.history.state?.from ?? '')
  )

  function Leave() {
    Back(from_index ? '/work' : '/', {
      effect: 'glitch',
      label: `closing // ${study.title}`,
      name: from_index ? 'All work' : 'Home',
    })
  } //Leave

  function HandleBack(event) {
    event.preventDefault()
    Leave()
  } //HandleBack

  function HandleNavClick(event, id) {
    event.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop || 0)
    GlideTo(el, { offset: -margin })
  } //HandleNavClick

  useEffect(() => {
    function HandleKeyDown(event) {
      if (event.key === 'Escape' && !event.defaultPrevented) Leave()
    } //HandleKeyDown

    window.addEventListener('keydown', HandleKeyDown)
    return () => window.removeEventListener('keydown', HandleKeyDown)
  })

  return (
    <article className="cs">
      <div className="cs-backdrop" aria-hidden="true">
        <DotField />
      </div>

      <header className="cs-topbar">
        <a className="cs-back" href="/" onClick={HandleBack}>
          <span className="cs-back-key" aria-hidden="true">Esc</span>
          <span className="cs-back-arrow" aria-hidden="true">←</span>
          <span>Back to work</span>
        </a>
        <span className="cs-topbar-status">
          <span className="cs-topbar-dot" />
          Case study <em>// {study.title}</em>
        </span>
      </header>

      <section className="cs-hero">
        <p className="cs-eyebrow">
          <span className="cs-eyebrow-dot" />
          Case study <span className="cs-hex">{index}</span>
        </p>
        <div className="cs-title" style={{ '--chars': headline_chars }}>
          <ScatterHeadline
            className="cs-title-headline"
            lines={headline}
            trigger={1}
          />
        </div>
        {study.tagline && <p className="cs-tagline">{study.tagline}</p>}

        <dl className="cs-facts">
          {study.facts.map(([label, value]) => (
            <div className="cs-fact" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <figure className="cs-hero-frame">
          <div className="cs-hero-bar" aria-hidden="true">
            <span className="cs-hero-dots">
              <span />
              <span />
              <span />
            </span>
            <span className="cs-hero-url">/work/{study.slug}</span>
          </div>
          <div className="cs-hero-screen">
            {study.image ? (
              <img
                src={study.image}
                alt={`${study.title} cover: ${study.image_alt}`}
              />
            ) : (
              <>
                <span className="placeholder-shimmer" aria-hidden="true" />
                <span className="cs-hero-soon">Cover coming soon</span>
              </>
            )}
          </div>
        </figure>
      </section>

      {study.summary && (
        <section className="cs-glance" aria-labelledby="cs-glance-title">
          <FadeIn as="h2" className="cs-glance-title" id="cs-glance-title">
            At a glance
          </FadeIn>
          <div className="cs-glance-grid">
            {study.summary.map(([label, text], i) => (
              <FadeIn className="cs-glance-item" key={label}>
                <p className="cs-glance-label">
                  <span className="cs-hex">{Pad(i + 1)}</span>
                  {label}
                </p>
                <p className="cs-glance-text">{text}</p>
              </FadeIn>
            ))}
          </div>
          {study.highlights && (
            <FadeIn as="dl" className="cs-stats cs-glance-stats">
              {study.highlights.map(([value, label]) => (
                <div className="cs-stat" key={label}>
                  <dt>{value}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </FadeIn>
          )}
        </section>
      )}

      <div className="cs-body">
        <nav className="cs-nav" aria-label="Sections">
          <ol>
            {study.sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={active_section === section.id ? 'is-active' : ''}
                  onClick={(event) => HandleNavClick(event, section.id)}
                >
                  <span className="cs-nav-index">{Pad(i + 1)}</span>
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="cs-content">
          {study.sections.map((section, i) => (
            <section className="cs-section" id={section.id} key={section.id}>
              <FadeIn as="p" className="cs-section-label">
                <span className="cs-hex">{Pad(i + 1)}</span>
                {section.label}
              </FadeIn>
              <FadeIn as="h2" className="cs-section-title">
                {section.title}
              </FadeIn>
              {section.blocks.map((block, b) => (
                <Block block={block} key={b} />
              ))}
            </section>
          ))}

          <footer className="cs-footer">
            <a className="cs-exit" href="/" onClick={HandleBack}>
              <span className="cs-exit-wipe" aria-hidden="true" />
              <span className="cs-exit-label">Keep browsing</span>
              <span className="cs-exit-title">
                <span aria-hidden="true">←</span> Back to work
              </span>
            </a>
            <a className="cs-exit cs-exit--right" href={`mailto:${kEmail}`}>
              <span className="cs-exit-wipe" aria-hidden="true" />
              <span className="cs-exit-label">Like what you see?</span>
              <span className="cs-exit-title">
                Get in touch <span aria-hidden="true">→</span>
              </span>
            </a>
          </footer>
        </div>
      </div>
    </article>
  )
} //CaseStudy

export default CaseStudy
