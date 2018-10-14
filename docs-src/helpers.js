const questions = [
  "I am the very model of a modern major general.",
  "I've information vegetable, animal, and mineral.",
  "I know the kings of England, and I quote the fights historical.",
  "From Marathon to Waterloo, in order categorical.",
  "I'm very well acquainted, too, with matters mathematical.",
  "I am the very model of a modern major general.",
  "I've information vegetable, animal, and mineral.",
  "I know the kings of England, and I quote the fights historical.",
  "From Marathon to Waterloo, in order categorical.",
  "I'm very well acquainted, too, with matters mathematical.",
]

// generate likert data from scale
export const getRandSurveyData = (scale, n) => {
  return questions.slice(0, n).map(prompt => {
    const distribution = getRandDist(scale)
    return {
      prompt,
      mean: getDistMean(scale, distribution),
      n: 100 + Math.round(Math.random() * 50),
      ...distribution,
    }
  })
}

// generate random answer distribution from scale
export const getRandDist = scale => {
  const dist = {};
  const n = scale.length;

  for (let i=0; i < n; i++) { 
    let remaining = 1 - Object.values(dist).reduce((sum,d) => sum+d, 0)
    if (i != n - 1) remaining = Math.min(remaining, 0.35)
    dist[scale[i]] = (i == n - 1) ? remaining : Math.max(Math.random() * remaining, 0.05)
  } 
  return dist 
}

const getOffset = (len, i) => 
  Math.ceil(Math.abs(i + 1 - (len + 1) / 2)) 
  * ((i + 1 > (len + 1) / 2) ? 1 : -1)

// calculate mean (diverging, from - to +) from distribution
const getDistMean = (scale, dist) => {
  return scale.reduce((sum, ans, i) => 
    sum + getOffset(scale.length, i) * dist[ans],
    0
  ).toFixed(2)
}