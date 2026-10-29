import { useEffect, useRef } from 'react'
import Background from './components/Background'
import Tape from './components/Tape'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Stack from './components/Stack'
import DotField from './components/DotField'
import CaseStudy from './components/CaseStudy'
import Work from './components/Work'
import Menu from './components/Menu'
import Cursor from './components/Cursor'
import UnderConstruction from './components/UnderConstruction'
import { kFeaturedProjects } from './data/projects'
import { GetCaseStudy } from './data/caseStudies'
import { usePath } from './router'
import { IsPhone } from './breakpoints'
import './App.css'

const kHeroScrollRangeVh = 1
const kHeroMinScale = 0.95
const kHeroMaxRadiusPx = 100
const kHeroMaxRadiusPxPhone = 32

const kWorkRoute = /^\/work\/?$/
const kCaseStudyRoute = /^\/work\/([\w-]+)\/?$/
const kLegacyRoute = /^\/case-studies(\/[\w-]+)?\/?$/

// Temporary: locks the whole site
const kUnderConstruction = false

// URLs from before everything moved under /work are rewritten in place
const legacy_match = window.location.pathname.match(kLegacyRoute)
if (legacy_match) {
  window.history.replaceState(
    window.history.state,
    '',
    `/work${legacy_match[1] ?? ''}`
  )
}

////////////////////////////////////////////////////////////////////////////////
function Home() {
  const hero_ref = useRef(null)

  useEffect(() => {
    const hero_el = hero_ref.current
    if (!hero_el) return

    const range = window.innerHeight * kHeroScrollRangeVh

    function HandleScroll() {
      const progress = Math.min(Math.max(window.scrollY / range, 0), 1)
      const scale = 1 - (1 - kHeroMinScale) * progress
      const max_radius = IsPhone() ? kHeroMaxRadiusPxPhone : kHeroMaxRadiusPx
      hero_el.style.transform = `scale(${scale})`
      hero_el.style.borderRadius = `${max_radius * progress}px`
      hero_el.style.setProperty('--hero-progress', progress)
    } //HandleScroll

    HandleScroll()
    window.addEventListener('scroll', HandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', HandleScroll)
  }, [])

  return (
    <>
      <Menu />
      <div className="stage">
        <div className="stage-backdrop">
          <DotField />
        </div>
        <div ref={hero_ref} className="hero" id="top">
          <Background />
          <Tape />
        </div>
        <Projects items={kFeaturedProjects} />
        <Stack />
        <Contact />
      </div>
    </>
  )
} //Home

////////////////////////////////////////////////////////////////////////////////
function App() {
  const path = usePath()
  const slug = path.match(kCaseStudyRoute)?.[1]
  const study = slug && GetCaseStudy(slug.toLowerCase())

  // key forces a fresh mount per case study, so state never leaks between them
  let page = <Home />
  if (study) page = <CaseStudy key={study.slug} study={study} />
  else if (kWorkRoute.test(path)) page = <Work />

  return (
    <>
      {page}
      <Cursor />
      {kUnderConstruction && <UnderConstruction />}
    </>
  )
} //App

export default App
