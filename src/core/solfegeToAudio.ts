import { bass as sound } from "../wave-tables/bass"
import {
  baseLetterNotes,
  baseSolfegeNotes, voiceOctave,
  type TSolfegeNoteRelativeOctave,
  solfegeNoteRelativeOctave,
  letterNoteRelativeOctave, pianoNoteFrequency, type TVoiceOctave,
} from "./constants"
import type { ScoreMetadata } from "./dataclasses"
import type {
  TAudioNote,
  TBaseLetterNoteName, TBaseLetterNoteIndex,
  TLetterNoteName,
  TScoreKeySignature, TScoreTempoInBPM,
  TBaseLetterNotePosition,
  TSoundWave, TLetterNoteRelativeOctave,
  TDurationInBeats, TLetterNoteFrequency,
  TSolfegeEvent,
  TAudioEvent,
  TSolfegeNoteName,
} from "./types"
import { baseSolfegeNotesLength, getSolfegeNoteIndexFromName, getSolfegeNoteNameFromIndex } from "./utils"

function solfegeToAudioNotes(keySignature: TScoreKeySignature, scoreTempo: TScoreTempoInBPM, notes: TSolfegeEvent[]): TAudioEvent[] {
  const audioNotes: TAudioEvent[] = []
  const solfegeNoteToLetterNoteMap = createSolfegeToLetterNoteMap(keySignature.tonic)
  for (const solfegeNote of notes) {
    let note: TAudioEvent | null = null

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


function getNextLetterNotePositionInScale(currLetterNote: TBaseLetterNotePosition, baseLetterNoteNames: typeof baseLetterNotes): TBaseLetterNotePosition {
  const { baseLetterNoteIndex: currLetterNoteIndex, baseLetterNoteRelOctave: currLeterNoteRelOctave } = currLetterNote
  const modulo = baseLetterNoteNames.length
  const nextLetterNoteIndex = currLetterNoteIndex + 1
  const relOctave = Math.floor((nextLetterNoteIndex + (currLeterNoteRelOctave * modulo)) / modulo)
  const noteIndex = nextLetterNoteIndex % modulo
  const noteName = baseLetterNoteNames[noteIndex]
  if (!noteName) {
    throw new Error("calculation for letter note index was wrong")
  }
  return { baseLetterNoteIndex: toBaseLetterNoteIndex(noteIndex), baseLetterNoteName: noteName, baseLetterNoteRelOctave: toLetterNoteRelativeOctave(relOctave) }
}

function getNextSolfegeNoteInScale(currSolfegeNote: TSolfegeNoteName, baseSolfaNotes: typeof baseSolfegeNotes): TSolfegeNoteName {
  const currPosInScale = getSolfegeNoteIndexFromName(currSolfegeNote, baseSolfaNotes)
  if (currPosInScale == null) {
    throw new Error("calculation for solfege note index was wrong")
  }
  const nextNote = getSolfegeNoteNameFromIndex(currPosInScale + 1, baseSolfaNotes)
  if (nextNote == null) {
    throw new Error("calculation for solfege note index was wrong")
  }
  return nextNote
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
  baseScale.set(baseSolfegeNotes[0], dohNotePosition)

  let letterNoteInScale = dohNotePosition
  let solfegeNoteInScale: TSolfegeNoteName | null = baseSolfegeNotes[0]

  for (let i = 0; i < baseSolfegeNotesLength() - 1; i++) {  // 
    letterNoteInScale = getNextLetterNotePositionInScale(letterNoteInScale, baseLetterNotes)
    solfegeNoteInScale = getNextSolfegeNoteInScale(solfegeNoteInScale, baseSolfegeNotes);

    if (solfegeNoteInScale == null) {
      throw new Error("Scale gen pattern is most likely wrong")
    }

    baseScale.set(solfegeNoteInScale, letterNoteInScale)
  }
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


export function scheduleAndPlay(audioCtx: AudioContext, scoreMetadata: ScoreMetadata, solfegeEvents: TSolfegeEvent[]): Promise<void> {
  return new Promise((resolve) => {
    const soundWave: TSoundWave = sound

    const waveForm = audioCtx.createPeriodicWave(soundWave.real, soundWave.imag)
    const notes = solfegeToAudioNotes(scoreMetadata.keySignature, scoreMetadata.tempo, solfegeEvents)

    let cursor = audioCtx.currentTime
    let numOfOscillators = 0
    for (const noteOrRest of notes) {
      if (isAudioNote(noteOrRest)) {
        const note = noteOrRest
        const osc = audioCtx.createOscillator()
        osc.frequency.value = note.frequency
        osc.setPeriodicWave(waveForm)
        osc.connect(audioCtx.destination)
        osc.start(cursor)
        osc.stop(cursor + note.durationInSec)

        osc.onended = () => {
          osc.disconnect()
          numOfOscillators--

          if (numOfOscillators == 0) {
            resolve()
            return
          }
        }

        numOfOscillators++
        cursor += noteOrRest.durationInSec
      } else {  // it's a rest
        cursor += noteOrRest.durationInSec
      }
    }
  })
}

function toLetterNoteRelativeOctave(val: number): TLetterNoteRelativeOctave {
  if (val == letterNoteRelativeOctave.one || val == letterNoteRelativeOctave.zero) {
    return val as TLetterNoteRelativeOctave
  }
  throw new Error("couldn't convert val to a valid TLetterNoteRelativeOctave")
}

function toBaseLetterNoteIndex(val: number): TBaseLetterNoteIndex {
  if (Number.isInteger(val) && val < baseLetterNotes.length) {
    return val as TBaseLetterNoteIndex
  }
  throw new Error("couldn't convert val to a valid TBaseLetterNotePosition")
}


function durationInBeatsToDurationInSecs(durationInBeats: TDurationInBeats, scoreTempo: TScoreTempoInBPM): number {
  return (durationInBeats * 60) / scoreTempo
}

function isAudioNote(val: TAudioEvent): val is TAudioNote {
  return val.type == "note" && "durationInSec" in val && "frequency" in val && typeof val.frequency == "number"
}


function getLetterNoteFrequency<N extends string>(noteName: N): N extends TLetterNoteName ? TLetterNoteFrequency : TLetterNoteFrequency | null {
  if (!isLetterNoteName(noteName)) {
    // @ts-expect-error: to avoid enabling the explicit-any flag in ts config
    return null
  }
  return pianoNoteFrequency[noteName]
}

function createSolfegeToLetterNoteNameMap(baseScale: Map<TSolfegeNoteName, TBaseLetterNotePosition>, voiceOctave: TVoiceOctave, solfegeNoteRelativeOctave: TSolfegeNoteRelativeOctave): Map<TSolfegeNoteName, TLetterNoteName> {
  const map: Map<TSolfegeNoteName, TLetterNoteName> = new Map()
  for (const key of baseScale.keys()) {
    const baseLetterNotePosition = baseScale.get(key)
    if (!baseLetterNotePosition) {
      throw new Error("baseScale has an invalid key")  // realistically should never be invoked because baseScale is indexed using key which is definitely a key in baseScale.keys()
    }
    const noteName = baseLetterNotePosition.baseLetterNoteName + (voiceOctave as number + solfegeNoteRelativeOctave as number + baseLetterNotePosition.baseLetterNoteRelOctave)
    if (!isLetterNoteName(noteName)) {
      throw new Error("could not build a valid TLetterNoteName")
    }
    map.set(key, noteName)
  }
  return map
}

function isLetterNoteName(name: string): name is TLetterNoteName {
  const mutableNoteFrequency: Record<string, number> = { ...pianoNoteFrequency }
  const objKeys = Object.keys(mutableNoteFrequency);
  for (const key of objKeys) {
    if (key == name) return true
  }
  return false
}
