import kFwwImage from '../assets/fww.png'

// A disabled project shows as in progress and has no route. One with a `url`
// links out to its live site instead of a case study. `featured` projects
// appear on the landing, in this order
const kProjects = [
  {
    index: '01',
    slug: 'fww',
    year: '2025',
    title: 'FWW',
    meta: 'Web · 2025',
    color: '#E38157',
    image: kFwwImage,
    url: 'https://www.fransewerkwoorden.nl',
    featured: true,
  },
  {
    index: '02',
    slug: 'outofprep',
    year: '2026',
    title: 'Outofprep.com',
    meta: 'Web · C++ · 2026',
    color: '#8DC3DA',
    featured: true,
    disabled: true,
  },
]

export const kFeaturedProjects = kProjects.filter((project) => project.featured)

////////////////////////////////////////////////////////////////////////////////
export function WorkPath(slug) {
  return `/work/${slug}`
} //WorkPath

export default kProjects
