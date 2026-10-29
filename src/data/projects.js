// Every project is disabled for now: its row shows as in progress and no case
// study route opens for it. `featured` projects appear on the landing, in this
// order
const kProjects = [
  {
    index: '01',
    slug: 'fww',
    year: '2025',
    title: 'FWW',
    meta: 'Web · 2025',
    color: '#E38157',
    featured: true,
    disabled: true,
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
