import { bass as sound } from "./wave-tables/bass.ts"
import { scheduleAndPlay } from "./core/solfegeToAudio"
import { useState } from "react"
// import { parseToSolfege } from "./core/parseToSolfege.ts"
import type { TScore, TSolfegeNote, TSolfegeRest } from "./core/types.ts"
import { tempo } from "./core/constants.ts"
import { notes } from "./mock-data.ts"

function createScore(measures: (TSolfegeNote | TSolfegeRest)[]): TScore {
  const score: TScore = {
    metadata: {
      arrangedBy: "", composedBy: "", keySignature: { mode: "major", tonic: "C" }, tempo: tempo.Andante, timeSignature: { beatsPerBar: 4 }, title: ""
    },
    voices: [
      { type: "soprano", measures }
    ]
  }
  return score
}

export default function App() {
  const [solfegeString, setSolfegeString] = useState("")
  function handler() {
    // parseToSolfege(solfegeString)
    const score = createScore(notes)
    void scheduleAndPlay(sound, score)
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col gap-1 w-full max-w-100">
        <textarea onChange={e => setSolfegeString(e.target.value.trim())} className="resize-none p-4 border rounded w-full h-90 text-2xl"></textarea>
        <button
          disabled={solfegeString.length == 0}
          className="bg-pink-600 w-fit text-white rounded px-4 py-2 hover:bg-pink-700 transition-colors shadow cursor-pointer disabled:bg-pink-600/30 disabled:hover:bg-pink-600/30"
          onClick={handler}
        > play sound
        </button>
      </div>
    </div>
  )
}


