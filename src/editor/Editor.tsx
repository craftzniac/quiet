import { MinusIcon, PauseIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import { memo, useCallback, useMemo, useRef, useState, type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { PlayIcon } from "lucide-react"
import { generateId, getTempoNameFromValue, isBeatsPerBar, isTempoValue, toIntOrNull } from "@/core/utils";
import { Input } from "@/components/ui/input";
import { produceValidSolfegeEventsFromRawText } from "@/core/parseToSolfege";
import { scheduleAndPlay } from "@/core/solfegeToAudio";
import { ScoreMetadata } from "@/core/dataclasses";
import type { TBar, TBaseLetterNoteName, TDurationChunkInBeats, TScoreTempoInBPM, TSolfegeEvent, TSolfegeNoteName } from "@/core/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { baseLetterNotes, Beat, tempo, type TSolfegeNoteRelativeOctave } from "@/core/constants";

function createBar(): TBar {
  return { id: generateId(), rawSolfege: "" }
}

const ViewMode = {
  Edit: "edit",
  Preview: "preview",
} as const

type TViewModel = typeof ViewMode[keyof typeof ViewMode]


function updateBar(id: string, solfege: string, setBars: Dispatch<SetStateAction<Array<TBar>>>) {
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

function addBar(setBars: Dispatch<SetStateAction<Array<TBar>>>) {
  setBars(prev => [...prev, createBar()])
}


export function Editor() {
  const [bars, setBars] = useState<Array<TBar>>([createBar()])
  const [scoreMetadata, setScoreMetaData] = useState(new ScoreMetadata())
  const [playerStatus, setPlayerStatus] = useState<"playing" | "paused" | "not_started">("not_started")
  const [viewMode] = useState<TViewModel>(ViewMode.Edit)
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

  const deleteBar = useCallback((id: string) => {
    setBars(prev => {
      return prev.filter(bar => bar.id !== id)
    })
  }, [])

  const handleUpdateBar = useCallback((id: string, s: string) => {
    updateBar(id, s, setBars)
  }, [])

  const playOrPause = useCallback(async () => {
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
  }, [playerStatus, bars, scoreMetadata])

  // const handleCheckedChange = useCallback((e: boolean) => {
  //   if (e) { setViewMode("preview") } else { setViewMode("edit") }
  // }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <header className="w-full bg-white p-3 flex">
        <h1>Quiet</h1>
        <div className="w-full flex justify-end">
          {/* WARN: I AM YET TO FIGURE OUT HOW TO PROPERLY IMPLEMENT PREVIEW FEATURE*/}

          {/* <div className="flex items-center gap-1"> */}
          {/*   <Switch id="editor-toggle-bar-preview" onCheckedChange={handleCheckedChange} /> */}
          {/*   <Label htmlFor="editor-toggle-bar-preview" className="text-sm font-normal">preview</Label> */}
          {/* </div> */}
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
                          {baseLetterNotes.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
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
                  <BarView key={bar.id} beatsPerBar={scoreMetadata.timeSignature.beatsPerBar} viewMode={viewMode} bar={bar} displayIndex={index + 1} deleteB={deleteBar} disabled={false} updateSolfege={handleUpdateBar} />
                ))
              }
              <li className="w-full h-full flex items-center ustify-center">
                <Button className="w-full h-full rounded-none" variant="ghost" onClick={() => addBar(setBars)}>
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


type TBarView = {
  bar: TBar,
  displayIndex: number,
  deleteB: (id: string) => void,
  disabled: boolean,
  updateSolfege: (id: string, update: string) => void,
  viewMode: TViewModel,
  beatsPerBar: number
}


const BarView = memo(function BarView({ viewMode, bar, displayIndex, deleteB, disabled, updateSolfege, beatsPerBar }: TBarView) {
  const handleClick = useCallback(() => {
    deleteB(bar.id)
  }, [bar.id, deleteB])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    updateSolfege(bar.id, e.target.value)
  }, [updateSolfege, bar.id])

  return (
    <div className="border w-full p-1 group flex flex-col">
      <div className="flex w-full justify-between">
        <span className="text-xs">{displayIndex}</span>
        <Button tabIndex={-1} variant="ghost" className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto" size="icon-sm" onClick={handleClick} disabled={disabled}>
          <MinusIcon size={10} />
        </Button>
      </div>
      <div className="w-full h-full flex items-center">
        {
          viewMode === ViewMode.Edit ? (
            <Input className="h-full flex md:text-2xl" value={bar.rawSolfege} onChange={handleChange} />
          ) : (
            <RenderedSolfege rawSolfege={bar.rawSolfege} beatsPerBar={beatsPerBar} />
          )
        }
      </div>
    </div>
  )
})


type TPunctuation = "|" | "." | ":"


// WARN: THIS IS PART OF THE PREVIEW FEATURE AND IT'S NOT REALLY FUNCTIONAL RN
function RenderedSolfege({ rawSolfege, beatsPerBar }: { rawSolfege: string, beatsPerBar: number }) {
  const parseRes = useMemo(() => produceValidSolfegeEventsFromRawText([rawSolfege], beatsPerBar), [rawSolfege, beatsPerBar])

  const pieces = useMemo(() => {
    if (parseRes.ok == false) return []
    const events = parseRes.value
    const els: ReactNode[] = []
    let prevPunctuation: null | TPunctuation = null
    let state: "event" | "duration_chunk" = "event"
    let cursor = 0
    let beatInChunks: TDurationChunkInBeats[] | null = null

    function nextEvent(events: TSolfegeEvent[]): TSolfegeEvent | null {
      let nextEv: null | TSolfegeEvent = null
      if (cursor < events.length) {
        nextEv = events[cursor]
        cursor++
      }
      return nextEv
    }

    while (cursor < events.length) {
      switch (state) {
        case "event": {
          const ev = nextEvent(events)
          if (ev == null) break
          if (ev.type == "note") {
            prevPunctuation = "|"
            els.push(<RNote name={ev.solfege} relativeOctave={ev.relativeOctave} />)
            beatInChunks = ev.durationChunksInBeats
            state = "duration_chunk"
          } else {
            els.push(<RRest />)
          }
          break;
        }
        case "duration_chunk": {
          if (beatInChunks == null) { state = "event"; continue };
          for (let i = 0; i < beatInChunks.length; i++) {
            const isLast = i === beatInChunks.length - 1
            const beat = beatInChunks[i]
            if (prevPunctuation == "|" && beat === Beat.Full) {
              if (!isLast) {
                prevPunctuation = ":"
                els.push(<RColumn />)
              } else {
                prevPunctuation = "|"
                break;
              }
            } else if (prevPunctuation === "|" && beat === Beat.Half) {
              prevPunctuation = "."
              els.push(<RDot />)
            } else if (prevPunctuation === "|" && beat === Beat.OneThird) {
              prevPunctuation = "."
              els.push(<RDot />)
            } else if (prevPunctuation === "." && beat === Beat.Full) {
              // ignore. this is an illgal case
            } else if (prevPunctuation === "." && beat === Beat.Half) {
              if (!isLast) {
                prevPunctuation = ":"
                els.push(<RColumn />)
              } else {
                prevPunctuation = "|"
                break;
              }
            } else if (prevPunctuation === "." && beat === Beat.OneThird) {
              prevPunctuation = "."
              els.push(<RDot />)
            } else if (prevPunctuation == ":" && beat === Beat.Full) {
              if (!isLast) {
                prevPunctuation = ":"
                els.push(<RColumn />)
              } else {
                prevPunctuation = "|"
                break;
              }
            } else if (prevPunctuation === ":" && beat === Beat.Half) {
              prevPunctuation = "."
              els.push(<RDot />)
            } else if (prevPunctuation === ":" && beat === Beat.OneThird) {
              prevPunctuation = "."
              els.push(<RDot />)
            }
          }
          state = "event"
          break;
        }
      }

    }
    return els
  }, [parseRes])

  if (parseRes.ok == false) {
    return (
      <div className="flex items-center w-full h-full md:text-2xl px-2 justify-center">
        <p className="text-destructive italic text-sm w-full text-center">error</p>
      </div>
    )
  }
  return (
    <div className="flex items-center w-full h-full md:text-2xl px-2 justify-start gap-2">
      {pieces}
    </div>
  )
}

function RNote({ name, relativeOctave }: { name: TSolfegeNoteName, relativeOctave: TSolfegeNoteRelativeOctave }) {
  if (relativeOctave > 0) {
    return <p className="md:text-2xl">{name}<sup>{relativeOctave}</sup> </p>
  } else if (relativeOctave < 0) {
    return <p className="md:text-2xl">{name}<sub>{Math.abs(relativeOctave)}</sub> </p>
  } else {
    return <p className="md:text-2xl">{name}</p>
  }
}

function RDot() {
  return <span className="md:text-2xl">.</span>
}

function RColumn() {
  return <span className="md:text-2xl">:</span>
}

function RRest() {
  return (
    <span className="w-2 md:text-2xl"></span>
  )
}
