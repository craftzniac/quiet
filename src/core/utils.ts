import { pianoNoteFrequency, type TSolfegeNoteRelativeOctave, type TSolfegeNoteName, type TVoiceOctave, letterNoteRelativeOctave, baseLetterNotes } from "./constants";
import type { TAudioNote, TAudioRest, TBaseLetterNoteIndex, TBaseLetterNotePosition, TDurationInBeats, TLetterNoteFrequency, TLetterNoteName, TLetterNoteRelativeOctave, TScoreTempoInBPM } from "./types";

export function createSolfegeToLetterNoteNameMap(baseScale: Map<TSolfegeNoteName, TBaseLetterNotePosition>, voiceOctave: TVoiceOctave, solfegeNoteRelativeOctave: TSolfegeNoteRelativeOctave): Map<TSolfegeNoteName, TLetterNoteName> {
  const map: Map<TSolfegeNoteName, TLetterNoteName> = new Map()

  for (const key of baseScale.keys()) {
    const baseLetterNotePosition = baseScale.get(key)
    if (!baseLetterNotePosition) {
      throw new Error("baseScale has an invalid key")  // realistically should never be invoked because baseScale is indexed using key which is definitely a key in baseScale.keys()
    }
    const noteName = baseLetterNotePosition.baseLetterNoteName + (voiceOctave as number + solfegeNoteRelativeOctave as number + baseLetterNotePosition.baseLetterNoteRelOctave)
    if (!isLetterNoteName(noteName)) {
      console.log("notename:", noteName)
      throw new Error("could not build a valid TLetterNoteName")
    }
    map.set(key, noteName)
  }

  return map
}

export function getLetterNoteFrequency<N extends string>(noteName: N): N extends TLetterNoteName ? TLetterNoteFrequency : TLetterNoteFrequency | null {
  if (!isLetterNoteName(noteName)) {
    // @ts-expect-error: to avoid enabling the explicit-any flag in ts config
    return null
  }
  return pianoNoteFrequency[noteName]
}

function isLetterNoteName(name: string): name is TLetterNoteName {
  const mutableNoteFrequency: Record<string, number> = { ...pianoNoteFrequency }
  const objKeys = Object.keys(mutableNoteFrequency);
  for (const key of objKeys) {
    if (key == name) return true
  }
  return false
}

export function isAudioNote(val: TAudioNote | TAudioRest): val is TAudioNote {
  return val.type == "note" && "durationInSec" in val && "frequency" in val && typeof val.frequency == "number"
}

export function toDurationInBeats(val: number): TDurationInBeats {  // supports durations such as 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, etc
  if (val > 0 && Number.isInteger(val * 2)) {
    return val as TDurationInBeats
  }
  throw new Error("val does not represent a valid TDurationInBeats")
}

export function toRelativeOctave(val: number): TSolfegeNoteRelativeOctave {
  if (val >= -2 && val <= 2 && Number.isInteger(val) == true) return val as TSolfegeNoteRelativeOctave
  throw new Error("val does not represent a valid TSolfegeNoteRelativeOctave")
}


export function durationInBeatsToDurationInSecs(durationInBeats: TDurationInBeats, scoreTempo: TScoreTempoInBPM): number {
  return (durationInBeats * 60) / scoreTempo
}


export function toLetterNoteRelativeOctave(val: number): TLetterNoteRelativeOctave {
  if (val == letterNoteRelativeOctave.one || val == letterNoteRelativeOctave.zero) {
    return val as TLetterNoteRelativeOctave
  }
  throw new Error("couldn't convert val to a valid TLetterNoteRelativeOctave")
}

export function toBaseLetterNoteIndex(val: number): TBaseLetterNoteIndex {
  if (Number.isInteger(val) && val < baseLetterNotes.length) {
    return val as TBaseLetterNoteIndex
  }
  throw new Error("couldn't convert val to a valid TBaseLetterNotePosition")
}
