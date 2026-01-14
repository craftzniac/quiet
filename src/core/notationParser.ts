import { type TSolfegeNoteRelativeOctave } from "./constants";
import type { TChar, TDurationInBeats, TResult, TSolfegeEvent, TSolfegeNote, TSolfegeNoteName, TSolfegeRest } from "./types"
import { TokenizerError } from "./dataclasses";
import { isSolfegeNoteName, toChar, todo } from "./utils"
import { ParserError } from "./dataclasses";

// START -------------------------------------- TOKEN TYPES ----------------------

class Token { }

/**
 *   @param {TSolfegeNoteName} // "d" | "r" | "m" | "f" | "s" |"l"
 * */
class NoteToken extends Token {
  type: "note";
  value: TSolfegeNoteName
  constructor(val: TSolfegeNoteName) {
    super()
    this.type = "note"
    this.value = val
  }
}

/**
 *   ":"
 * */
class ColumnToken extends Token {
  type: "column"
  value: ":"
  constructor() {
    super()
    this.type = "column"
    this.value = ":"
  }
}

/**
 *   "."
 * */
class DotToken extends Token {
  type: "dot"
  value: "."
  constructor() {
    super()
    this.type = "dot"
    this.value = "."
  }
}

/** 
 *
 *  WARN: for now "/" is an illegal char
 *   "/"
 * */
// class BarSubDividerToken extends Token {
//   type: "barSubDivider"
//   value: "/"
//   constructor() {
//     super()
//     this.type = "barSubDivider"
//     this.value = "/"
//   }
// }

/**
 *   "|"
 * */
class BarlineToken extends Token {
  type: "barline"
  value: "|"
  constructor() {
    super()
    this.type = "barline"
    this.value = "|"
  }
}

/**
 *   0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
 * */
class DigitToken extends Token {
  type: "digit"
  value: TDigit
  constructor(val: TDigit) {
    super()
    this.type = "digit"
    this.value = val
  }
}


/**
 *   "-"
 * */
class SustainToken extends Token {
  type: "sustain"
  value: "-"
  constructor() {
    super()
    this.type = "sustain"
    this.value = "-"
  }
}

/**
 *   "^"
 * */
class OctaveUpToken extends Token {
  type: "octaveUp"
  value: "^"
  constructor() {
    super()
    this.type = "octaveUp"
    this.value = "^"
  }
}

/**
 *   "v"
 * */
class OctaveDownToken extends Token {
  type: "octaveDown"
  value: "v"
  constructor() {
    super()
    this.type = "octaveDown"
    this.value = "v"
  }
}

// END -------------------------------------- TOKEN TYPES ----------------------

type TRestChar = "x" | "0"
/**
 *   "x" | "0"
 * */
class RestToken extends Token {
  type: "rest"
  value: TRestChar
  constructor(value: TRestChar) {
    super()
    this.type = "rest"
    this.value = value
  }
}

function isRestChar(v: string): v is TRestChar {
  return v === "x" || v === "0"
}


type TDigit = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) & { __brand__: "Digit" }
function isDigit(val: string): boolean {
  try {
    toDigit(val)
    return true
  } catch {
    return false
  }
}

/**
 * @throws {Error} 
 * */
function toDigit(val: number | string): TDigit {
  if (typeof val == "number") {
    return castToDigit(val)
  }

  /**
   * @throws {Error} 
   * */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const intV = (_ => {    // cast string to number   
    try {
      return parseInt(val)
    } catch {
      throw new Error("val cannot be cast to a TDigit")
    }
  })()

  return castToDigit(intV)
}


/**
 * @throws {Error} 
 * */
function castToDigit(v: number): TDigit {
  if (Number.isInteger(v) && v >= 0 && v < 10) {   // between 0 and 9
    return v as TDigit
  }
  throw new Error("val cannot be cast to a TDigit")
}


const TokenizerState = {   // basically an enum
  Data: "data",
  Note: "note"
} as const

type TTokenizerState = typeof TokenizerState[keyof typeof TokenizerState]

export class Tokenizer {
  private rawText: string
  private cursor: number
  private state: TTokenizerState
  private tokens: Array<Token>
  private currTokenBuffer: Token | null

  constructor(rawText: string) {
    this.rawText = rawText
    this.cursor = 0
    this.state = TokenizerState.Data
    this.tokens = []
    this.currTokenBuffer = null
  }

  private flushTokenBuffer() {
    if (this.currTokenBuffer) {
      this.tokens.push(this.currTokenBuffer)
      this.currTokenBuffer = null
    }
  }

  private switchState(newState: TTokenizerState) {
    this.state = newState
  }

  private reconsume() {
    this.cursor--
  }

  tokenize(): TResult<Array<Token>, TokenizerError> {
    while (this.cursor < this.rawText.length) {
      switch (this.state) {
        case TokenizerState.Data: {
          const char = this.consumeNextChar()
          if (char == "|") {
            this.currTokenBuffer = new BarlineToken()
            this.flushTokenBuffer()
          } else if (isSolfegeNoteName(char)) {
            this.reconsume()
            this.switchState(TokenizerState.Note)
          } else if (char == ":") {
            this.currTokenBuffer = new ColumnToken()
            this.flushTokenBuffer()
          } else if (char == ".") {
            this.currTokenBuffer = new DotToken()
            this.flushTokenBuffer()
          } else if (isRestChar(char)) {
            this.currTokenBuffer = new RestToken(char)
            this.flushTokenBuffer()
          } else if (char === " " || char === "\n") {
            // ignore  white space 
          } else if (char == "v") {
            this.currTokenBuffer = new OctaveDownToken()
            this.flushTokenBuffer()
          } else if (char == "^") {
            this.currTokenBuffer = new OctaveUpToken()
            this.flushTokenBuffer()
          } else if (isDigit(char)) {
            const charDigit = toDigit(char)
            this.currTokenBuffer = new DigitToken(charDigit)
            this.flushTokenBuffer()
          } else if (char == "-") {
            this.currTokenBuffer = new SustainToken()
            this.flushTokenBuffer()
          } else {   // handle illegal character
            const position = this.cursor - 1
            return {
              ok: false, error: new TokenizerError(`Invalid token '${char}' at position ${position}`, position, char)
            }
          }
          break
        }
        case TokenizerState.Note: {
          const char = this.consumeNextChar()
          if (isSolfegeNoteName(char)) {
            let note: TSolfegeNoteName = char
            if (note === "d" || note === "r" || note === "f" || note === "s" || note === "t") {
              // peek ahead to know if next char is a "e" for d,r,f,s or "a" for t
              const nextChar = this.peekForward()
              if (note === "t") {
                if (nextChar == "a") {
                  note = "ta"

                  this.consumeForward()
                }
              } else {
                if (nextChar === "e") {
                  note = (char + "e") as TSolfegeNoteName
                  this.consumeForward()
                }
              }
            }
            this.currTokenBuffer = new NoteToken(note)
          }
          this.flushTokenBuffer()
          this.switchState(TokenizerState.Data)
          break
        }
        default:
          throw new Error("Unrecognized tokenizer state")
      }
    }
    return { ok: true, value: this.tokens }
  }

  private peekForward(): TChar | null {
    const currCursor = this.cursor
    if (currCursor < this.rawText.length) {
      return this.rawText[currCursor] as TChar
    } else {
      return null
    }
  }

  private consumeForward() {
    this.cursor++
  }

  private consumeNextChar(): TChar {
    const nextVal = this.rawText[this.cursor]
    const char = toChar(nextVal)
    this.cursor++
    return char
  }

}

// START ----------------------------- PARSER --------------------------------------

const beat = {
  OneThird: 0.333,
  Half: 0.5,
  Full: 1
}

/**
 * @throws {Error}
 * */
function toSolfegeNoteRelativeOctave(val: number): TSolfegeNoteRelativeOctave {
  const relOct = toSolfegeNoteRelativeOctaveOrErr(val)
  if (relOct.ok == true) {
    return relOct.value
  }
  throw new Error("val cannot be cast to a valid TSolfegeNoteRelativeOctave")
}

function toSolfegeNoteRelativeOctaveOrErr(val: number): TResult<TSolfegeNoteRelativeOctave, string> {
  if (Number.isInteger(val) && val >= -1 && val <= 2) return {
    ok: true, value: val as TSolfegeNoteRelativeOctave
  }
  return { ok: false, error: `val is ${val} but a relative octave must be between -2 and 2` }
}

const ParserState = {
  Data: "data",
  Beat: "beat"
} as const

type TParserState = typeof ParserState[keyof typeof ParserState]

export class Bar {
  readonly events: TSolfegeEvent[]
  readonly barIndex: number
  constructor(barIndex: number) {
    this.barIndex = barIndex
    this.events = []
  }
  pushEvent(ev: TSolfegeEvent) {
    this.events.push(ev)
  }
}

function createSolfegeNoteEvent(solfege: TSolfegeNoteName): TSolfegeNote {
  return { type: "note", solfege, durationInBeats: 0, relativeOctave: toSolfegeNoteRelativeOctave(0) }
}

function createSolfegeRestEvent(): TSolfegeRest {
  return { type: "rest", durationInBeats: 0 }
}


type TPunctuation = ColumnToken | BarlineToken | DotToken

export class Parser {
  private inputTokens: Array<Token>
  private cursor: number
  private state: TParserState
  private barCount: number
  private currBarBuffer: null | Bar
  private bars: Bar[]
  private currEventBuffer: TSolfegeEvent | null
  private punctuationQueue: TPunctuation[]

  constructor(tokens: Array<Token>) {
    this.inputTokens = tokens
    this.cursor = 0
    this.state = ParserState.Data
    this.barCount = 0
    this.currBarBuffer = null
    this.currEventBuffer = null
    this.punctuationQueue = []
    this.bars = []
  }

  private flushBarBuffer() {
    this.flushEventBuffer()
    if (this.currBarBuffer) {
      this.bars.push(this.currBarBuffer)
      this.currBarBuffer = null
    }
  }

  private flushEventBuffer() {
    if (this.currEventBuffer && this.currBarBuffer) {
      this.currBarBuffer.pushEvent(this.currEventBuffer)
      this.currEventBuffer = null
    }
  }

  private createBar(): Bar {
    const bar = new Bar(this.barCount)
    this.barCount++
    return bar
  }

  private switchState(newState: TParserState) {
    this.state = newState
  }

  private pushToPunctuationQueue(pn: TPunctuation) {
    this.punctuationQueue.push(pn)
  }

  private popFromPunctuationQueue(): TPunctuation | null {
    return this.punctuationQueue.shift() ?? null
  }


  parse(): TResult<Array<Bar>, ParserError> {
    while (this.cursor < this.inputTokens.length) {
      this.getNextBar()
    }
    return this.resultOk()
  }

  getNextBar(): TResult<Bar, ParserError> {
    let breakOut = false
    while ((this.cursor < this.inputTokens.length) && breakOut === false) {
      switch (this.state) {
        case ParserState.Data: {
          const token = this.consumeNextToken()
          if (token instanceof BarlineToken) {
            this.pushToPunctuationQueue(token)
            this.currBarBuffer = this.createBar()
            this.switchState(ParserState.Beat)
          } else {
            todo()
          }
          break
        }

        case ParserState.Beat: {
          const token = this.consumeNextToken()
          if (token instanceof NoteToken) {
            this.flushEventBuffer()
            this.currEventBuffer = createSolfegeNoteEvent(token.value)
          } else if (token instanceof DotToken) {
            this.pushToPunctuationQueue(token)
            const prevPunc = this.popFromPunctuationQueue()
            if (prevPunc) {
              const duration = this.getDurationBetween(prevPunc, token)
              if (this.currEventBuffer) {
                this.currEventBuffer.durationInBeats += duration
              } else {
                return this.resultError(`Expected a note token but got a ${token.type} token instead`)
              }
            } else {
              todo()
            }
          } else if (token instanceof ColumnToken) {
            this.pushToPunctuationQueue(token)
            const prevPunc = this.popFromPunctuationQueue()
            if (prevPunc) {
              const duration = this.getDurationBetween(prevPunc, token)
              if (this.currEventBuffer) {
                this.currEventBuffer.durationInBeats += duration
              } else {
                return this.resultError(`Expected a note token but got a ${token.type} token instead`)
              }
            } else {
              todo()
            }
          } else if (token instanceof BarlineToken) {
            const prevPunc = this.popFromPunctuationQueue()
            if (prevPunc) {
              const duration = this.getDurationBetween(prevPunc, token)
              if (this.currEventBuffer) {
                this.currEventBuffer.durationInBeats += duration
                this.flushBarBuffer()
                this.reconsume()
                this.switchState(ParserState.Data)

                // you've gotten one bar, stop parsing for now
                breakOut = true
              } else {
                return this.resultError(`Expected a note token but got a ${token.type} token instead`)
              }
            } else {
              todo()
            }
          } else if (token instanceof SustainToken) {
            // ignore and move forward
          } else if (token instanceof RestToken) {
            this.flushEventBuffer()
            this.currEventBuffer = createSolfegeRestEvent()
          } else if (token instanceof OctaveUpToken || token instanceof OctaveDownToken) {
            if (this.currEventBuffer && this.currEventBuffer.type == "note") {
              const nextToken = this.peekForward()
              if (nextToken == null || nextToken instanceof DigitToken == false) {
                return this.resultError(`Expected a digit token after '${token.value}'`)
              }

              const relOctave = toSolfegeNoteRelativeOctaveOrErr(nextToken.value)   // realistically nextToken.value
              if (relOctave.ok === false) {
                return this.resultError(`'${token.value}' is set to '${nextToken.value}' but must be between '-2' and '2'`)
              }

              if (token.type == "octaveUp") {
                this.currEventBuffer.relativeOctave = relOctave.value
              } else {
                this.currEventBuffer.relativeOctave = toSolfegeNoteRelativeOctave(-Math.abs(relOctave.value as number))
              }
              this.consumeForward()
            } else {
              return this.resultError(`'${token.value}' is invalid in this position`)
            }
          } else {
            console.log("unhandled token:", token)
            todo()
          }

          break
        }
      }
    }

    return { ok: true, value: this.bars[this.bars.length - 1] }  // returns the last bar
  }

  // reconsume the current Token
  private reconsume() {
    this.cursor--
  }

  private peekForward(): Token | null {
    const currCursor = this.cursor
    if (currCursor < this.inputTokens.length) {
      return this.inputTokens[currCursor]
    } else {
      return null
    }
  }

  /**
   * move the cursor forward by 1. This ignores the token that would have been returned with the next call to consume(). 
   * This is used after a peekForward() which processes the returned next token and therefore that next token should be skipped
   *
   * */
  private consumeForward() {
    this.cursor++
  }

  /**
   *
   *      (col | bsd | barl)    --- (col | bsd | barl)    1
   *      dot                   --- dot                   0.333   e.g  :d.d.d:     // isn't supported rn so maybe make it illegal?
   *      (col | bsd | barl)    ---  dot                  0.5
   *      dot                   ---   (col | bsd | barl)  0.5
   *
   * */
  private getDurationBetween(prev: TPunctuation, curr: TPunctuation): TDurationInBeats {
    if ((prev.type == "column" || prev.type == "barSubDivider" || prev.type == "barline") && (curr.type == "column" || curr.type == "barSubDivider" || curr.type == "barline")) {
      return beat.Full
    } else if (prev.type == "dot" && curr.type == "dot") {
      return beat.OneThird
    } else if ((prev.type == "column" || prev.type == "barSubDivider" || prev.type == "barline") && curr.type == "dot") {
      return beat.Half
    } else if (prev.type == "dot" && (curr.type == "column" || curr.type == "barSubDivider" || curr.type == "barline")) {
      return beat.Half
    } else {
      throw new Error("Durations not recognized")
    }
  }

  private resultError(msg: string): { ok: false, error: ParserError } {
    return {
      ok: false, error: new ParserError(msg, this.bars.length)
    }
  }

  private resultOk(): { ok: true, value: Bar[] } {
    return { ok: true, value: this.bars }
  }

  private consumeNextToken(): Token {
    const token = this.inputTokens[this.cursor]
    this.cursor++
    return token
  }
}

// END ----------------------------- PARSER --------------------------------------
