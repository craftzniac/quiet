import { type pianoNoteFrequency, type baseLetterNotes, tempo, type TRelativeOctave, type TSolfegeNoteName } from "./constants";

export type TResult<T, E extends Error = Error> = { ok: true, value: T } | { ok: false, error: E }

export type TScoreKeySignature = {
  tonic: TBaseLetterNoteName,
  mode: "major" // "major" | "minor"; for now just assume mode is always major
}

export type TScoreTimeSignature = {
  beatsPerBar: 3 | 4,
}

export type TBaseLetterNoteName = typeof baseLetterNotes[number]
export type TBaseLetterNotePosition = number & { __brand__: "BaseLetterNotePosition" }

export type TRest = { duration: number }

export type TAudioNote = {
  type: "note",
  frequency: TLetterNoteFrequency,
  durationInSec: number,
}

export type TAudioRest = {
  type: "rest",
  durationInSec: number
}

export type TLetterNoteFrequency = typeof pianoNoteFrequency[keyof typeof pianoNoteFrequency]

export type TLetterNoteName = keyof typeof pianoNoteFrequency;


export type TDurationInBeats = number & { __brand__: "DurationInBeats" }

export type TSolfegeNote = {
  type: "note",
  solfege: TSolfegeNoteName,
  relativeOctave: TRelativeOctave,
  durationInBeats: TDurationInBeats
}

export type TSolfegeRest = {
  type: "rest",
  durationInBeats: TDurationInBeats
}

export type TScoreTempoInBPM = typeof tempo[keyof typeof tempo] 
