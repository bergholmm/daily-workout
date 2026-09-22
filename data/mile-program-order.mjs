const mileBlocks = [
  { phaseNumber: 1, weeks: "1-4" },
  { phaseNumber: 2, weeks: "5-8" },
  { phaseNumber: 3, weeks: "9-12" },
]

const mileEmphases = [
  { emphasisNumber: 1, name: "LOWER BODY" },
  { emphasisNumber: 2, name: "UPPER BODY" },
  { emphasisNumber: 3, name: "CONDITIONING" },
]

export const mileWorkoutOrder = mileBlocks.flatMap((block) =>
  mileEmphases.map((emphasis) => ({
    phaseNumber: block.phaseNumber,
    emphasisNumber: emphasis.emphasisNumber,
    title: `WEEKS ${block.weeks}: ${emphasis.name}`,
  })),
)

export function getMileWorkoutPosition(title) {
  const normalizedTitle = title?.trim().toUpperCase()
  return mileWorkoutOrder.find((workout) => workout.title === normalizedTitle)
}
