export const PROGRAM_TIME_ZONE = "Europe/Stockholm"

export function getDateInTimeZone(
  date = new Date(),
  timeZone = PROGRAM_TIME_ZONE,
) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value

  return `${get("year")}-${get("month")}-${get("day")}`
}

export function shiftDateString(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function getWeekday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

export function isTrainingDay(date: string) {
  return [1, 2, 4, 5].includes(getWeekday(date))
}
