import { tempo } from "./constants"
import type { TChar, TScoreKeySignature, TScoreTempoInBPM, TScoreTimeSignature } from "./types"

export class ScoreMetadata {
  title: string
  keySignature: TScoreKeySignature
  timeSignature: TScoreTimeSignature
  composedBy: string
  arrangedBy: string
  tempo: TScoreTempoInBPM
  constructor(beatsPerBar: 3 | 4 = 4, scoreTempo: TScoreTempoInBPM = tempo.Allegro) {
    this.title = ""
    this.keySignature = { mode: "major", tonic: "F" }
    this.timeSignature = { beatsPerBar }
    this.composedBy = ""
    this.arrangedBy = ""
    this.tempo = scoreTempo
  }
}

export class ParserError {
  readonly barIndex: number
  readonly errorMsg: string
  constructor(errorMsg: string, barIndex: number) {
    this.errorMsg = errorMsg
    this.barIndex = barIndex
  }
}

export class TokenizerError {
  readonly position: number
  readonly errorMsg: string
  readonly errorChar: TChar
  constructor(errorMsg: string, position: number, errorChar: TChar) {
    this.position = position
    this.errorMsg = errorMsg
    this.errorChar = errorChar
  }
}
