import { useEffect, useState } from 'react'

const kGlyphs = '!<>-_\\/[]{}=+*^?#$%&01ABCDEF'
const kFrameMs = 28

////////////////////////////////////////////////////////////////////////////////
function RandomGlyph() {
  return kGlyphs[Math.floor(Math.random() * kGlyphs.length)]
} //RandomGlyph

////////////////////////////////////////////////////////////////////////////////
function PrefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
} //PrefersReducedMotion

////////////////////////////////////////////////////////////////////////////////
export function useScramble(text, trigger, { stagger = 1.6, spins = 8 } = {}) {
  const [output, SetOutput] = useState(text)

  useEffect(() => {
    if (!trigger || PrefersReducedMotion()) {
      SetOutput(text)
      return
    }

    let frame = 0
    const last_frame = Math.ceil(text.length * stagger) + spins
    const id = setInterval(() => {
      frame++
      SetOutput(
        text
          .split('')
          .map((ch, i) =>
            ch === ' ' || frame >= i * stagger + spins ? ch : RandomGlyph()
          )
          .join('')
      )
      if (frame >= last_frame) clearInterval(id)
    }, kFrameMs)
    return () => clearInterval(id)
  }, [text, trigger, stagger, spins])

  return output
} //useScramble

////////////////////////////////////////////////////////////////////////////////
function Scramble({ text, trigger, as: Tag = 'span', className, ...options }) {
  const output = useScramble(text, trigger, options)
  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{output}</span>
    </Tag>
  )
} //Scramble

export default Scramble
