import { baseSolfegeNotes } from "./constants";
import type { TBaseSolfegeNotes, TChar, TSolfegeNoteIndex, TSolfegeNoteName } from "./types";

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

