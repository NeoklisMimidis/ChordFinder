/**
 *
 * Chord mapping that contains variations of 65 Shorthands & 2 Special cases (67 total)
 *
 * SVG_fonts.otf (fonts file)
 *
 * Mapping between encoding font format & shorthand or accidental
 *  -1st column is encoded (font) chord symbols
 *  -2nd is MIREX chord shorthands
 *
 */

export const variations = [
  {
    shorthand: 'N',
    simplified: 'N.C.',
    description: 'No Chord',
    encoded: '<text id="disable-font-label">N.C.</text>',
  },
  {
    shorthand: 'X',
    simplified: '??',
    description: 'Unknown',
    encoded: '<text id="disable-font-label">??</text>',
  },

  {
    shorthand: 'maj',
    simplified: 'M',
    description: 'Major',
    encoded: '(M)',
  },
  {
    shorthand: 'maj7',
    simplified: 'M7',
    description: 'Major (or Delta) seventh',
    encoded: 'c',
  },
  {
    shorthand: 'maj9',
    simplified: 'M9',
    description: 'Major (or Delta) ninth',
    encoded: 'd',
  },
  {
    shorthand: 'maj13',
    simplified: 'M13',
    description: 'Major (or Delta) thirteenth',
    encoded: 'e',
  },

  {
    shorthand: 'min',
    simplified: 'm',
    description: 'Minor',
    encoded: 'a',
  },
  {
    shorthand: 'min7',
    simplified: 'm7',
    description: 'Minor seventh',
    encoded: 'b',
  },
  {
    shorthand: 'minmaj7',
    simplified: 'mM7',
    description: 'Minor major seventh',
    encoded: 'f',
  },
  {
    shorthand: 'min9',
    simplified: 'm9',
    description: 'Minor ninth',
    encoded: 'h',
  },
  {
    shorthand: 'minmaj7(9)',
    simplified: 'mM9',
    description: 'Minor major ninth',
    encoded: 'g',
  },
  {
    shorthand: 'min9(11)',
    simplified: 'm11',
    description: 'Minor eleventh',
    encoded: 'i',
  },
  {
    shorthand: 'min9(11,13)',
    simplified: 'm13',
    description: 'Minor thirteenth',
    encoded: '3',
  },
  {
    shorthand: 'aug',
    simplified: 'aug',
    description: 'Augmented',
    encoded: '@',
  },
  {
    shorthand: 'dim',
    simplified: 'dim',
    description: 'Diminished',
    encoded: '&gt;', // unicode equivalent '>'
  },
  {
    shorthand: 'dim7',
    simplified: 'dim7',
    description: 'Diminished seventh',
    encoded: '8',
  },
  {
    shorthand: 'hdim7',
    simplified: 'hdim7',
    description: 'Half diminished seventh',
    encoded: 'W',
  },
  {
    shorthand: 'hdim7(b9)',
    simplified: 'hdim9',
    description: 'Half diminished ninth',
    encoded: 'X',
  },
  {
    shorthand: 'hdim7(b9,11)',
    simplified: 'hdim11',
    description: 'Half diminished eleventh',
    encoded: 'Y',
  },

  // -Second Row //

  {
    shorthand: '7',
    simplified: 'dom7',
    description: 'Dominant seventh',
    encoded: '7',
  },
  {
    shorthand: '9',
    simplified: 'dom9',
    description: 'Dominant ninth',
    encoded: '9',
  },
  {
    shorthand: '9(11)',
    simplified: 'dom11',
    description: 'Dominant eleventh',
    encoded: 'Q',
  },
  {
    shorthand: '9(11,13)',
    simplified: 'dom13',
    description: 'Dominant thirteenth',
    encoded: 'U',
  },

  {
    shorthand: 'maj6',
    simplified: 'M6',
    description: 'Major sixth',
    encoded: '6',
  },
  {
    shorthand: 'maj6(9)',
    simplified: 'M6/9',
    description: 'Major sixth ninth',
    encoded: 'k',
  },
  {
    shorthand: 'maj(9)',
    simplified: 'M(add9)',
    description: 'Added ninth',
    encoded: '=',
  },
  {
    shorthand: 'min6',
    simplified: 'm6',
    description: 'Minor sixth',
    encoded: 'j',
  },
  {
    shorthand: 'min(b6)',
    simplified: 'mb6',
    description: 'Minor flat sixth',
    encoded: 'R',
  },
  {
    shorthand: 'min6(9)',
    simplified: 'm6/9',
    description: 'Minor sixth ninth',
    encoded: 'Z',
  },
  {
    shorthand: 'min(9)',
    simplified: 'm(add9)',
    description: 'Minor add ninth',
    encoded: '%',
  },

  {
    shorthand: 'sus2',
    simplified: 'sus2',
    description: 'Suspended second',
    encoded: `4<text id="disable-font-label">2</text>`,
  },
  {
    shorthand: 'sus4',
    simplified: 'sus4',
    description: 'Suspended fourth',
    encoded: `4<text id="disable-font-label">4</text>`,
  },
  {
    shorthand: 'sus4(7b,13)',
    simplified: '7sus4(add13)',
    description: 'Suspended seventh added thirteenth',
    encoded: 'H',
  },
  {
    shorthand: 'sus4(b7)',
    simplified: '7sus4',
    description: 'Dominant seventh suspended fourth',
    encoded: '[',
  },
  // FIXME
  {
    shorthand: 'sus4(b7,9)',
    simplified: '9sus4',
    description: 'Dominant ninth suspended fourth',
    encoded: ']',
  },
  {
    shorthand: 'sus4(b7,9,13)',
    simplified: '13sus4',
    description: 'Dominant thirteenth suspended fourth',
    encoded: '&lt;', // unicode equivalent '<'
  },

  // -Third Row //

  {
    shorthand: '7(b7,#5,b9,#9)',
    simplified: '7alt',
    description: 'Altered seventh',
    encoded: '?',
  }, // not specific but one of four choices: #5#9, b5b9, #5b9 or b5#9
  {
    shorthand: '7(b5)',
    simplified: '7b5',
    description: 'Seventh flat fifth',
    encoded: 'p',
  },
  {
    shorthand: '7(#5)',
    simplified: '7#5',
    description: 'Seventh sharp fifth',
    encoded: 'q',
  },
  {
    shorthand: '7(b5,b9)',
    simplified: '7b5b9',
    description: 'Seventh flat fifth flat ninth',
    encoded: 'L',
  },
  {
    shorthand: '7(b9,#5)',
    simplified: '7b9#5',
    description: 'Seventh sharp fifth flat ninth',
    encoded: 'J',
  },
  {
    shorthand: '7(b5,#9)',
    simplified: '7b5#9',
    description: 'Seventh flat fifth sharp ninth',
    encoded: 'O',
  },
  {
    shorthand: '7(#5,#9)',
    simplified: '7',
    description: 'Seventh sharp fifth sharp ninth',
    encoded: 'M',
  },
  {
    shorthand: '7(b9)',
    simplified: '7b9',
    description: 'Seventh flat ninth',
    encoded: 'S',
  },
  {
    shorthand: '7(#9)',
    simplified: '7#9',
    description: 'Seventh sharp ninth',
    encoded: 's',
  },
  {
    shorthand: '7(b9,#9)',
    simplified: '7b9#9',
    description: 'Seventh sharp ninth flat ninth',
    encoded: 'K',
  },
  {
    shorthand: '7(#11)',
    simplified: '7#11',
    description: 'Seventh sharp eleventh',
    encoded: 't',
  },
  {
    shorthand: '7(#9,#11)',
    simplified: '7#9#11',
    description: 'Seventh sharp ninth sharp eleventh',
    encoded: 'N',
  },
  {
    shorthand: '7(b9,#11)',
    simplified: '7b9#11',
    description: 'Seventh flat ninth sharp eleventh',
    encoded: 'P',
  },
  {
    shorthand: '7(b9,b13)',
    simplified: '7b9b13',
    description: 'Seventh flat ninth flat thirteenth',
    encoded: 'I',
  },
  {
    shorthand: '7(#9,b13)',
    simplified: '7#9b13',
    description: 'Seventh sharp ninth flat thirteenth',
    encoded: '0',
  },
  {
    shorthand: '7(b13)',
    simplified: '7b13',
    description: 'Seventh flat thirteenth',
    encoded: 'm',
  },

  // -Forth Row //

  {
    shorthand: '5',
    simplified: '5',
    description: 'Power chord (or harmonic dyad)',
    encoded: '5',
  },
  {
    shorthand: 'min#5',
    simplified: 'm#5',
    description: 'Minor sharp fifth',
    encoded: 'V',
  },
  {
    shorthand: 'sus4(b9)',
    simplified: '7susb9',
    description: 'Dominant seventh suspended flat ninth',
    encoded: 'v',
  },
  {
    shorthand: 'sus4(b13)',
    simplified: '7susb13',
    description: 'Dominant seventh suspended flat thirteenth',
    encoded: 'w',
  },
  {
    shorthand: 'maj7(b5)',
    simplified: 'M7b5',
    description: 'Major (or Delta) seventh flat fifth',
    encoded: '1',
  },
  {
    shorthand: 'maj7(#5)',
    simplified: 'M7#5',
    description: 'Major (or Delta) seventh sharp fifth',
    encoded: 'z',
  },
  {
    shorthand: 'maj7(#11)',
    simplified: 'M7(#11)',
    description: 'Major (or Delta) seventh sharp eleventh',
    encoded: 'x',
  },
  {
    shorthand: 'maj9(#11)',
    simplified: 'M9(#11)',
    description: 'Major (or Delta) ninth sharp eleventh',
    encoded: 'y',
  },
  {
    shorthand: '9(b5)',
    simplified: '9b5',
    description: 'Dominant ninth flat fifth',
    encoded: 'T',
  },
  {
    shorthand: '9(#5)',
    simplified: '9#5',
    description: 'Dominant ninth sharp fifth',
    encoded: 'n',
  },
  {
    shorthand: '9(#11)',
    simplified: '9#11',
    description: 'Dominant ninth sharp eleventh',
    encoded: 'r',
  },

  {
    shorthand: '9(11,b13)',
    simplified: '9b13',
    description: 'Dominant ninth flat thirteenth',
    encoded: '2',
  },
  {
    shorthand: 'b9(11,13)',
    simplified: '13b9',
    description: 'Dominant thirteenth flat ninth',
    encoded: 'u',
  },
  {
    shorthand: '#9(11,13)',
    simplified: '13#9',
    description: 'Dominant thirteenth sharp ninth',
    encoded: 'o',
  },
  {
    shorthand: '9(#11,13)',
    simplified: '13#11',
    description: 'Dominant thirteenth sharp eleventh',
    encoded: 'l',
  },
];

/**
 *
 * Accidentals: 2 from fonts file and 1 'Natural' case (3 total)
 *
 * SVG_fonts.otf (fonts file)
 *
 */
export const accidentals = [
  {
    simplified: '#',
    description: 'Sharp',
    encoded: '+',
  },
  {
    simplified: 'b',
    description: 'Flat',
    // encoded: '&',
    encoded: '&amp;',
  },
  {
    simplified: '',
    description: 'Natural',
    encoded: '',
  },
];

/* 
Christopher Harte's chord notation shorthands:
<shorthand> ::= "maj" | "min" | "dim" | "aug" | "maj7" | "min7" | "7"
| "dim7" | "hdim7" | "minmaj7" | "maj6" | "min6" | "9"
| "maj9" | "min9" | "sus2" | "sus4" 
*/

//  (21 + 2 )color combinations || (12 + 2) unique

/**
 * Chord color assignment based on rootNote (root + accidental)
 *
 * 23 (21 + 2) color combinations || 14 (12 + 2) unique
 */
export const chordColor = {
  'B#': 'rgba(255, 87, 51, 0.3)', // Red
  C: 'rgba(255, 87, 51, 0.3)',

  'C#': 'rgba(245, 166, 35, 0.3)', // Orange
  Db: 'rgba(245, 166, 35, 0.3)',

  D: 'rgba(252, 219, 0, 0.3)', // Yellow

  'D#': 'rgba(208, 223, 82, 0.3)', // Lime green
  Eb: 'rgba(208, 223, 82, 0.3)',

  E: 'rgba(0, 191, 255, 0.3)', // Blue
  Fb: 'rgba(0, 191, 255, 0.3)',

  'E#': 'rgba(0, 127, 255, 0.3)', // Azure
  F: 'rgba(0, 127, 255, 0.3)',

  'F#': 'rgba(127, 0, 255, 0.3)', // Purple
  Gb: 'rgba(127, 0, 255, 0.3)',

  G: 'rgba(232, 62, 140, 0.3)', // Pink

  'G#': 'rgba(220, 53, 69, 0.3)', // Red
  Ab: 'rgba(220, 53, 69, 0.3)',

  A: 'rgba(255, 193, 7, 0.3)', // Amber

  'A#': 'rgba(40, 167, 69, 0.3)', // Green
  Bb: 'rgba(40, 167, 69, 0.3)',

  B: 'rgba(23, 162, 184, 0.3)', // Cyan
  Cb: 'rgba(23, 162, 184, 0.3)', // Cyan

  N: 'rgba(0, 0, 0, 0)',
  X: 'rgba(0, 0, 0, 0.1)',
};

// console.log(Object.keys(chordColor).length);
// console.log(Object.keys(chordColor));
// console.log(chordColor);
