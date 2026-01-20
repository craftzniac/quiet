export const Beat = {
  OneThird: 0.333,
  Half: 0.5,
  Full: 1
} as const


export const baseScaleGenMove = {  // WARN: Must contain only non-zero positive integers
  ONE: 1,
  TWO: 2,
} as const

export type TVoiceOctave = 4 & { __brand__: "VoiceOctave" }

export const voiceOctave = toVoiceOctave(4)    // WARN: 4 means C4 i.e middle C.  YOU may GO OUT OF RANGE OF THE PIANOKEYFREQUENCIES LIST IF you change absoluteOctave. For now there is only one voice

function toVoiceOctave(val: 4): TVoiceOctave {
  if (val !== 4) {
    throw new Error("voice octave can only be the value 4")
  }
  return val as TVoiceOctave
}


export const solfegeNoteRelativeOctaves = Object.freeze([-2, -1, 0, 1, 2] as const)

export type TSolfegeNoteRelativeOctave = typeof solfegeNoteRelativeOctaves[number] & { __brand__: "TSolfegeNoteRelativeOctave" }

export const solfegeNoteRelativeOctave: {  // explicit typing so that a user of this object does not need to cast props to TSolfegeNoteRelativeOctave
  down_2: TSolfegeNoteRelativeOctave,
  down_1: TSolfegeNoteRelativeOctave,
  zero: TSolfegeNoteRelativeOctave,
  up_1: TSolfegeNoteRelativeOctave,
  up_2: TSolfegeNoteRelativeOctave,
} = {
  down_2: solfegeNoteRelativeOctaves[0] as TSolfegeNoteRelativeOctave,
  down_1: solfegeNoteRelativeOctaves[1] as TSolfegeNoteRelativeOctave,
  zero: solfegeNoteRelativeOctaves[2] as TSolfegeNoteRelativeOctave,
  up_1: solfegeNoteRelativeOctaves[3] as TSolfegeNoteRelativeOctave,
  up_2: solfegeNoteRelativeOctaves[4] as TSolfegeNoteRelativeOctave,
} as const


export const letterNoteRelativeOctave = {
  zero: 0,
  one: 1,
} as const

export const baseSolfegeNotes = {
  0: "d",
  1: "de",
  2: "r",
  3: "re",
  4: "m",
  5: "f",
  6: "fe",
  7: "s",
  8: "se",
  9: "l",
  10: "ta",
  11: "t"
} as const

export const baseLetterNotes = Object.freeze(['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const)

export const pianoNoteFrequency = {
  Bb1: 58.27,
  B1: 61.74,
  C2: 65.41,         // Deep C
  "C#2": 69.30,
  D2: 73.42,
  Eb2: 77.78,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.50,
  G2: 98.00,
  Ab2: 103.83,
  A2: 110.00,
  Bb2: 116.54,
  B2: 123.47,
  C3: 130.81,
  "C#3": 138.59,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.00,
  G3: 196.00,
  Ab3: 207.65,
  A3: 220.00,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,       // Middle C
  "C#4": 277.18,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.00,
  Ab4: 415.30,
  A4: 440.00,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,      // Tenor C
  "C#5": 554.37,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.26,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  Ab5: 830.61,
  A5: 880.00,
  Bb5: 932.33,
  B5: 987.77,
  C6: 1046.50,     // Soprano C ~ High C
  "C#6": 1108.73,
  D6: 1174.66,
  Eb6: 1244.51,
  E6: 1318.51,
  F6: 1396.91,
  "F#6": 1479.98,
  G6: 1567.98,
  Ab6: 1661.22,
  A6: 1760.00,
  Bb6: 1864.66,
  B6: 1975.53,
  C7: 2093.01,     // Double High C
  "C#7": 2217.46,
  D7: 2349.32,
  Eb7: 2489.02,
  E7: 2637.02,
  F7: 2793.83,
  "F#7": 2959.96,
  G7: 3135.96,
  Ab7: 3322.44,
  A7: 3520.00,
  Bb7: 3729.31,
  B7: 3951.01,
  C8: 4186.01,     // Eighth octave
} as const


export const tempo = {
  Grave: 40,
  Largo: 50,
  Adagio: 70,
  Andante: 90,
  Moderato: 110,
  Allegro: 140,
  Presto: 180
} as const
