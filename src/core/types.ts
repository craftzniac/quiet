import { type pianoNoteFrequency, type baseLetterNotes, tempo, letterNoteRelativeOctave, baseScaleGenMove, baseSolfegeNotes, type TSolfegeNoteRelativeOctave, Beat } from "./constants";

export type TResult<V, E = Error> = { ok: true, value: V } | { ok: false, error: E }

export type TSoundWave = { real: number[], imag: number[] }

export type TBaseLetterNotePosition = {
  baseLetterNoteName: TBaseLetterNoteName,
  baseLetterNoteRelOctave: TLetterNoteRelativeOctave,
  baseLetterNoteIndex: TBaseLetterNoteIndex
}

export type TBaseScaleGenMove = typeof baseScaleGenMove[keyof typeof baseScaleGenMove]

export type TSolfegeEvent = TSolfegeNote | TSolfegeRest

export type TSolfegeNote = {
  type: "note",
  solfege: TSolfegeNoteName,
  relativeOctave: TSolfegeNoteRelativeOctave,
  durationChunksInBeats: TDurationChunkInBeats[]
}

export type TSolfegeRest = {
  type: "rest",
  durationChunksInBeats: TDurationChunkInBeats[]
}

export type TScoreKeySignature = {
  tonic: TBaseLetterNoteName,
  mode: "major" // "major" | "minor"; for now just assume mode is always major
}

export type TScoreTimeSignature = {
  beatsPerBar: 3 | 4,
}

export type TBaseLetterNoteName = typeof baseLetterNotes[number]
export type TBaseLetterNoteIndex = number & { __brand__: "BaseLetterNotePosition" }

export type TRest = { duration: number }

export type TAudioEvent = TAudioNote | TAudioRest
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


// WARN: MIGHT BREAK CODE SOMWHERE ELSE 
export type TDurationChunkInBeats = typeof Beat[keyof typeof Beat]

export type TLetterNoteRelativeOctave = typeof letterNoteRelativeOctave[
  keyof typeof letterNoteRelativeOctave
]

export type TScoreTempoInBPM = typeof tempo[keyof typeof tempo]
export type TScoreTempoName = keyof typeof tempo

// export type TParserError = { position: number, errorMsg: string }


// export type TTokenizerError = { position: number, errorMsg: string, errorChar: TChar }   // errorMsg: "Invalid token '@' at position 3"


export type TChar = string & { __brand__: "Char" }


export type TSolfegeNoteName = typeof baseSolfegeNotes[keyof typeof baseSolfegeNotes]

export type TBar = {
  id: string,
  rawSolfege: string
}

export type TSolfegeNoteIndex = keyof typeof baseSolfegeNotes
export type TBaseSolfegeNotes = typeof baseSolfegeNotes
