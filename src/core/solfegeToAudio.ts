import { baseLetterNotes, baseSolfegeNote, baseSolfegeNotes, relativeOctave, voiceOctave, type TRelativeOctave, type TSolfegeNoteName } from "./constants"
import type { TAudioNote, TAudioRest, TBaseLetterNoteName, TBaseLetterNotePosition, TLetterNoteName, TScoreKeySignature, TScoreTempoInBPM, TSolfegeNote, TSolfegeRest } from "./types"
import { createSolfegeToLetterNoteNameMap, durationInBeatsToDurationInSecs, getLetterNoteFrequency } from "./utils"

// @ts-expect-error this variable is currently not being used
// eslint-disable-next-line
const solfege = `|m:m:m:-|m:m:m:-|m:s:d:r|m:-:-:-|f:f:f:-|f:m:m:-|m:r:r:m|r:-:s:-|`


// read solfege and spit out a sequence of solfege notes and rests
// loop through solfege notes and spit out letter notes with duration in seconds

/*
 *    dv1 -> C3
 *    rv1 -> D3
 *    mv1 -> E3
 *    fv1 -> F3
 *    sv1 -> G3
 *    lv1 -> A3
 *    tv1 -> B3
 *    d -> C4
 *    r -> D4
 *    m -> E4
 *    f -> F4
 *    s -> G4
 *    l -> A4
 *    t -> B4
 *    d^1 -> C5
 *    r^1 -> D5
 *    m^1 -> E5
 *    f^1 -> F5
 *    s^1 -> G5
 *    l^1 -> A5
 *    t^1 -> B5
 *    d^2 -> C6
 *
 * */



export function solfegeToAudioNotes(keySignature: TScoreKeySignature, scoreTempo: TScoreTempoInBPM, notes: (TSolfegeNote | TSolfegeRest)[]): (TAudioNote | TAudioRest)[] {
  const audioNotes: (TAudioNote | TAudioRest)[] = []
  const solfegeNoteToLetterNoteMap = createSolfegeToLetterNoteMap(keySignature.tonic)
  for (const solfegeNote of notes) {
    let note: TAudioNote | TAudioRest | null = null

    if (solfegeNote.type == "note") {
      const solfegeToLetterNoteNameMapForRelativeOctave = solfegeNoteToLetterNoteMap.get(solfegeNote.relativeOctave)
      if (!solfegeToLetterNoteNameMapForRelativeOctave) {
        throw new Error("solfegeToLetterNoteNameMap was not properly created")
      }
      const letterNoteName = solfegeToLetterNoteNameMapForRelativeOctave.get(solfegeNote.solfege)
      if (!letterNoteName) {
        throw new Error("invalid solfegeToLetterNoteName mapping for this relative octave")
      }

      note = {
        type: "note",
        durationInSec: durationInBeatsToDurationInSecs(solfegeNote.durationInBeats, scoreTempo),
        frequency: getLetterNoteFrequency(letterNoteName),
      }

    } else {
      note = {
        type: "rest",
        durationInSec: durationInBeatsToDurationInSecs(solfegeNote.durationInBeats, scoreTempo)
      }
    }

    audioNotes.push(note)
  }

  return audioNotes
}

function createSolfegeToLetterNoteMap(scoreKey: TBaseLetterNoteName): Map<TRelativeOctave, Map<TSolfegeNoteName, TLetterNoteName>> {
  const baseScale: Map<TSolfegeNoteName, TBaseLetterNoteName> = new Map()
  baseScale.set(baseSolfegeNote.Doh, scoreKey)

  // use W-W-H-W-W-W-H
  const pattern = [2, 2, 1, 2, 2, 2]   // generate base scale, currently assumed to be a major scale. // WARN: Must contain only positive integers

  const startIndex = getNotePositionInBaseLetterNotes(scoreKey)
  if (startIndex === null) {
    throw new Error("scoreKey passed is weird and invalid")
  }
  let cursor: TBaseLetterNotePosition = startIndex

  const solfegeNotes = baseSolfegeNotes

  for (let i = 0; i < pattern.length; i++) {
    const move = pattern[i];
    cursor = ((cursor + move) % baseLetterNotes.length) as TBaseLetterNotePosition
    const solfegeIndex = i + 1
    if (solfegeIndex >= solfegeNotes.length) {
      throw new Error("pattern array should not have more than 6 elements")
    }
    baseScale.set(solfegeNotes[i + 1], baseLetterNotes[cursor])
  }

  const scale: Map<TRelativeOctave, Map<TSolfegeNoteName, TLetterNoteName>> = new Map()
  /*
   * Sample resulting scale:
   * Map {
   *    -2: {
   *      d: "C2",
   *      r: "D2",
   *      m: "E2",
   *      f: "F2",
   *      s: "G2",
   *      l: "A2",
   *      t: "B2",
   *    },
   *
   *    -1: {
   *      d: "C3",
   *      r: "D3",
   *      m: "E3",
   *      f: "F3",
   *      s: "G3",
   *      l: "A3",
   *      t: "B3",
   *    },
   *
   *    0: {
   *      d: "C4",
   *      r: "D4",
   *      m: "E4",
   *      f: "F4",
   *      s: "G4",
   *      l: "A4",
   *      t: "B4",
   *    },
   *
   *    1: {
   *      d: "C5",
   *      r: "D5",
   *      m: "E5",
   *      f: "F5",
   *      s: "G5",
   *      l: "A5",
   *      t: "B5",
   *    },
   *
   *    2: {
   *      d: "C6",
   *      r: "D6",
   *      m: "E6",
   *      f: "F6",
   *      s: "G6",
   *      l: "A6",
   *      t: "B6",
   *    },
   * }
   * */
  scale.set(
    relativeOctave.down_2,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, relativeOctave.down_2)
  )
  scale.set(
    relativeOctave.down_1,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, relativeOctave.down_1)
  )
  scale.set(
    relativeOctave.zero,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, relativeOctave.zero)
  )
  scale.set(
    relativeOctave.up_1,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, relativeOctave.up_1)
  )
  scale.set(
    relativeOctave.up_2,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, relativeOctave.up_2)
  )

  return scale
}

function getNotePositionInBaseLetterNotes(note: TBaseLetterNoteName): TBaseLetterNotePosition | null {
  for (let i = 0; i < baseLetterNotes.length; i++) {
    const n = baseLetterNotes[i]
    if (n === note) return i as TBaseLetterNotePosition
  }
  return null
}
