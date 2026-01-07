import { solfegeNoteRelativeOctave } from "./core/constants";
import type { TSolfegeNote, TSolfegeRest } from "./core/types";
import { toDurationInBeats } from "./core/utils";

export const notes: (TSolfegeNote | TSolfegeRest) [] = [
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
