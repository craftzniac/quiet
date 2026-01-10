import type { ParserError, TokenizerError } from "./dataclasses";
import { Parser, Tokenizer, type Bar } from "./notationParser";
import type { TResult } from "./types";

export function singleBarParser(_input: string): TResult<Bar, ParserError | TokenizerError | string> {     // expects raw solfege which are not dli
  // check that the input does not start or end with a pipe (|) 
  const pipeChar = "|"
  let input = _input.trim()
  const firstChar = input.charAt(0)
  const lastChar = input.charAt(input.length - 1)
  if (firstChar === pipeChar) {
    return { ok: false, error: "Remove the pipe at the beginning of this bar" }
  }
  if (lastChar === pipeChar) {
    return { ok: false, error: "Remove the pipe at the end of this bar" }
  }

  // manually add  pipe to the beginning and end of the array
  const inputAsArray = Array.from(input)
  inputAsArray.unshift(pipeChar)   // add pipe to the start
  inputAsArray.push(pipeChar)   // add pipe to the end

  input = inputAsArray.join("")

  const tok = new Tokenizer(input).tokenize()
  if (tok.ok === false) {
    return { ok: false, error: tok.error.errorMsg }
  }

  const parseRes = new Parser(tok.value).getNextBar()
  if (parseRes.ok == false) {
    return { ok: false, error: parseRes.error.errorMsg }
  }

  return { ok: true, value: parseRes.value }
}
