import { solfegeNoteRelativeOctave } from "./core/constants";
import type { TDurationInBeats, TSolfegeNote, TSolfegeRest } from "./core/types";

function toDurationInBeats(val: number): TDurationInBeats {  // supports durations such as 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, etc
  if (val > 0 && Number.isInteger(val * 2)) {
    return val as TDurationInBeats
  }
  throw new Error("val does not represent a valid TDurationInBeats")
}

export const notes: (TSolfegeNote | TSolfegeRest)[] = [
  { type: "note", solfege: "m", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "m", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "f", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "s", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "s", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "f", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "m", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "r", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "d", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "d", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "r", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "m", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1) },
  { type: "note", solfege: "m", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(1.5) },
  { type: "note", solfege: "r", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(2) },
  { type: "note", solfege: "d", relativeOctave: solfegeNoteRelativeOctave.zero, durationInBeats: toDurationInBeats(2) },
]
