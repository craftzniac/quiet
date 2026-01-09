import { MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlayIcon } from "lucide-react"
import { generateId } from "@/core/utils";
import { Input } from "@/components/ui/input";
import { singleBarParser } from "@/core/parseToSolfege";
import { scheduleAndPlay } from "@/core/solfegeToAudio";
import { ScoreMetadata } from "@/core/dataclasses";
import type { TBar, TSolfegeEvent } from "@/core/types";

function createBar(): TBar {
  return { id: generateId(), rawSolfege: "" }
}

function getEmptyBars(bars: Array<TBar>): number[] {
  const emptybars: number[] = []
  for (let i = 0; i < bars.length; i++) {
    if (bars[i].rawSolfege.trim() == "") emptybars.push(i)
  }
  return emptybars
}

export function Editor() {
  const [scoreMetadata, setScoreMetadata] = useState(new ScoreMetadata())
  const [bars, setBars] = useState<Array<TBar>>([createBar()])
  const [isPlaying, setIsPlaying] = useState(false)

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

  function play() {
    // check that no bar is empty
    const emptybars = getEmptyBars(bars)
    if (emptybars.length === 1) {
      alert(`Bar ${emptybars.map(ind => ind + 1).join(", ")} is empty!`)
      return
    }

    if (emptybars.length > 1) {
      alert(`Bars ${emptybars.map(ind => ind + 1).join(", ")} are empty!`)
      return
    }

    const aggregateSolfegeEvents: TSolfegeEvent[] = []
    for (const bar of bars) {
      const parseres = singleBarParser(bar.rawSolfege)
      if (parseres.ok == false) {
        alert(parseres.error)
        return
      }
      aggregateSolfegeEvents.push(...parseres.value.events)
    }
    scheduleAndPlay(scoreMetadata, aggregateSolfegeEvents)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <header className="w-full bg-white p-3 flex">
        <h1>Quiet</h1>
        <div className="w-full flex justify-end">
          <Button variant="ghost" onClick={play}>
            <PlayIcon />
            <span>play</span>
          </Button>
        </div>
      </header>

      <main className="h-full w-full flex justify-center bg-gray-100 overflow-auto px-4 py-8">
        <div className="w-full max-w-230 h-fit aspect-[1/1.414] shadow bg-white p-8 gap-5 flex flex-col">
          <div className="flex w-full">
            <div className="flex w-full justify-center">
              <h2 className="text-2xl font-medium">Hello world song</h2>
            </div>
          </div>
          <div className="h-full w-full">
            <ul className="grid grid-cols-4 grid-rows-12 h-full w-full">
              {
                bars.map((bar, index) => (
                  <li className="flex" key={bar.id}>
                    <BarView bar={bar} index={index} deleteBar={() => deleteBar(bar.id)} disabled={isPlaying} updateSolfege={(s) => updateBar(bar.id, s)} />
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
    </div>
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
