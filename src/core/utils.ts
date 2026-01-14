import { baseSolfegeNotes, tempo } from "./constants";
import type { TBaseSolfegeNotes, TChar, TScoreTempoInBPM, TScoreTempoName, TSolfegeNoteIndex, TSolfegeNoteName } from "./types";

export function generateId(): string {
  const length = 12
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let id = ""
  const charArr = Array.from(chars)
  for (let i = 0; i < length; i++) {
    id += charArr[Math.floor(Math.random() * charArr.length)]
  }
  return id
}

export function toChar(val?: string): TChar {
  if (!val) {
    throw new Error(`expected single character but got ${val}`)
  }
  if (val.length === 1) return val as TChar
  throw new Error(`expected single character but got string of length ${val.length}`)
}

export function isSolfegeNoteName(c: string): c is TSolfegeNoteName {
  return getSolfegeNoteIndexFromName(c, baseSolfegeNotes) != null
}

export function todo(msg?: string) {
  throw new Error(msg ?? "branch not yet implemented")
}


export function getSolfegeNoteIndexFromName(solfegeNoteName: string, solfegeNotes: TBaseSolfegeNotes): TSolfegeNoteIndex | null {
  const solfegeNoteNameArray = Object.keys(solfegeNotes);
  for (let i = 0; i < solfegeNoteNameArray.length; i++) {
    if (solfegeNotes[i as TSolfegeNoteIndex] == solfegeNoteName) {
      return i as TSolfegeNoteIndex
    }
  }
  return null
}

export function getSolfegeNoteNameFromIndex(solfegeNoteIndex: number, solfegeNotes: typeof baseSolfegeNotes): TSolfegeNoteName | null {
  if (solfegeNoteIndex in solfegeNotes) {
    return solfegeNotes[solfegeNoteIndex as TSolfegeNoteIndex]
  }
  return null
}


export function baseSolfegeNotesLength() {
  return Object.keys(baseSolfegeNotes).length
}

export function getTempoNameFromValue(val: number): TScoreTempoName | null {
  for (const name of Object.keys(tempo)) {
    const value = tempo[name as TScoreTempoName]
    if (val === value) {
      return name as TScoreTempoName
    }
  }
  return null
}

export function isTempoValue(val: number): val is TScoreTempoInBPM {
  const name = getTempoNameFromValue(val)
  return !!name
}

export function toIntOrNull(val: string): number | null {
  try { const intVal = parseInt(val); return intVal } catch { return null }
}

export function isBeatsPerBar(val: number): val is (3 | 4) {
  return val == 3 || val == 4
}
