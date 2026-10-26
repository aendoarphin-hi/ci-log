export function isoDateString (date) {
  return date.toISOString().split('T')[0]
}

export function getNameByEmployeeNumber (employees, number) {
  return employees.find(e => e.number === number)?.name || '\u2014'
}