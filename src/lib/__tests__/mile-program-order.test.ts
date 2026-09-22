import { describe, expect, it } from "vitest"

import {
  getMileWorkoutPosition,
  mileWorkoutOrder,
} from "../../../data/mile-program-order.mjs"

describe("MILE workout order", () => {
  it("orders Lower, Upper, and Conditioning within each four-week block", () => {
    expect(mileWorkoutOrder).toEqual([
      { phaseNumber: 1, emphasisNumber: 1, title: "WEEKS 1-4: LOWER BODY" },
      { phaseNumber: 1, emphasisNumber: 2, title: "WEEKS 1-4: UPPER BODY" },
      { phaseNumber: 1, emphasisNumber: 3, title: "WEEKS 1-4: CONDITIONING" },
      { phaseNumber: 2, emphasisNumber: 1, title: "WEEKS 5-8: LOWER BODY" },
      { phaseNumber: 2, emphasisNumber: 2, title: "WEEKS 5-8: UPPER BODY" },
      { phaseNumber: 2, emphasisNumber: 3, title: "WEEKS 5-8: CONDITIONING" },
      { phaseNumber: 3, emphasisNumber: 1, title: "WEEKS 9-12: LOWER BODY" },
      { phaseNumber: 3, emphasisNumber: 2, title: "WEEKS 9-12: UPPER BODY" },
      { phaseNumber: 3, emphasisNumber: 3, title: "WEEKS 9-12: CONDITIONING" },
    ])
  })

  it("resolves stored titles without depending on dates or row IDs", () => {
    expect(getMileWorkoutPosition(" weeks 5-8: upper body ")).toMatchObject({
      phaseNumber: 2,
      emphasisNumber: 2,
    })
    expect(getMileWorkoutPosition("Unknown workout")).toBeUndefined()
  })
})
