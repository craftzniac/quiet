import { baseLetterNotes, baseSolfegeNote, baseSolfegeNotes, voiceOctave, type TSolfegeNoteRelativeOctave, type TSolfegeNoteName, solfegeNoteRelativeOctave, baseScaleGenMove, letterNoteRelativeOctave } from "./constants"
import type { TAudioNote, TAudioRest, TBaseLetterNoteName, TBaseLetterNoteIndex, TBaseScaleGenMove, TLetterNoteName, TScoreKeySignature, TScoreTempoInBPM, TSolfegeNote, TSolfegeRest, TBaseLetterNotePosition } from "./types"
import { createSolfegeToLetterNoteNameMap, durationInBeatsToDurationInSecs, getLetterNoteFrequency, toBaseLetterNoteIndex, toLetterNoteRelativeOctave } from "./utils"

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
      console.log("solfegeToLetterNoteNameMapForRelativeOctave: ", solfegeToLetterNoteNameMapForRelativeOctave)
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


function getNextLetterNotePositionInScale(currLetterNote: TBaseLetterNotePosition, forwardMove: TBaseScaleGenMove, baseLetterNoteNames: typeof baseLetterNotes): TBaseLetterNotePosition {
  const { baseLetterNoteIndex: currLetterNoteIndex, baseLetterNoteRelOctave: currLeterNoteRelOctave } = currLetterNote
  const modulo = baseLetterNoteNames.length
  const relOctave = Math.floor((currLetterNoteIndex + forwardMove + (currLeterNoteRelOctave * modulo)) / modulo)
  console.log("relOctave:", relOctave)
  const noteIndex = (currLetterNoteIndex + forwardMove) % modulo
  const noteName = baseLetterNoteNames[noteIndex]
  if (!noteName) {
    throw new Error("calculation for letter note index was wrong")
  }
  return { baseLetterNoteIndex: toBaseLetterNoteIndex(noteIndex), baseLetterNoteName: noteName, baseLetterNoteRelOctave: toLetterNoteRelativeOctave(relOctave) }
}


/**
 * @returns {TBaseLetterNoteIndex} the index of a base letter note from the base letter note array
 * */
function getNoteIndexInBaseLetterNotes(note: TBaseLetterNoteName, bLetterNotes: typeof baseLetterNotes): TBaseLetterNoteIndex | null {
  for (let i = 0; i < bLetterNotes.length; i++) {
    const n = baseLetterNotes[i]
    if (n === note) {
      return toBaseLetterNoteIndex(i)
    }
  }
  return null
}

function createSolfegeToLetterNoteMap(scoreKey: TBaseLetterNoteName): Map<TSolfegeNoteRelativeOctave, Map<TSolfegeNoteName, TLetterNoteName>> {
  const baseScale: Map<TSolfegeNoteName, TBaseLetterNotePosition> = new Map()

  const scoreKeyIndexInBaseScale = getNoteIndexInBaseLetterNotes(scoreKey, baseLetterNotes)
  if (scoreKeyIndexInBaseScale == null) {
    throw new Error("scoreKey is an invalid base letter note")
  }
  const dohNotePosition: TBaseLetterNotePosition = {
    baseLetterNoteIndex: scoreKeyIndexInBaseScale,
    baseLetterNoteName: scoreKey,
    baseLetterNoteRelOctave: letterNoteRelativeOctave.zero
  }
  baseScale.set(baseSolfegeNote.Doh, dohNotePosition)

  // use W-W-H-W-W-W-H
  const pattern = [baseScaleGenMove.TWO, baseScaleGenMove.TWO, baseScaleGenMove.ONE, baseScaleGenMove.TWO, baseScaleGenMove.TWO, baseScaleGenMove.TWO] as const   // generate base scale using pattern [2,2,1,2,2,2] -- major scale

  let noteInScale = dohNotePosition

  const solfegeNotes = baseSolfegeNotes

  for (let i = 0; i < pattern.length; i++) {
    const move = pattern[i];
    noteInScale = getNextLetterNotePositionInScale(noteInScale, move, baseLetterNotes)
    // doing [i+1] instead of [i]  because the first note in solfegeNotes - Doh note, is already set in the map
    baseScale.set(solfegeNotes[i + 1], noteInScale)
  }

  console.log("baseScale:", baseScale)

  const scale: Map<TSolfegeNoteRelativeOctave, Map<TSolfegeNoteName, TLetterNoteName>> = new Map()
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
    solfegeNoteRelativeOctave.down_2,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, solfegeNoteRelativeOctave.down_2)
  )
  scale.set(
    solfegeNoteRelativeOctave.down_1,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, solfegeNoteRelativeOctave.down_1)
  )
  scale.set(
    solfegeNoteRelativeOctave.zero,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, solfegeNoteRelativeOctave.zero)
  )
  scale.set(
    solfegeNoteRelativeOctave.up_1,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, solfegeNoteRelativeOctave.up_1)
  )
  scale.set(
    solfegeNoteRelativeOctave.up_2,
    createSolfegeToLetterNoteNameMap(baseScale, voiceOctave, solfegeNoteRelativeOctave.up_2)
  )

  return scale
}
