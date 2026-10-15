export function formatDubaiClock(date: Date) {
  const tz = 'Asia/Dubai'
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(date)
  const month = new Intl.DateTimeFormat('en-US', { month: 'numeric', timeZone: tz }).format(date)
  const day = new Intl.DateTimeFormat('en-US', { day: '2-digit', timeZone: tz }).format(date)
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(date)
  return { date: `${weekday} ${month}.${day}`, time }
}
