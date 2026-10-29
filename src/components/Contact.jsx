import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import '../styles/Contact.sass'
import FadeIn from './FadeIn'
import ScatterHeadline from './ScatterHeadline'
import { useScramble } from './Scramble'
import { GlideTo } from '../smoothScroll'
import { IsPhone } from '../breakpoints'
import { kCallRequestHref, kEmail, kLinkedinUrl } from '../data/contact'

const kDesignWidth = 1913
const kMinDesignHeight = 1000
const kFillViewportMinWidth = 900

const kHeadline = [
  { text: 'IT’S ABOUT TIME', stagger: 1.4, spins: 10 },
  {
    text: 'WE GET IN TOUCH.',
    stagger: 1.4,
    spins: 16,
    className: 'headline-line--outline',
  },
]

// [fromHour, untilHour, callable, note], in NL time
const kDaySlots = [
  [
    0,
    6,
    false,
    'It’s the middle of the night here. I’m asleep, so drop me a mail and ' +
      'I’ll answer over breakfast.',
  ],
  [
    6,
    9,
    false,
    'Still waking up, coffee first. Send a mail, or request a call for ' +
      'after 9.',
  ],
  [
    9,
    11,
    true,
    'Perfect timing, I’m at my desk. Request a call and I’ll ring you right ' +
      'back.',
  ],
  [
    11,
    13,
    false,
    'Lunch break, broodje kaas in hand. Request a call for after 1, or send ' +
      'a mail.',
  ],
  [
    13,
    17,
    true,
    'Back at my desk and caffeinated. Request a call and I’ll ring you ' +
      'right back.',
  ],
  [17, 20, false, 'Off the clock and probably cooking. A mail will find me.'],
  [
    20,
    24,
    false,
    'It’s quite late here. How about you send me a mail instead?',
  ],
]

const kPanelMinScale = 0.95
const kPanelMaxRadiusPx = 100
const kPanelMaxRadiusPxPhone = 32

const kClockSize = 560
const kClockC = kClockSize / 2
const kHourTagRadius = 150
const kMinuteTagRadius = 214

const kNlTimeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
})

////////////////////////////////////////////////////////////////////////////////
function GetDaySlot(hour) {
  const [, , callable, note] = kDaySlots.find(
    ([from, until]) => hour >= from && hour < until
  )
  return { callable, note }
} //GetDaySlot

////////////////////////////////////////////////////////////////////////////////
function GetNlTime() {
  const now = new Date()
  const parts = Object.fromEntries(
    kNlTimeFormat.formatToParts(now).map((p) => [p.type, p.value])
  )
  return {
    h: Number(parts.hour),
    m: Number(parts.minute),
    s: Number(parts.second),
    ms: now.getMilliseconds(),
  }
} //GetNlTime

////////////////////////////////////////////////////////////////////////////////
function Pad(n) {
  return String(n).padStart(2, '0')
} //Pad

////////////////////////////////////////////////////////////////////////////////
function Channel({
  index,
  via,
  reply,
  destination,
  href,
  label,
  status,
  tone,
  external,
  tick,
}) {
  const [hover_tick, SetHoverTick] = useState(0)
  const [active, SetActive] = useState(false)
  const text = useScramble(destination.toUpperCase(), tick + hover_tick, {
    stagger: 0.8,
    spins: 6,
  })

  function Enter() {
    SetActive(true)
    SetHoverTick((t) => t + 1)
  } //Enter

  return (
    <a
      className={`channel${active ? ' channel--active' : ''}`}
      href={href}
      aria-label={label}
      onMouseEnter={Enter}
      onMouseLeave={() => SetActive(false)}
      onFocus={Enter}
      onBlur={() => SetActive(false)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="channel-wipe" aria-hidden="true" />
      <span className="channel-index">{index}</span>
      <span className="channel-via">
        {via}
        <span className="channel-reply">reply {reply}</span>
      </span>
      <span className="channel-destination" aria-hidden="true">
        {text}
      </span>
      <span className={`channel-status channel-status--${tone}`}>
        <span className="channel-status-dot" />
        {status}
      </span>
      <span className="channel-enter" aria-hidden="true">
        Say hi →
      </span>
    </a>
  )
} //Channel

////////////////////////////////////////////////////////////////////////////////
function PlaceTag(el, degrees, radius) {
  if (!el) return
  const rad = (degrees * Math.PI) / 180
  el.style.left = `${kClockC + Math.sin(rad) * radius}px`
  el.style.top = `${kClockC - Math.cos(rad) * radius}px`
} //PlaceTag

////////////////////////////////////////////////////////////////////////////////
function Rotate(degrees) {
  return `rotate(${degrees} ${kClockC} ${kClockC})`
} //Rotate

////////////////////////////////////////////////////////////////////////////////
function Clock({ time, on_second }) {
  const hour_ref = useRef(null)
  const minute_ref = useRef(null)
  const second_ref = useRef(null)
  const sweep_ref = useRef(null)
  const hour_tag_ref = useRef(null)
  const minute_tag_ref = useRef(null)

  useEffect(() => {
    let frame
    let last_second = -1

    function Tick() {
      const { h, m, s, ms } = GetNlTime()
      const smooth_s = s + ms / 1000
      const hour_deg = ((h % 12) + m / 60) * 30
      const minute_deg = (m + smooth_s / 60) * 6
      hour_ref.current?.setAttribute('transform', Rotate(hour_deg))
      minute_ref.current?.setAttribute('transform', Rotate(minute_deg))
      second_ref.current?.setAttribute('transform', Rotate(smooth_s * 6))
      if (sweep_ref.current) {
        sweep_ref.current.style.transform = `rotate(${smooth_s * 6}deg)`
      }
      PlaceTag(hour_tag_ref.current, hour_deg, kHourTagRadius)
      PlaceTag(minute_tag_ref.current, minute_deg, kMinuteTagRadius)
      if (s !== last_second) {
        last_second = s
        on_second({ h, m, s })
      }
      frame = requestAnimationFrame(Tick)
    } //Tick

    Tick()
    return () => cancelAnimationFrame(frame)
  }, [on_second])

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const is_hour = i % 5 === 0
    return (
      <line
        key={i}
        className={is_hour ? 'clock-tick clock-tick--hour' : 'clock-tick'}
        x1={kClockC}
        y1={kClockC - 232}
        x2={kClockC}
        y2={kClockC - (is_hour ? 204 : 220)}
        transform={Rotate(i * 6)}
      />
    )
  })

  return (
    <div className="clock-wrap">
      <span className="clock-sweep" ref={sweep_ref} />
      <svg
        className="clock"
        viewBox={`0 0 ${kClockSize} ${kClockSize}`}
        aria-hidden="true"
      >
        <line
          className="clock-guide"
          x1={-40}
          y1={kClockC}
          x2={kClockSize + 40}
          y2={kClockC}
        />
        <line
          className="clock-guide"
          x1={kClockC}
          y1={-40}
          x2={kClockC}
          y2={kClockSize + 40}
        />
        <circle className="clock-ring" cx={kClockC} cy={kClockC} r="80" />
        <circle className="clock-ring" cx={kClockC} cy={kClockC} r="160" />
        <circle className="clock-face" cx={kClockC} cy={kClockC} r="236" />
        <circle className="clock-orbit" cx={kClockC} cy={kClockC} r="268" />
        {ticks}
        <line
          ref={hour_ref}
          className="clock-hand clock-hand--hour"
          x1={kClockC}
          y1={kClockC + 18}
          x2={kClockC}
          y2={kClockC - 116}
        />
        <line
          ref={minute_ref}
          className="clock-hand clock-hand--minute"
          x1={kClockC}
          y1={kClockC + 24}
          x2={kClockC}
          y2={kClockC - 184}
        />
        <g ref={second_ref}>
          <line
            className="clock-hand clock-hand--second"
            x1={kClockC}
            y1={kClockC + 34}
            x2={kClockC}
            y2={kClockC - 252}
          />
          <circle
            className="clock-second-ring"
            cx={kClockC}
            cy={kClockC - 268}
            r="14"
          />
          <circle
            className="clock-second-dot"
            cx={kClockC}
            cy={kClockC - 268}
            r="6"
          />
        </g>
        <circle className="clock-pin" cx={kClockC} cy={kClockC} r="7" />
      </svg>
      <span className="clock-tag clock-tag--hour" ref={hour_tag_ref}>
        <span className="clock-tag-value">{Pad(time.h)}</span>
        <span className="clock-tag-unit">hrs</span>
      </span>
      <span className="clock-tag clock-tag--minute" ref={minute_tag_ref}>
        <span className="clock-tag-value">{Pad(time.m)}</span>
        <span className="clock-tag-unit">min</span>
      </span>
    </div>
  )
} //Clock

////////////////////////////////////////////////////////////////////////////////
function Contact() {
  const section_ref = useRef(null)
  const panel_ref = useRef(null)
  const viewport_ref = useRef(null)
  const [scale, SetScale] = useState(1)
  const [design_height, SetDesignHeight] = useState(kMinDesignHeight)
  const [phone, SetPhone] = useState(IsPhone)
  const [clock_scale, SetClockScale] = useState(1)
  const [tick, SetTick] = useState(0)
  const [time, SetTime] = useState(() => GetNlTime())

  useLayoutEffect(() => {
    const viewport_el = viewport_ref.current
    if (!viewport_el) return

    function Update() {
      const next_phone = IsPhone()
      SetPhone(next_phone)
      SetClockScale(Math.min(1, (viewport_el.offsetWidth - 40) / kClockSize))
      if (next_phone) return
      const next_scale = viewport_el.offsetWidth / kDesignWidth
      const fill =
        window.innerWidth >= kFillViewportMinWidth
          ? window.innerHeight / next_scale
          : 0
      SetScale(next_scale)
      SetDesignHeight(Math.max(fill, kMinDesignHeight))
    } //Update

    Update()
    const observer = new ResizeObserver(Update)
    observer.observe(viewport_el)
    window.addEventListener('resize', Update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', Update)
    }
  }, [])

  useEffect(() => {
    const section_el = section_ref.current
    const panel_el = panel_ref.current
    if (!section_el || !panel_el) return

    function HandleScroll() {
      const { top } = section_el.getBoundingClientRect()
      const range = window.innerHeight * 0.8
      const progress = Math.min(
        Math.max((window.innerHeight - top) / range, 0),
        1
      )
      const max_radius =
        IsPhone() ? kPanelMaxRadiusPxPhone : kPanelMaxRadiusPx
      const scale = kPanelMinScale + (1 - kPanelMinScale) * progress
      panel_el.style.transform = `scale(${scale})`
      panel_el.style.borderRadius = `${max_radius * (1 - progress)}px`
    } //HandleScroll

    HandleScroll()
    window.addEventListener('scroll', HandleScroll, { passive: true })
    window.addEventListener('resize', HandleScroll)
    return () => {
      window.removeEventListener('scroll', HandleScroll)
      window.removeEventListener('resize', HandleScroll)
    }
  }, [])

  useEffect(() => {
    const el = section_ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) SetTick((t) => t + 1)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { callable, note } = GetDaySlot(time.h)
  const viewport_style = phone
    ? { '--clock-scale': clock_scale }
    : { height: design_height * scale }
  const canvas_style = phone
    ? undefined
    : { height: design_height, transform: `scale(${scale})` }

  return (
    <section className="contact" id="contact" ref={section_ref}>
      <div className="contact-panel" ref={panel_ref}>
        <div
          className="contact-viewport"
          ref={viewport_ref}
          style={viewport_style}
        >
          <div className="contact-canvas" style={canvas_style}>
            <header className="contact-header">
              <FadeIn as="p" className="contact-eyebrow">
                <span className="contact-eyebrow-dot" />
                04 // Contact
              </FadeIn>
              <FadeIn as="p" className="contact-stats">
                03 channels <span>·</span> Lisse, NL <span>·</span>{' '}
                {callable ? 'At my desk' : 'Away from my desk'}
              </FadeIn>
            </header>

            <div className="contact-main">
              <div className="contact-clock">
                <FadeIn className="contact-clock-body">
                  <span className="contact-clock-sr">
                    Local time in the Netherlands: {Pad(time.h)}:{Pad(time.m)}
                  </span>
                  <Clock time={time} on_second={SetTime} />
                  <span className="contact-clock-zone">
                    Local time · Lisse, NL
                  </span>
                </FadeIn>

                <FadeIn
                  className="contact-note contact-note--clock"
                  aria-hidden="true"
                >
                  <span className="contact-note-text">that’s my time btw</span>
                  <svg className="contact-note-arrow" viewBox="0 0 90 90">
                    <path d="M58 6 C 64 28, 56 46, 25 61" />
                    <path d="M25 61 L 40 62 M25 61 L 33 49" />
                  </svg>
                </FadeIn>

                <FadeIn
                  className={
                    `contact-status${callable ? ' contact-status--go' : ''}`
                  }
                >
                  <span className="contact-status-label">
                    <span className="contact-status-dot" />
                    {callable ? 'On the clock' : 'Off the clock'}
                  </span>
                  <p className="contact-status-note">{note}</p>
                </FadeIn>
              </div>

              <div className="contact-right">
                <FadeIn>
                  <ScatterHeadline
                    className="contact-heading"
                    lines={kHeadline}
                    trigger={tick}
                  />
                </FadeIn>

                <FadeIn className="channels">
                  <div className="channels-header" aria-hidden="true">
                    <span>No.</span>
                    <span>Via</span>
                    <span>Where</span>
                    <span>Status</span>
                  </div>
                  <Channel
                    index="01"
                    via="Call"
                    reply="on request"
                    destination="Request a call"
                    href={kCallRequestHref}
                    label="Request a call by email"
                    status={callable ? 'Online' : 'Delayed'}
                    tone={callable ? 'go' : 'wait'}
                    tick={tick}
                  />
                  <Channel
                    index="02"
                    via="Mail"
                    reply="< 24h"
                    destination={kEmail}
                    href={`mailto:${kEmail}`}
                    label={`Email ${kEmail}`}
                    status="Always on"
                    tone="go"
                    tick={tick}
                  />
                  <Channel
                    index="03"
                    via="LinkedIn"
                    reply="< 48h"
                    destination="in/jensvandersloot"
                    href={kLinkedinUrl}
                    label="LinkedIn profile: jensvandersloot"
                    status="Open"
                    tone="go"
                    external
                    tick={tick}
                  />

                  <div
                    className="contact-note contact-note--channels"
                    aria-hidden="true"
                  >
                    <span className="contact-note-text">
                      just pick one, I don’t bite
                    </span>
                    <svg className="contact-note-arrow" viewBox="0 0 60 46">
                      <path d="M56 40 C 34 40, 14 30, 10 6" />
                      <path d="M10 6 L 4 18 M10 6 L 19 15" />
                    </svg>
                  </div>
                </FadeIn>
              </div>
            </div>

            <footer className="contact-footer">
              <span>© {new Date().getFullYear()} Jens van der Sloot</span>
              <span>Designed &amp; developed in Lisse, NL</span>
              <span className="contact-footer-eof">
                Built with React, GSAP &amp; Vite
                <span className="caret" />
              </span>
              <button
                type="button"
                className="contact-top"
                onClick={() => GlideTo(0)}
              >
                Back to top ↑
              </button>
            </footer>
          </div>
        </div>
      </div>
    </section>
  )
} //Contact

export default Contact
