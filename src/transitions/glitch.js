// Glitch page transition: an RGB-split SVG filter over the view-transition
// snapshots, plus a signal-storm overlay that spells out the page name
import '../styles/Glitch.sass'
import { CreateSignalStorm } from './signalStorm'

// kDurationMs matches $duration in Glitch.sass
const kDurationMs = 1000
const kSvgNs = 'http://www.w3.org/2000/svg'

// Phases on the shared timeline, in ms: the name starts surfacing, is fully
// readable, the page underneath cuts to the new one, the name starts breaking
// up and is gone, and finally the glitching has died down
const kNameIn = 180
const kNameHeld = 360
const kSwap = 480
const kNameOut = 640
const kNameGone = 760
const kSettled = 920

// Module state: the shared filter, built once. Only Chromium can filter
// view-transition snapshots; Firefox drops filtered snapshots entirely, so
// the page would vanish behind the noise
let filter = null
const snapshot_filter_supported = 'userAgentData' in navigator

////////////////////////////////////////////////////////////////////////////////
function SvgElement(name, attrs = {}, children = []) {
  const node = document.createElementNS(kSvgNs, name)
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value)
  }
  children.forEach((child) => node.appendChild(child))
  return node
} //SvgElement

////////////////////////////////////////////////////////////////////////////////
function Channel(r, g, b) {
  return `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`
} //Channel

////////////////////////////////////////////////////////////////////////////////
function EnsureFilter() {
  if (filter) return filter
  // A hot reload leaves the old <svg> in the page, and url(#glitch-rgb) would
  // keep resolving to it. Replace it
  document
    .querySelectorAll('.glitch-filter-defs')
    .forEach((node) => node.remove())

  const turbulence = SvgElement('feTurbulence', {
    type: 'fractalNoise',
    baseFrequency: '0 0.035',
    numOctaves: 1,
    seed: 1,
  })
  const displacement = SvgElement('feDisplacementMap', {
    in: 'SourceGraphic',
    in2: 'bands',
    scale: 0,
    xChannelSelector: 'R',
    yChannelSelector: 'A',
    result: 'torn',
  })
  const red_offset = SvgElement('feOffset', {
    in: 'red',
    dx: 0,
    dy: 0,
    result: 'red-shifted',
  })
  const blue_offset = SvgElement('feOffset', {
    in: 'blue',
    dx: 0,
    dy: 0,
    result: 'blue-shifted',
  })
  const brightness = ['feFuncR', 'feFuncG', 'feFuncB'].map((name) =>
    SvgElement(name, { type: 'linear', slope: 1 })
  )

  const filter_attrs = {
    id: 'glitch-rgb',
    x: '-5%',
    y: '0%',
    width: '110%',
    height: '100%',
    'color-interpolation-filters': 'sRGB',
  }
  const bands_table = '0.5 0.5 0.1 0.5 0.9 0.5 0.5 0.3 0.5 0.75 0.5'

  // Alpha is pinned to 0.5 so the vertical displacement (driven by A) is zero
  const svg = SvgElement(
    'svg',
    { 'aria-hidden': 'true', class: 'glitch-filter-defs' },
    [
      SvgElement('filter', filter_attrs, [
        turbulence,
        SvgElement('feComponentTransfer', { result: 'bands' }, [
          SvgElement('feFuncR', { type: 'discrete', tableValues: bands_table }),
          SvgElement('feFuncA', { type: 'linear', slope: 0, intercept: 0.5 }),
        ]),
        displacement,
        SvgElement('feColorMatrix', {
          in: 'torn',
          type: 'matrix',
          values: Channel(1, 0, 0),
          result: 'red',
        }),
        SvgElement('feColorMatrix', {
          in: 'torn',
          type: 'matrix',
          values: Channel(0, 1, 0),
          result: 'green',
        }),
        SvgElement('feColorMatrix', {
          in: 'torn',
          type: 'matrix',
          values: Channel(0, 0, 1),
          result: 'blue',
        }),
        red_offset,
        blue_offset,
        SvgElement('feBlend', {
          in: 'red-shifted',
          in2: 'green',
          mode: 'screen',
          result: 'rg',
        }),
        SvgElement('feBlend', {
          in: 'rg',
          in2: 'blue-shifted',
          mode: 'screen',
          result: 'rgb',
        }),
        SvgElement('feComponentTransfer', { in: 'rgb' }, brightness),
      ]),
    ]
  )
  document.body.appendChild(svg)

  filter = { turbulence, displacement, red_offset, blue_offset, brightness }
  return filter
} //EnsureFilter

////////////////////////////////////////////////////////////////////////////////
function SetFilter({ split = 0, split_y = 0, tear = 0, seed, glow = 1 }) {
  const f = EnsureFilter()
  f.red_offset.setAttribute('dx', split)
  f.red_offset.setAttribute('dy', split_y)
  f.blue_offset.setAttribute('dx', -split)
  f.blue_offset.setAttribute('dy', -split_y)
  f.displacement.setAttribute('scale', tear)
  if (seed !== undefined) f.turbulence.setAttribute('seed', seed)
  f.brightness.forEach((fn) => fn.setAttribute('slope', glow))
} //SetFilter

////////////////////////////////////////////////////////////////////////////////
function Random(min, max) {
  return min + Math.random() * (max - min)
} //Random

////////////////////////////////////////////////////////////////////////////////
function Chance(p) {
  return Math.random() < p
} //Chance

////////////////////////////////////////////////////////////////////////////////
function Ramp(t, from, to) {
  return Math.min(1, Math.max(0, (t - from) / (to - from)))
} //Ramp

////////////////////////////////////////////////////////////////////////////////
function IntensityAt(t) {
  if (t < kSwap) return 0.15 + Ramp(t, 0, kSwap) * 0.85
  return 1 - Ramp(t, kSwap, kSettled)
} //IntensityAt

////////////////////////////////////////////////////////////////////////////////
function GlowAt(t) {
  if (t >= kSwap - 20 && t < kSwap + 80) {
    return 1.9 - Ramp(t, kSwap - 20, kSwap + 80) * 0.9
  }
  return 1
} //GlowAt

////////////////////////////////////////////////////////////////////////////////
function StormAt(t) {
  const reveal =
    Ramp(t, kNameIn, kNameHeld) * (1 - Ramp(t, kNameOut, kNameGone))
  return {
    backdrop: 0.45 * reveal,
    density: 0.75 * Ramp(t, 0, 260) * (1 - Ramp(t, kNameOut, kSettled)),
    reveal,
    split: 4 + (1 - reveal) * 18 + (Chance(0.15) ? Random(10, 26) : 0),
  }
} //StormAt

////////////////////////////////////////////////////////////////////////////////
function BuildOverlay(label) {
  const overlay = document.createElement('div')
  overlay.className = 'glitch-fx'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.innerHTML = `
    <canvas class="glitch-fx-storm"></canvas>
    <span class="glitch-fx-scanlines"></span>
    <span class="glitch-fx-tag"></span>
  `
  overlay.querySelector('.glitch-fx-tag').textContent =
    `> ${label ?? 'loading'}`
  return overlay
} //BuildOverlay

////////////////////////////////////////////////////////////////////////////////
// Called before startViewTransition, so the overlay is in place when the old
// page is snapshotted
export function PrepareGlitch({ label, name } = {}) {
  EnsureFilter()
  SetFilter({})
  const root = document.documentElement
  const overlay = BuildOverlay(label)
  document.body.appendChild(overlay)
  const storm = CreateSignalStorm(
    overlay.querySelector('.glitch-fx-storm'),
    name
  )
  root.dataset.transition = 'glitch'
  if (snapshot_filter_supported) root.dataset.glitchRgb = ''

  let frame_id = null

  function Cleanup() {
    cancelAnimationFrame(frame_id)
    SetFilter({})
    overlay.remove()
    delete root.dataset.transition
    delete root.dataset.glitchRgb
  } //Cleanup

  function Attach(transition) {
    transition.ready
      .then(() => {
        const start = performance.now()
        let frame = 0

        function Tick(now) {
          const t = now - start
          const k = IntensityAt(t)
          frame++
          const spike = Chance(0.35) ? Random(1.4, 2.4) : 1
          const tearing = k > 0 && Chance(0.6)
          SetFilter({
            split: (k * Random(6, 16) * spike).toFixed(1),
            split_y: Chance(0.2) ? (k * Random(-4, 4)).toFixed(1) : 0,
            tear: tearing ? (k * Random(30, 110) * spike).toFixed(0) : 0,
            seed: frame % 3 === 0 ? Math.floor(Random(1, 999)) : undefined,
            glow: GlowAt(t),
          })
          storm.Draw(StormAt(t))
          if (t < kDurationMs) frame_id = requestAnimationFrame(Tick)
        } //Tick

        frame_id = requestAnimationFrame(Tick)
      })
      .catch(() => {})
    transition.finished.finally(Cleanup)
  } //Attach

  return { Attach }
} //PrepareGlitch
