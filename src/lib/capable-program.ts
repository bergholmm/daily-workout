export const CAPABLE_PROGRAM_SLUG = "capable"

export const CAPABLE_SESSIONS = [
  { number: 1, slug: "lower", name: "Lower", rhythm: "Monday" },
  { number: 2, slug: "upper", name: "Upper", rhythm: "Wednesday" },
  {
    number: 3,
    slug: "conditioning",
    name: "Conditioning",
    rhythm: "Friday",
  },
] as const

export const CAPABLE_PHASES = [
  {
    number: 1,
    name: "Range & Control",
    weeks: [1, 2, 3, 4],
    description:
      "Establish strong positions, reliable technique, and the mobility baselines that support the rest of the program.",
  },
  {
    number: 2,
    name: "Strength Through Range",
    weeks: [5, 6, 7, 8],
    description:
      "Add meaningful load and harder skill progressions without sacrificing control or usable range.",
  },
  {
    number: 3,
    name: "Capacity & Expression",
    weeks: [9, 10, 11, 12],
    description:
      "Express strength and movement quality under greater load, complexity, and sustainable fatigue.",
  },
] as const

export function getCapableSession(value: string | number) {
  return CAPABLE_SESSIONS.find(
    (session) => session.slug === value || session.number === Number(value),
  )
}

export function getCapablePhase(weekNumber: number) {
  return CAPABLE_PHASES.find((phase) =>
    phase.weeks.some((week) => week === weekNumber),
  )
}

export function getCapableWorkoutHref(
  weekNumber: number,
  sessionNumber: number,
) {
  const session = getCapableSession(sessionNumber)
  return `/training/${weekNumber}/${session?.slug ?? sessionNumber}`
}
