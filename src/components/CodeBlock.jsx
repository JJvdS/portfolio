import { useState } from 'react'

const kCppKeywords = new Set([
  'auto', 'bool', 'break', 'char', 'class', 'const', 'continue', 'else',
  'false', 'for', 'if', 'int', 'private', 'public', 'return', 'true', 'void',
  'while',
])

// Order matters: earlier alternatives win, so comments and strings are
// claimed before keywords inside them
const kTokenPatterns = {
  cpp: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['string', /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])'/y],
    ['meta', /#\s*\w+[^\n]*/y],
    ['number', /\b\d+\b/y],
    ['type', /\bstd::\w+|\b[A-Z]\w*\b(?!\()/y],
    ['ident', /\b[a-zA-Z_]\w*\b/y],
    ['op', /::|<<|>>|&&|\|\||[=!<>]=?|[+\-*/%?:]/y],
  ],
  make: [
    ['comment', /#[^\n]*/y],
    ['string', /\$\([^)]*\)|\$[@<^]/y],
    ['type', /^[\w./%-]+(?=\s*:)/my],
    ['ident', /^[A-Z]+(?=\s*=)/my],
    ['op', /-[A-Za-z]+\w*|[|=:]/y],
  ],
}

// Longer listings start folded, so the story isn't buried under code
const kFoldAfter = 16
const kFoldedLines = 11

////////////////////////////////////////////////////////////////////////////////
function Tokenize(code, lang) {
  const patterns = kTokenPatterns[lang]
  if (!patterns) return [['plain', code]]

  const tokens = []
  let plain = ''
  let i = 0

  while (i < code.length) {
    let matched = null
    for (const [kind, regex] of patterns) {
      regex.lastIndex = i
      const m = regex.exec(code)
      if (m && m[0].length > 0) {
        matched = [kind, m[0]]
        break
      }
    }

    if (!matched) {
      plain += code[i]
      i++
      continue
    }

    let [kind, text] = matched
    if (kind === 'ident') {
      if (lang === 'cpp' && kCppKeywords.has(text)) kind = 'keyword'
      else if (code[i + text.length] === '(') kind = 'fn'
      else if (lang === 'make') kind = 'keyword'
      else kind = 'plain'
    }

    if (plain) tokens.push(['plain', plain])
    plain = ''
    tokens.push([kind, text])
    i += text.length
  }

  if (plain) tokens.push(['plain', plain])
  return tokens
} //Tokenize

////////////////////////////////////////////////////////////////////////////////
function CodeBlock({ code, lang, file, terminal = false }) {
  const [copied, SetCopied] = useState(false)
  const all_lines = code.split('\n')
  const foldable = all_lines.length > kFoldAfter
  const [open, SetOpen] = useState(!foldable)
  const lines = open ? all_lines : all_lines.slice(0, kFoldedLines)
  const figure_class =
    'code' +
    (terminal ? ' code--terminal' : '') +
    (open ? '' : ' code--folded')

  // Clipboard can be blocked (insecure origin, permissions); then the
  // button just stays as it is
  async function HandleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      SetCopied(true)
      setTimeout(() => SetCopied(false), 1600)
    } catch {
      return
    }
  } //HandleCopy

  return (
    <figure className={figure_class}>
      <figcaption className="code-bar">
        <span className="code-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="code-file">{terminal ? 'zsh — ./game' : file}</span>
        {!terminal && (
          <button type="button" className="code-copy" onClick={HandleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </figcaption>
      <pre className="code-body">
        <code>
          {lines.map((line, n) => (
            <span className="code-line" key={n}>
              {!terminal && (
                <span className="code-ln" aria-hidden="true">
                  {n + 1}
                </span>
              )}
              <span className="code-text">
                {terminal
                  ? line || ' '
                  : Tokenize(line, lang).map(([kind, text], t) =>
                      kind === 'plain' ? (
                        text
                      ) : (
                        <span key={t} className={`tok-${kind}`}>
                          {text}
                        </span>
                      )
                    )}
                {!terminal && !line && ' '}
              </span>
            </span>
          ))}
        </code>
      </pre>
      {foldable && (
        <button
          type="button"
          className="code-fold"
          onClick={() => SetOpen(!open)}
          aria-expanded={open}
        >
          {open ? 'Show less' : `Show all ${all_lines.length} lines`}
          <span aria-hidden="true">{open ? '↑' : '↓'}</span>
        </button>
      )}
    </figure>
  )
} //CodeBlock

export default CodeBlock
