import { twelveStringGuitar1 as sound } from "./wave-tables/twelve_string_guitar1"
import { isAudioNote, toDurationInBeats } from "./core/utils"
import type { TAudioNote, TSolfegeNote, TSolfegeRest } from "./core/types"
import { solfegeToAudioNotes } from "./core/solfegeToAudio"
import { relativeOctave, tempo } from "./core/constants"


export default function App() {

  function playNote(audioCtx: AudioContext, waveForm: PeriodicWave, cursor: number, note: TAudioNote) {
    if (!audioCtx) { return }
    const osc = audioCtx.createOscillator()
    osc.frequency.value = note.frequency
    osc.setPeriodicWave(waveForm)
    osc.connect(audioCtx.destination)
    osc.start(cursor)
    osc.stop(cursor + note.durationInSec)
  }

  function playSound() {
    const audioCtx = new AudioContext()
    const waveForm = audioCtx.createPeriodicWave(sound.real, sound.imag)

    const solfegeNotes: (TSolfegeNote | TSolfegeRest)[] = [
      { type: "note", solfege: "d", relativeOctave: relativeOctave.zero, durationInBeats: toDurationInBeats(1) },
      { type: "note", solfege: "r", relativeOctave: relativeOctave.zero, durationInBeats: toDurationInBeats(1) },
      { type: "note", solfege: "m", relativeOctave: relativeOctave.zero, durationInBeats: toDurationInBeats(1) },
      { type: "rest", durationInBeats: toDurationInBeats(2) },
      { type: "note", solfege: "f", relativeOctave: relativeOctave.zero, durationInBeats: toDurationInBeats(1) },
      { type: "note", solfege: "s", relativeOctave: relativeOctave.zero, durationInBeats: toDurationInBeats(1) },
      { type: "note", solfege: "l", relativeOctave: relativeOctave.zero, durationInBeats: toDurationInBeats(1) },
      { type: "note", solfege: "t", relativeOctave: relativeOctave.zero, durationInBeats: toDurationInBeats(1) },
      { type: "note", solfege: "d", relativeOctave: relativeOctave.up_1, durationInBeats: toDurationInBeats(1) },
    ]

    const notes = solfegeToAudioNotes({ mode: "major", tonic: "F" }, tempo.Allegro, solfegeNotes)

    let cursor = audioCtx.currentTime
    for (const noteOrRest of notes) {
      if (isAudioNote(noteOrRest)) {
        playNote(audioCtx, waveForm, cursor, noteOrRest)
        cursor += noteOrRest.durationInSec
      } else {  // it's a rest
        cursor += noteOrRest.durationInSec
      }
    }

  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <button className="bg-pink-600 text-white rounded px-4 py-2 hover:bg-pink-700 transition-colors shadow cursor-pointer" onClick={() => playSound()}>play sound</button>
    </div>
  )
}
