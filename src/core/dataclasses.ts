import { tempo } from "./constants"
import type { TScoreKeySignature, TScoreTempoInBPM, TScoreTimeSignature } from "./types"

export class ScoreMetadata {
  title: string
  keySignature: TScoreKeySignature
  timeSignature: TScoreTimeSignature
  composedBy: string
  arrangedBy: string
  tempo: TScoreTempoInBPM
  constructor() {
    this.title = ""
    this.keySignature = { mode: "major", tonic: "C" }
    this.timeSignature = { beatsPerBar: 3 }
    this.composedBy = ""
    this.arrangedBy = ""
    this.tempo = tempo.Andante
  }
}
