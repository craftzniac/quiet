import type { ParserError } from "./dataclasses";
import { Parser, Tokenizer, type Bar } from "./notationParser";
import type { TResult, TSolfegeEvent } from "./types";

export class BarsValidationErr {
  bars: number[]
  errorMsg: string
  constructor(bars: number[], errorMsg: string) {
    this.bars = bars
    this.errorMsg = errorMsg
  }
}

const pipe = "|"

function validateEmptyOrInvalidPipeInBars(bars: string[]): TResult<string, BarsValidationErr> {
  const emptyBarIndexes = []
  const barsWithPipes = []

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i].trim()
    // check that no bar is empty
    if (bar === "") {
      emptyBarIndexes.push(i)
    } else if (bar.includes("|")) {// check that no bar has pipe character
      barsWithPipes.push(i)
    }
  }

  if (emptyBarIndexes.length === 1) {
    return { ok: false, error: { bars: emptyBarIndexes, errorMsg: `Bar ${emptyBarIndexes[0] + 1} is empty` } }
  } else if (emptyBarIndexes.length > 1) {
    return { ok: false, error: { bars: emptyBarIndexes, errorMsg: `Bars ${emptyBarIndexes.map(b => b + 1).join(", ")} are empty` } }
  }

  if (barsWithPipes.length == 1) {
    return { ok: false, error: { bars: barsWithPipes, errorMsg: `Remove the pipes in Bar ${barsWithPipes[0] + 1}` } }
  } else if (barsWithPipes.length > 1) {
    return { ok: false, error: { bars: barsWithPipes, errorMsg: `Remove the pipes in Bars ${barsWithPipes.map(b => b + 1).join(", ")}` } }
  }

  // combine bars with "|" as delimeter
  const aggregateBarAsArray = Array.from(bars.join(pipe))
  // append pipe to both end and start of the array
  aggregateBarAsArray.unshift(pipe)
  aggregateBarAsArray.push(pipe)

  return { ok: true, value: aggregateBarAsArray.join("") }
}

function parseBars(rawSolfege: string): TResult<Bar[], ParserError> {
  const tok = new Tokenizer(rawSolfege).tokenize()
  if (tok.ok == false) {
    return { ok: false, error: { barIndex: 0, errorMsg: tok.error.errorMsg } }
  }

  const par = new Parser(tok.value).parse()
  if (par.ok == false) {
    return { ok: false, error: par.error }
  }

  return { ok: true, value: par.value }
}

function validateBeatsPerBar(bars: Bar[], beatsPerBar: number): TResult<void, BarsValidationErr> {
  const offendingBars = []
  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i]
    let numOfBeatsInBar = 0
    for (const event of bar.events) {
      numOfBeatsInBar += event.durationChunksInBeats.reduce((acc, val) => Number((acc + val).toFixed(2)), 0)
    }

    if (numOfBeatsInBar !== beatsPerBar) {
      offendingBars.push(i)
    }
  }

  if (offendingBars.length === 1) {
    return { ok: false, error: { bars: offendingBars, errorMsg: `Number of beats in Bar ${offendingBars[0] + 1} is not ${beatsPerBar}` } }
  } else if (offendingBars.length > 1) {
    return { ok: false, error: { bars: offendingBars, errorMsg: `Number of beats in Bars ${offendingBars.map(b => b + 1).join(", ")} is not ${beatsPerBar}` } }
  }

  return { ok: true, value: undefined }
}

export function produceValidSolfegeEventsFromRawText(bars: string[], beatsPerBar: number): TResult<TSolfegeEvent[], ParserError | BarsValidationErr> {
  const val1Res = validateEmptyOrInvalidPipeInBars(bars)
  if (val1Res.ok == false) {
    return val1Res
  }

  const parseRes = parseBars(val1Res.value)
  if (parseRes.ok == false) {
    return parseRes
  }

  const postParseValiRes = validateBeatsPerBar(parseRes.value, beatsPerBar)
  if (postParseValiRes.ok == false) {
    return postParseValiRes
  }

  const aggregate: TSolfegeEvent[] = []
  for (const events of parseRes.value.map(b => b.events)) {
    for (const ev of events) {
      aggregate.push(ev)
    }
  }
  return { ok: true, value: aggregate }
}
