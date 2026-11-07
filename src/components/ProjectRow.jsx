import { HandleLinkClick } from '../router'
import { WorkPath } from '../data/projects'
import { IsProjectOpen } from '../data/caseStudies'
import { useScramble } from './Scramble'

////////////////////////////////////////////////////////////////////////////////
// Props for an open row: external projects open their live site in a new
// tab, the rest route to their case study
function LinkProps(project) {
  if (project.url) {
    return {
      href: project.url,
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `${project.title} live site (opens in a new tab)`,
    }
  }

  const href = WorkPath(project.slug)
  return {
    href,
    onClick: (event) =>
      HandleLinkClick(event, href, {
        effect: 'glitch',
        label: `opening ${project.index} // ${project.title}`,
        name: project.title,
      }),
    'aria-label': `${project.title} case study`,
  }
} //LinkProps

////////////////////////////////////////////////////////////////////////////////
// A project that isn't open renders as a focusable, non-link row marked as
// work in progress
function ProjectRow({ project, active, hover_tick, on_hover, on_leave }) {
  const wip = !IsProjectOpen(project)
  const external = !wip && Boolean(project.url)
  const Tag = wip ? 'div' : 'a'
  const link_props = wip ? {} : LinkProps(project)

  const title = useScramble(
    project.title.toUpperCase(),
    active ? hover_tick : 0
  )
  const tags = project.meta.split(' · ').filter((tag) => tag !== project.year)
  const entry_class =
    'entry' +
    (active ? ' entry--active' : '') +
    (wip ? ' entry--wip' : ' entry--open')

  let status = active ? 'Read the story' : 'Case study'
  if (external) status = active ? 'Visit the site' : 'Live site'
  if (wip) status = active ? 'In progress' : 'Coming soon'

  let enter = 'View project →'
  if (external) enter = 'Visit site ↗'
  if (wip) enter = 'WIP'

  return (
    <Tag
      className={entry_class}
      onMouseEnter={on_hover}
      onMouseLeave={on_leave}
      onFocus={on_hover}
      onBlur={on_leave}
      tabIndex={wip ? 0 : undefined}
      {...link_props}
    >
      <span className="entry-wipe" aria-hidden="true" />

      <span className="entry-index">{project.index}</span>

      <span className="entry-sr">
        {project.title}
        {wip && ', case study coming soon'}
      </span>
      <span className="entry-title" aria-hidden="true" data-text={title}>
        {title}
      </span>

      <span className="entry-side">
        <span className="entry-tags">
          {tags.join(' · ')}
          <span className="entry-year">{project.year}</span>
        </span>

        <span className="entry-status">
          <span className="entry-status-dot" />
          {status}
        </span>
      </span>

      <span className="entry-enter" aria-hidden="true">
        {enter}
      </span>
    </Tag>
  )
} //ProjectRow

export default ProjectRow
