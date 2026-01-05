import { pianoNoteFrequency, type TRelativeOctave, type TSolfegeNoteName, type TVoiceOctave } from "./constants";
import type { TAudioNote, TAudioRest, TBaseLetterNoteName, TDurationInBeats, TLetterNoteFrequency, TLetterNoteName, TScoreTempoInBPM } from "./types";

export function createSolfegeToLetterNoteNameMap(baseScale: Map<TSolfegeNoteName, TBaseLetterNoteName>, voiceOctave: TVoiceOctave, relativeOctave: TRelativeOctave): Map<TSolfegeNoteName, TLetterNoteName> {
  const map: Map<TSolfegeNoteName, TLetterNoteName> = new Map()

  for (const key of baseScale.keys()) {
    const baseLetterNoteName = baseScale.get(key)
    if (!baseLetterNoteName) {
      throw new Error("baseScale has an invalid key")
    }

    const noteName = baseLetterNoteName + (voiceOctave + relativeOctave)
    if (!isLetterNoteName(noteName)) {
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

export function toRelativeOctave(val: number): TRelativeOctave {
  if (val >= -2 && val <= 2 && Number.isInteger(val) == true) return val as TRelativeOctave
  throw new Error("val does not represent a valid TRelativeOctave")
}


export function durationInBeatsToDurationInSecs(durationInBeats: TDurationInBeats, scoreTempo: TScoreTempoInBPM): number {
  return (durationInBeats * 60) / scoreTempo
}

