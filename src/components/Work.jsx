import { useEffect } from 'react'
import '../styles/CaseStudy.sass'
import '../styles/Work.sass'
import { kCallRequestHref, kEmail, kLinkedinUrl } from '../data/contact'
import kProjects from '../data/projects'
import { Back } from '../router'
import FadeIn from './FadeIn'
import DotField from './DotField'
import Projects from './Projects'
import ScatterHeadline from './ScatterHeadline'

const kChannels = [
  {
    via: 'Mail',
    reply: 'reply < 24h',
    destination: kEmail,
    href: `mailto:${kEmail}`,
  },
  {
    via: 'Call',
    reply: 'on request',
    destination: 'Request a call',
    href: kCallRequestHref,
  },
  {
    via: 'LinkedIn',
    reply: 'reply < 48h',
    destination: 'in/jensvandersloot',
    href: kLinkedinUrl,
    external: true,
  },
]

// Module-level so ScatterHeadline doesn't rebind its listeners every render
const kContactHeadline = [
  { text: 'Seen enough?' },
  { text: 'Let’s talk.', className: 'headline-line--outline' },
]

const kExternalLinkProps = { target: '_blank', rel: 'noopener noreferrer' }

////////////////////////////////////////////////////////////////////////////////
function Work() {
  useEffect(() => {
    const previous_title = document.title
    document.title = 'Work · Jens van der Sloot'
    document.documentElement.classList.add('is-case-study')
    return () => {
      document.title = previous_title
      document.documentElement.classList.remove('is-case-study')
    }
  }, [])

  function Leave() {
    Back('/', { effect: 'glitch', label: 'back // home', name: 'Home' })
  } //Leave

  function HandleBack(event) {
    event.preventDefault()
    Leave()
  } //HandleBack

  useEffect(() => {
    function HandleKeyDown(event) {
      if (event.key === 'Escape' && !event.defaultPrevented) Leave()
    } //HandleKeyDown

    window.addEventListener('keydown', HandleKeyDown)
    return () => window.removeEventListener('keydown', HandleKeyDown)
  })

  return (
    <div className="work-page">
      <header className="cs-topbar">
        <a className="cs-back" href="/" onClick={HandleBack}>
          <span className="cs-back-key" aria-hidden="true">Esc</span>
          <span className="cs-back-arrow" aria-hidden="true">←</span>
          <span>Back to home</span>
        </a>
        <span className="cs-topbar-status">
          <span className="cs-topbar-dot" />
          All work{' '}
          <em>// {String(kProjects.length).padStart(2, '0')} projects</em>
        </span>
      </header>

      <div className="stage">
        <div className="stage-backdrop">
          <DotField />
        </div>
        <Projects items={kProjects} variant="all" />

        <section className="work-contact" aria-labelledby="work-contact-title">
          <FadeIn className="work-contact-head">
            <p className="cs-section-label">Contact // Say hello</p>
            <ScatterHeadline
              className="work-contact-title"
              id="work-contact-title"
              lines={kContactHeadline}
              trigger={0}
            />
          </FadeIn>
          <FadeIn className="work-contact-channels">
            {kChannels.map(({ via, reply, destination, href, external }) => (
              <a
                key={via}
                className="cs-exit work-contact-channel"
                href={href}
                {...(external ? kExternalLinkProps : {})}
              >
                <span className="cs-exit-wipe" aria-hidden="true" />
                <span className="cs-exit-label">
                  {via} <em>// {reply}</em>
                </span>
                <span className="cs-exit-title">
                  {destination} <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </FadeIn>
        </section>
      </div>
    </div>
  )
} //Work

export default Work
