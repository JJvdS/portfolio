// Canvas static for the glitch transition, with the page name picked out of
// the noise. The name is ink with red and blue fringes, so it reads on the
// white plate
const kMaskCell = 6
const kBandHeight = 18
const kNameFont = '"Changa One", sans-serif'

const kColors = ['#ff1f1f', '#1fff3f', '#2340ff']
const kNameColors = ['#ff1f1f', '#0d0d12', '#2340ff']
const kNameColorWeights = [0.25, 0.5, 0.25]

////////////////////////////////////////////////////////////////////////////////
function Random(min, max) {
  return min + Math.random() * (max - min)
} //Random

////////////////////////////////////////////////////////////////////////////////
function Chance(p) {
  return Math.random() < p
} //Chance

////////////////////////////////////////////////////////////////////////////////
function PickColor(weights) {
  const r = Math.random()
  if (r < weights[0]) return 0
  if (r < weights[0] + weights[1]) return 1
  return 2
} //PickColor

////////////////////////////////////////////////////////////////////////////////
function LayoutLines(ctx, text, width, height) {
  const max_width = width * 0.86

  function SizeFor(lines) {
    ctx.font = `100px ${kNameFont}`
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width))
    return Math.min((max_width / widest) * 100, (height * 0.62) / lines.length)
  } //SizeFor

  const single = [text]
  const single_size = SizeFor(single)
  const spaces = [...text.matchAll(/ /g)].map((m) => m.index)
  if (!spaces.length || single_size > height * 0.28) {
    return { lines: single, size: single_size }
  }

  const middle = text.length / 2
  const split = spaces.reduce((best, i) =>
    Math.abs(i - middle) < Math.abs(best - middle) ? i : best
  )
  const lines = [text.slice(0, split), text.slice(split + 1)]
  return { lines, size: SizeFor(lines) }
} //LayoutLines

////////////////////////////////////////////////////////////////////////////////
function BuildNameCells(name, width, height) {
  const cols = Math.ceil(width / kMaskCell)
  const rows = Math.ceil(height / kMaskCell)
  const mask = document.createElement('canvas')
  mask.width = cols
  mask.height = rows
  const ctx = mask.getContext('2d', { willReadFrequently: true })

  const { lines, size } = LayoutLines(ctx, name.toUpperCase(), cols, rows)
  ctx.font = `${size}px ${kNameFont}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  const line_height = size * 0.92
  lines.forEach((line, i) => {
    const y = rows / 2 + (i - (lines.length - 1) / 2) * line_height
    ctx.fillText(line, cols / 2, y)
  })

  const { data } = ctx.getImageData(0, 0, cols, rows)
  const cells = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (data[(y * cols + x) * 4 + 3] > 120) {
        cells.push(x * kMaskCell, y * kMaskCell)
      }
    }
  }
  return cells
} //BuildNameCells

////////////////////////////////////////////////////////////////////////////////
export function CreateSignalStorm(canvas, name) {
  const width = window.innerWidth
  const height = window.innerHeight
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const cells = name ? BuildNameCells(name, width, height) : []
  const cell_count = cells.length / 2
  const band_offsets = new Float32Array(Math.ceil(height / kBandHeight))
  let bars = []
  let frame = 0

  // backdrop: how opaque the white behind the noise is (0..1)
  // density:  how much static there is overall (0..1)
  // reveal:   how strongly the name stands out of it (0..1)
  // split:    px the name's red/blue channels drift apart
  function Draw({ backdrop, density, reveal, split }) {
    frame++
    ctx.clearRect(0, 0, width, height)
    if (backdrop > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${backdrop})`
      ctx.fillRect(0, 0, width, height)
    }
    if (density <= 0) return

    if (frame % 3 === 0) {
      for (let i = 0; i < band_offsets.length; i++) {
        band_offsets[i] = Chance(0.22)
          ? Random(-70, 70) * (0.4 + reveal * 0.6)
          : 0
      }
    }

    const paths = [new Path2D(), new Path2D(), new Path2D()]
    const name_paths = [new Path2D(), new Path2D(), new Path2D()]

    const static_count = Math.round(
      ((width * height) / 170) * density * (1 - reveal * 0.72)
    )
    for (let n = 0; n < static_count; n++) {
      const w = Chance(0.06) ? Random(24, 70) : Random(2, 16)
      const h = Chance(0.7) ? 1 : 2
      paths[Math.floor(Math.random() * 3)].rect(
        Random(-20, width),
        Random(0, height),
        w,
        h
      )
    }

    // Each streak lays a white slab underneath so the name stays readable over
    // busy pages
    const plate = new Path2D()
    if (reveal > 0 && cell_count) {
      const name_count = Math.round(
        Math.min(cell_count * 1.1, 7000) * reveal * density
      )
      for (let n = 0; n < name_count; n++) {
        const c = Math.floor(Math.random() * cell_count) * 2
        const x = cells[c] + Random(-2, kMaskCell)
        const y = cells[c + 1] + Random(0, kMaskCell)
        const color = PickColor(kNameColorWeights)
        const fringe = color === 0 ? split : color === 2 ? -split : 0
        const shift = band_offsets[Math.floor(y / kBandHeight)] + fringe
        const w = Random(4, 14)
        name_paths[color].rect(x + shift, y, w, Chance(0.5) ? 2 : 3)
        plate.rect(x + shift - 3, y - 2, w + 6, 6)
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * reveal})`
      ctx.fill(plate)
    }

    kColors.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.fill(paths[i])
    })
    kNameColors.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.fill(name_paths[i])
    })

    if (Chance(0.45 * density)) {
      bars.push({
        y: Random(0, height),
        h: Chance(0.7) ? Random(3, 16) : Random(18, 46),
        length: Random(0.12, 0.6) * width,
        from_left: Chance(0.65),
        color: Math.floor(Math.random() * 3),
        life: Math.round(Random(2, 7)),
      })
    }
    bars = bars.filter((bar) => bar.life-- > 0)
    for (const bar of bars) {
      const x0 = bar.from_left ? 0 : width
      const x1 = bar.from_left ? bar.length : width - bar.length
      const gradient = ctx.createLinearGradient(x0, 0, x1, 0)
      gradient.addColorStop(0, kColors[bar.color])
      gradient.addColorStop(0.55, kColors[bar.color])
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(Math.min(x0, x1), bar.y, bar.length, bar.h * density)
    }
  } //Draw

  return { Draw }
} //CreateSignalStorm
