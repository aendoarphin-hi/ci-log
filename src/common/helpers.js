export function isoDateString (date) {
  return date.toISOString().split('T')[0]
}
