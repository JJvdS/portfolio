export const kEmail = 'jensvandersloot@gmail.com'
export const kLinkedinUrl = 'https://www.linkedin.com/in/jensvandersloot'
export const kGithubUrl = 'https://github.com/JJvdS'

const kCallSubject = 'Call request'
const kCallBody = `Hi Jens,

I'd like to schedule a call.

Name:
What it's about:
Best times to reach me:
`
export const kCallRequestHref =
  `mailto:${kEmail}` +
  `?subject=${encodeURIComponent(kCallSubject)}` +
  `&body=${encodeURIComponent(kCallBody)}`
