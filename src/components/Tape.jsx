import { useEffect, useRef, useState } from 'react'
import '../styles/Tape.sass'
import kGithubIcon from '../assets/tape/github.svg'
import kLinkedinIcon from '../assets/tape/linkedin.png'
import { kGithubUrl, kLinkedinUrl } from '../data/contact'

// Settle times are how long the tape and background take to catch up to a
// new target, independent of frame rate
const kTiltConstrain = 50
const kTapeSettleMs = 1000
const kTapeSettleMsHover = 1700
const kBackgroundSettleMs = 500
const kBackgroundSettleMsHover = 1500
const kSettleEpsilon = 0.01

const kColorSpotStorageKey = 'tapeColorSpot'
const kDefaultColorSpot = '#E38157'
const kColorWheel = [
  '#360000',
  '#6B1111',
  '#96411C',
  '#C0633B',
  '#E38157',
  '#E3A357',
  '#F0BE74',
  '#8DC3DA',
  '#94ABB5',
  '#293C44',
]

////////////////////////////////////////////////////////////////////////////////
function ReadStoredColorSpot() {
  try {
    return localStorage.getItem(kColorSpotStorageKey) || kDefaultColorSpot
  } catch {
    return kDefaultColorSpot
  }
} //ReadStoredColorSpot

////////////////////////////////////////////////////////////////////////////////
function TiltAngles(client_x, client_y, box) {
  return {
    x: -(client_y - box.top - box.height / 2) / kTiltConstrain,
    y: (client_x - box.left - box.width / 2) / kTiltConstrain,
  }
} //TiltAngles

////////////////////////////////////////////////////////////////////////////////
function EaseToward(current, target, dt_ms, settle_ms) {
  const factor = 1 - Math.exp(-dt_ms / (settle_ms / 3))
  return current + (target - current) * factor
} //EaseToward

////////////////////////////////////////////////////////////////////////////////
function OpenExternal(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
} //OpenExternal

////////////////////////////////////////////////////////////////////////////////
function Tape() {
  const tilt_ref = useRef(null)
  const drop_ref = useRef(null)
  const hovering_ref = useRef(false)

  const [selected_color, SetSelectedColor] = useState(ReadStoredColorSpot)
  const [hover_color, SetHoverColor] = useState(null)

  useEffect(() => {
    const frame_id = requestAnimationFrame(() => {
      drop_ref.current?.classList.add('tape-drop--entered')
    })
    return () => cancelAnimationFrame(frame_id)
  }, [])

  // Eased in JS: a CSS transition retargeted every frame restarts its curve
  // and stutters
  useEffect(() => {
    const tilt_el = tilt_ref.current
    if (!tilt_el) return

    const skip_tilt =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    if (skip_tilt) return

    const background_el = document.querySelector('.background')

    let tilt_box = tilt_el.getBoundingClientRect()
    let background_box = background_el?.getBoundingClientRect() ?? null
    let boxes_stale = false

    const target_tilt = { x: 0, y: 0 }
    const current_tilt = { x: 0, y: 0 }
    const target_background = { x: 0, y: 0 }
    const current_background = { x: 0, y: 0 }

    // Loop state. The last pointer is kept so targets can be recomputed when
    // the page moves under a still cursor
    let frame_id = null
    let last_timestamp = null
    let pointer = null

    function Retarget() {
      const box = background_box ?? tilt_box
      const on_screen = box.bottom > 0 && box.top < window.innerHeight
      if (!pointer || !on_screen) {
        target_tilt.x = target_tilt.y = 0
        target_background.x = target_background.y = 0
        return
      }

      const tilt_target = TiltAngles(pointer.x, pointer.y, tilt_box)
      target_tilt.x = tilt_target.x
      target_tilt.y = tilt_target.y

      if (background_box) {
        const background_target =
          TiltAngles(pointer.x, pointer.y, background_box)
        target_background.x = background_target.x
        target_background.y = background_target.y
      }
    } //Retarget

    function Tick(timestamp) {
      frame_id = null
      const dt_ms = last_timestamp === null ? 16 : timestamp - last_timestamp
      last_timestamp = timestamp

      if (boxes_stale) {
        tilt_box = tilt_el.getBoundingClientRect()
        background_box = background_el?.getBoundingClientRect() ?? null
        boxes_stale = false
        Retarget()
      }

      const tape_settle_ms =
        hovering_ref.current ? kTapeSettleMsHover : kTapeSettleMs
      current_tilt.x =
        EaseToward(current_tilt.x, target_tilt.x, dt_ms, tape_settle_ms)
      current_tilt.y =
        EaseToward(current_tilt.y, target_tilt.y, dt_ms, tape_settle_ms)
      tilt_el.style.transform =
        `rotateX(${current_tilt.x}deg) rotateY(${current_tilt.y}deg)`

      let settled =
        Math.abs(target_tilt.x - current_tilt.x) < kSettleEpsilon &&
        Math.abs(target_tilt.y - current_tilt.y) < kSettleEpsilon

      if (background_el) {
        const background_settle_ms = hovering_ref.current
          ? kBackgroundSettleMsHover
          : kBackgroundSettleMs
        current_background.x = EaseToward(
          current_background.x,
          target_background.x,
          dt_ms,
          background_settle_ms
        )
        current_background.y = EaseToward(
          current_background.y,
          target_background.y,
          dt_ms,
          background_settle_ms
        )
        background_el.style.transform =
          `rotateX(${current_background.x}deg) ` +
          `rotateY(${current_background.y}deg)`

        settled =
          settled &&
          Math.abs(target_background.x - current_background.x) <
            kSettleEpsilon &&
          Math.abs(target_background.y - current_background.y) <
            kSettleEpsilon
      }

      if (!settled) {
        frame_id = requestAnimationFrame(Tick)
      } else {
        last_timestamp = null
      }
    } //Tick

    function EnsureLoop() {
      if (frame_id === null) {
        frame_id = requestAnimationFrame(Tick)
      }
    } //EnsureLoop

    function HandlePointerMove(event) {
      pointer = { x: event.clientX, y: event.clientY }
      Retarget()
      EnsureLoop()
    } //HandlePointerMove

    function HandleLayoutChange() {
      boxes_stale = true
      EnsureLoop()
    } //HandleLayoutChange

    window.addEventListener('mousemove', HandlePointerMove, { passive: true })
    window.addEventListener('resize', HandleLayoutChange, { passive: true })
    window.addEventListener('scroll', HandleLayoutChange, { passive: true })

    return () => {
      window.removeEventListener('mousemove', HandlePointerMove)
      window.removeEventListener('resize', HandleLayoutChange)
      window.removeEventListener('scroll', HandleLayoutChange)
      if (frame_id !== null) cancelAnimationFrame(frame_id)
    }
  }, [])

  // Storage can be unavailable (private browsing, quota); the pick then
  // just lasts for this visit
  function HandleColorSelect(color) {
    SetSelectedColor(color)
    try {
      localStorage.setItem(kColorSpotStorageKey, color)
    } catch {
      return
    }
  } //HandleColorSelect

  const color_spot = hover_color ?? selected_color

  return (
    <div className="tape-scale">
      <div
        ref={tilt_ref}
        className="tape-tilt"
        onMouseEnter={() => {
          hovering_ref.current = true
        }}
        onMouseLeave={() => {
          hovering_ref.current = false
        }}
      >
        <div ref={drop_ref} className="tape-drop">
          <svg
            className="tape-svg"
            width="758"
            height="394"
            viewBox="0 0 758 394"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="696"
              height="354"
              transform="matrix(1 0 0 -1 5 388)"
              fill="#F2F2F2"
            />
            <rect
              x="2.5"
              y="31.5"
              width="701"
              height="359"
              stroke="black"
              strokeWidth="5"
            />
            <rect x="5" y="157" width="696" height="3" fill="black" />
            <rect x="5" y="236" width="696" height="3" fill="black" />
            <rect x="5" y="315" width="696" height="3" fill="black" />
            <rect x="281" y="160" width="3" height="76" fill="black" />
            <rect x="514" y="239" width="3" height="76" fill="black" />
            <rect x="364" y="315" width="3" height="76" fill="black" />
            <rect x="534" y="315" width="3" height="76" fill="black" />
            <path d="M51 5H750L703.5 29H10L51 5Z" fill="#F2F2F2" />
            <path
              d="M752 360.756V7L706 33.5V387.5L752 360.756Z"
              fill="#F2F2F2"
            />
            <rect
              x="0.192627"
              y="29.3336"
              width="58.6673"
              height="4.61474"
              transform="rotate(-30 0.192627 29.3336)"
              fill="black"
            />
            <rect
              x="702"
              y="30"
              width="60"
              height="5"
              transform="rotate(-30 702 30)"
              fill="black"
            />
            <rect
              x="703.515"
              y="388.703"
              width="59.4053"
              height="5"
              transform="rotate(-30 703.515 388.703)"
              fill="black"
            />
            <rect x="51" width="706" height="5" fill="black" />
            <rect
              x="752"
              y="363"
              width="363"
              height="5"
              transform="rotate(-90 752 363)"
              fill="black"
            />
          </svg>

          <p className="tape-title">FEATURING</p>
          <p className="tape-name">
            JENS VAN
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;DER SLOOT
          </p>
          <p className="tape-whoisthat">Who's that?</p>
          <p className="tape-description">
            SOFTWARE DEVELOPER BASED IN LISSE, NL
          </p>
          <p className="tape-age">17.09.05</p>

          <div className="tape-colorwheel">
            {kColorWheel.map((color) => (
              <div
                key={color}
                className="tape-colorwheel-segment"
                style={{ backgroundColor: color }}
                onMouseEnter={() => SetHoverColor(color)}
                onMouseLeave={() => SetHoverColor(null)}
                onClick={() => HandleColorSelect(color)}
              />
            ))}
          </div>
          <div
            className="tape-colorspot"
            style={{ backgroundColor: color_spot }}
          />

          <div className="tape-hashtag">
            <p
              className="tape-hashtag-text tape-glitch"
              data-text="#MAKINGDREAMSCOMETRUE"
            >
              #MAKINGDREAMSCOMETRUE
            </p>
          </div>

          <img
            className="tape-link-icon tape-link-icon--github"
            src={kGithubIcon}
            alt="GitHub"
            role="button"
            onClick={() => OpenExternal(kGithubUrl)}
          />
          <img
            className="tape-link-icon tape-link-icon--linkedin"
            src={kLinkedinIcon}
            alt="LinkedIn"
            role="button"
            onClick={() => OpenExternal(kLinkedinUrl)}
          />
        </div>
      </div>
    </div>
  )
} //Tape

export default Tape
