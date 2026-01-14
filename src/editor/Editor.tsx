import { ArrowDownIcon, MinusIcon, PauseIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { PlayIcon } from "lucide-react"
import { generateId, getTempoNameFromValue, isBeatsPerBar, isTempoValue, toIntOrNull } from "@/core/utils";
import { Input } from "@/components/ui/input";
import { produceValidSolfegeEventsFromRawText } from "@/core/parseToSolfege";
import { scheduleAndPlay } from "@/core/solfegeToAudio";
import { ScoreMetadata } from "@/core/dataclasses";
import type { TBar, TBaseLetterNoteName, TScoreTempoInBPM } from "@/core/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { baseLetterNotes, tempo } from "@/core/constants";

function createBar(): TBar {
  return { id: generateId(), rawSolfege: "" }
}

export function Editor() {
  const [scoreMetadata, setScoreMetaData] = useState(new ScoreMetadata())
  const [bars, setBars] = useState<Array<TBar>>([createBar()])
  const [playerStatus, setPlayerStatus] = useState<"playing" | "paused" | "not_started">("not_started")
  const audioCtxRef = useRef<AudioContext | null>(null)
  if (audioCtxRef.current == null) {
    audioCtxRef.current = new AudioContext()
  }

  function updateScoreKey(newKey: TBaseLetterNoteName) {
    setScoreMetaData(prev => ({ ...prev, keySignature: { ...prev.keySignature, tonic: newKey } }))
  }

  function updateScoreTempo(newTempo: TScoreTempoInBPM) {
    setScoreMetaData(prev => ({ ...prev, tempo: newTempo }))
  }

  function updateBeatsPerBar(e: string) {
    const beatsPerBar = toIntOrNull(e)
    if (beatsPerBar == null) {
      return
    }
    const isValid = isBeatsPerBar(beatsPerBar)
    if (isValid) {
      setScoreMetaData(prev => ({ ...prev, timeSignature: { ...prev.timeSignature, beatsPerBar } }))
    }
  }

  function addBar() {
    setBars(prev => [...prev, createBar()])
  }

  function deleteBar(id: string) {
    setBars(prev => {
      return prev.filter(bar => bar.id !== id)
    })
  }

  function updateBar(id: string, solfege: string) {
    setBars(prev => {
      const bar = prev.find(b => b.id == id)
      if (!bar) {
        return prev
      }
      return prev.map(b => {
        if (b.id == id) {
          return { ...b, rawSolfege: solfege }
        }
        return b
      })
    })
  }

  async function playOrPause(): Promise<void> {
    switch (playerStatus) {
      case "not_started": {
        const res = produceValidSolfegeEventsFromRawText(bars.map(b => b.rawSolfege), scoreMetadata.timeSignature.beatsPerBar)
        if (res.ok === false) {
          alert(res.error.errorMsg)
          return
        }
        setPlayerStatus("playing")
        const audioCtx = audioCtxRef.current!
        audioCtx.resume()
        await scheduleAndPlay(audioCtx, scoreMetadata, res.value)
        setPlayerStatus("not_started")
        break
      }
      case "playing": {
        audioCtxRef.current?.suspend()
        setPlayerStatus("paused")
        break;
      }
      case "paused": {
        setPlayerStatus("playing")
        audioCtxRef.current?.resume()
        break;
      }
    }

  }

  return (
    <div className="w-full h-full flex flex-col">
      <header className="w-full bg-white p-3 flex">
        <h1>Quiet</h1>
        <div className="w-full flex justify-end">
          <Button variant="ghost" onClick={playOrPause} >
            {
              playerStatus == "playing" ? (
                <>
                  <PauseIcon />
                  <span>pause</span>
                </>
              ) : (
                <>
                  <PlayIcon />
                  <span>play</span>
                </>
              )
            }
          </Button>
        </div>
      </header>

      <main className="h-full w-full flex justify-center bg-gray-100 overflow-auto px-4 py-8">
        <div className="w-full max-w-230 h-fit aspect-[1/1.414] shadow bg-white p-8 gap-12 flex flex-col">
          <div className="flex w-full">
            <div className="flex w-full gap-1 items-center">
              <div className="flex flex-col gap-0.5">
                <div>
                  <Select defaultValue={scoreMetadata.timeSignature.beatsPerBar.toString()} onValueChange={(e) => updateBeatsPerBar(e)}>
                    <SelectTrigger className="border-none shadow-none justify-start px-1">
                      <SelectValue asChild>
                        <span>{scoreMetadata.timeSignature.beatsPerBar} / 4</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="3">{3}</SelectItem>
                        <SelectItem value="4">{4}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1 w-fit">
                  <span className="flex items-center gap-1">
                    <p>Key</p>
                    <Select defaultValue={scoreMetadata.keySignature.tonic} onValueChange={(e) => updateScoreKey(e as TBaseLetterNoteName)}>
                      <SelectTrigger>
                        <SelectValue>{scoreMetadata.keySignature.tonic}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {baseLetterNotes.map(n => <SelectItem value={n}>{n}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </span>
                  <span>
                    <Select defaultValue={scoreMetadata.tempo.toString()} onValueChange={e => {
                      const val = toIntOrNull(e)
                      if (val == null) {
                        return
                      }
                      const isValid = isTempoValue(val)
                      if (isValid) {
                        updateScoreTempo(val)
                      }
                    }}>
                      <SelectTrigger className="border-none shadow-none">
                        <SelectValue>({getTempoNameFromValue(scoreMetadata.tempo)})</SelectValue>
                        <SelectContent>
                          <SelectGroup>
                            {
                              Object.values(tempo).map(val => <SelectItem value={val.toString()}>{getTempoNameFromValue(val)}</SelectItem>)
                            }
                          </SelectGroup>
                        </SelectContent>
                      </SelectTrigger>
                    </Select>
                  </span>
                  <span></span>
                </div>
              </div>
              <div className="w-full flex justify-center">
                <h2 className="text-2xl font-medium">Hello world song</h2>
              </div>
              <div className="flex flex-col text-sm w-fit min-w-30 max-w-40">
                <p>composed by: {scoreMetadata.composedBy}</p>
                <p>arranged by: {scoreMetadata.arrangedBy}</p>
              </div>
            </div>
          </div>
          <div className="h-full w-full">
            <ul className="grid grid-cols-4 grid-rows-12 h-full w-full">
              {
                bars.map((bar, index) => (
                  <li className="flex" key={bar.id}>
                    <BarView bar={bar} index={index} deleteBar={() => deleteBar(bar.id)} disabled={false} updateSolfege={(s) => updateBar(bar.id, s)} />
                  </li>
                ))
              }
              <li className="w-full h-full flex items-center ustify-center">
                <Button className="w-full h-full rounded-none" variant="ghost" onClick={() => addBar()}>
                  <PlusIcon className="text-2xl" />
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div >
  )
}

function BarView({ bar, index, deleteBar, disabled, updateSolfege }: { bar: TBar, index: number, deleteBar: () => void, disabled: boolean, updateSolfege: (update: string) => void }) {
  return (
    <div className="border w-full p-1 group flex flex-col">
      <div className="flex w-full justify-between">
        <span className="text-xs">{index + 1}</span>
        <Button variant="ghost" className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto" size="icon-sm" onClick={deleteBar} disabled={disabled}>
          <MinusIcon size={10} />
        </Button>
      </div>
      <div className="w-full h-full flex items-center">
        <Input className="h-full flex md:text-2xl" value={bar.rawSolfege} onChange={(e) => updateSolfege(e.target.value)} />
      </div>
    </div>
  )
}
