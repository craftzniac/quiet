import type { TDurationInBeats } from "./types";

export function toDurationInBeats(val: number): TDurationInBeats {  // supports durations such as 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, etc
  if (val > 0 && Number.isInteger(val * 2)) {
    return val as TDurationInBeats
  }
  throw new Error("val does not represent a valid TDurationInBeats")
}

