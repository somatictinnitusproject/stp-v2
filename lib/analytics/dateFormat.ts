const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Parse via split, not new Date(), to avoid UTC timezone drift.
export function formatChartDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number)
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]}`
}

export function formatLongChartDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${String(day).padStart(2, '0')} ${MONTHS[month - 1]} ${year}`
}
