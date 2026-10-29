// Matches the `max-width: 760px` blocks in Projects.sass and Contact.sass
export const kPhoneQuery = '(max-width: 760px)'

let phone_query = null

////////////////////////////////////////////////////////////////////////////////
export function IsPhone() {
  phone_query ??= window.matchMedia(kPhoneQuery)
  return phone_query.matches
} //IsPhone
