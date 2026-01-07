// @ts-expect-error this variable is currently not being used
// eslint-disable-next-line
const solfege = `|m:m:m:-|m:m:m:-|m:s:d:r|m:-:-:-|f:f:f:-|f:m:m:-|m:r:r:m|r:-:s:-|`


// read solfege and spit out a sequence of solfege notes and rests
// loop through solfege notes and spit out letter notes with duration in seconds

/*
 *    dv1 -> C3
 *    rv1 -> D3
 *    mv1 -> E3
 *    fv1 -> F3
 *    sv1 -> G3
 *    lv1 -> A3
 *    tv1 -> B3
 *    d -> C4
 *    r -> D4
 *    m -> E4
 *    f -> F4
 *    s -> G4
 *    l -> A4
 *    t -> B4
 *    d^1 -> C5
 *    r^1 -> D5
 *    m^1 -> E5
 *    f^1 -> F5
 *    s^1 -> G5
 *    l^1 -> A5
 *    t^1 -> B5
 *    d^2 -> C6
 *
 * */



export function parseToSolfege(inp: string): (TSolfegeNote | TSolfegeRest)[] {
  return []
}
