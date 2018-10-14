import textures from 'textures'

// middle, [negative, negative-accent], [positive, positive-accent]
export const defaultColors = ['#ddd', ['#9BE', '#229'], ['#CAA','#900']]

const colorFills = [
  (p, colors) => colors[0],
  (p, colors) => colors[p ? 2 : 1][0],
  (p, colors) => colors[p ? 2 : 1][1],
  (p, colors) => colors[p ? 2 : 1][2],
  (p, colors) => colors[p ? 2 : 1][2],
]

export const getColor = (len, i, colors) => {
  const p = polarity(len, i)
  const o = offset(len, i)
  return colorFills[o](p, colors)
}

const lpad = s => s.length==2 ? s : '0'+s

const hexToInt = hex => ({
  r: parseInt(hex.slice(1,3), 16),
  g: parseInt(hex.slice(3,5), 16),
  b: parseInt(hex.slice(5,), 16)
})

export const getColorContinuous = (len, i, colors) => {
  const low = hexToInt(colors[0])
  const high = hexToInt(colors[1])
  return [
    '#',
    lpad(Math.max(Math.round(low.r + (high.r - low.r) * (i + 1 ) / len), 0).toString(16)),
    lpad(Math.max(Math.round(low.g + (high.g - low.g) * (i + 1) / len), 0).toString(16)),
    lpad(Math.max(Math.round(low.b + (high.b - low.b) * (i + 1) / len), 0).toString(16)),
  ].join('')
}

// pattern set 
const fillPatterns = [
  (p, colors) => 
    textures.lines().background(colors[0]).stroke('transparent'),
  (p, colors) => 
    textures.lines()
      .background(colors[p ? 2 : 1][1]).stroke('transparent'),
  (p, colors) => 
      textures.lines()
        .background(colors[p ? 2 : 1][0]).stroke(colors[p ? 2 : 1][1])
        .size(12).strokeWidth(5).orientation(p ? "2/8" : "6/8"),
  (p, colors) => 
    textures.paths().d("woven")
      .lighter().thicker()
      .background(colors[p ? 2 : 1][0]).stroke(colors[p ? 2 : 1][1]),
  (p, colors) => 
      textures.lines().background(colors[p ? 2 : 1][0]).stroke('transparent'),
]

const continuousFillPatterns = [
  (color) => 
    textures.lines()
      .background(color).stroke('transparent'),
  (color) => 
      textures.lines()
        .background(color).stroke('rgba(0,0,0,0.3)')
        .size(12).strokeWidth(5).orientation("6/8"),
  (color) => 
    textures.paths().d("woven")
      .thicker()
      .background(color).stroke('rgba(0,0,0,0.3)'),
  (color) => 
      textures.circles()
        .thicker().thicker().lighter()
        .background(color).fill('rgba(0,0,0,0.3)'),
  (color) => 
      textures.lines().background(color).stroke('transparent'),
]

export const getFill = (len, i, colors) => {
  const p = polarity(len, i)
  const o = offset(len, i)
  const reverseOffset = Math.floor(len / 2) - o

  // offset 0 (center) - use neutral pattern 0
  if (o===0) return fillPatterns[0](p, colors)
  // else use fill pattern starting at index 1 counting back
  return fillPatterns[reverseOffset + 1](p, colors)
}

export const getFillContinuous = (len, i, colors) => {
  return continuousFillPatterns[i](getColorContinuous(len, i, colors))
}

// functions for assigning color / pattern combination
const offset = (len, i) => Math.ceil(Math.abs(i + 1 - (len + 1) / 2))
const polarity = (len, i) => (i + 1 - (len + 1) / 2) > 0
