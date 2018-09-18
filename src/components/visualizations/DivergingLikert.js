import makeScopedD3Factory from '../ScopedD3Base'
import textures from 'textures'
import React from 'react'
const d3 = require('d3')

// general
const margin = {top: 0, right: 20, bottom: 0, left: 20}
const maxBarHeight = 50
const minRowPadding = 2
const total_height = 38

// middle, [negative, negative-accent], [positive, positive-accent]
const defaultColors = ['#ddd', ['#9CF', '#229'], ['#DBB','#900']]

const colorFills = [
  (p, colors) => colors[0],
  (p, colors) => colors[p ? 2 : 1][0],
  (p, colors) => colors[p ? 2 : 1][1],
  (p, colors) => colors[p ? 2 : 1][2],
]

// pattern set 
const fillPatterns = [
  (p, colors) => 
    textures.lines().background(colors[0]).stroke(colors[0]),
  (p, colors) => 
    textures.lines()
      .background(colors[p ? 2 : 1][0]).stroke(colors[p ? 2 : 1][1])
      .thicker().orientation(p ? "2/8" : "6/8"),
  (p, colors) => 
    textures.lines()
      .background(colors[p ? 2 : 1][0]).stroke(colors[p ? 2 : 1][1])
      .orientation("vertical", "horizontal")
      .size(4).strokeWidth(3),
  (p, colors) => 
    textures.lines().background(colors[p ? 2 : 1][0]),
]

// functions for assigning color / pattern combination
const offset = (len, i) => Math.ceil(Math.abs(i + 1 - (len + 1) / 2))
const polarity = (len, i) => (i + 1 - (len + 1) / 2) > 0

const defaultOptions = {
  colors: defaultColors,
  usePatterns: true,
}

export const makeDivergingLikert = makeScopedD3Factory(
  ({spanData, svg, g, tooltip}) => {
    let {
      getContainer,
      scale,
      options,
      data,
      min, 
      height, 
      width,
    } = spanData

    const useOptions = {...defaultOptions, ...(options || {})}
    const colors = useOptions.colors
    const usePatterns = useOptions.usePatterns

    // fill in any missing values with 0s
    data.map((d,i) => 
      scale
        .filter(k => data[i][k]===undefined)
        .forEach(k => { data[i][k] = 0 })
    )

    const stack = d3.stack().keys(scale)(data)
    
    // establish margin up front, replace top-level g 
    g = g.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    width = width - margin.left - margin.right

    // get max left (negative) offset of likert, for midpoint of stack
    const maxLeft = stack.length % 2
      ? d3.max(stack[Math.ceil(stack.length / 2) - 1], a => a[0] + (a[1] - a[0]) / 2)
      : d3.max(stack[stack.length / 2 - 1], a => a[1])

    // and right
    const maxRight = stack.length % 2
      ? d3.max(stack[Math.ceil(stack.length / 2) - 1], a => 1 - (a[0] + (a[1] - a[0]) / 2))
      : d3.max(stack[stack.length / 2 - 1], a => 1 - a[1])

    // func for getting left offset of one row
    const getLeft = (i) => stack.length % 2
      ? (a => a[0] + (a[1] - a[0]) / 2)(stack[Math.ceil(stack.length / 2) - 1][i])
      : stack[stack.length / 2 - 1][i][1]

    // get scaled range horizontally to fit all
    const xScale = maxLeft + maxRight
    const center =  maxLeft * (1/xScale) * width

    const barHeight = Math.round(Math.min.apply(null, data.map((d,i) => 
      (data[i+1] ? data[i+1].rect.offsetY : height) - data[i].rect.offsetY - minRowPadding * 2
    ).concat([maxBarHeight])))

    const rowPadding = (i) => Math.round(
      ((data[i+1] ? data[i+1].rect.offsetY : height) - data[i].rect.offsetY - barHeight) / 2
    )

    
    let fills = scale.map((s,i) =>
      colorFills[offset(scale.length, i)](polarity(scale.length, i), colors))
    
    if (usePatterns) {
      fills = scale.map((s,i) =>
        fillPatterns[offset(scale.length, i)](polarity(scale.length, i), colors)
      )
      fills.forEach(t => t && svg.call(t))
    }

    const rowsInd = (new Array(data.length)).fill().map((d,i) => i)

    const rows = g.selectAll('g.row')
      .data(rowsInd)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d,i) => 
        `translate(${
          Math.round(maxLeft * (1/xScale) * width)
         }, ${
          Math.round(data[i].rect.offsetY + rowPadding(i))
         })`
       )

    const rowsInner = rows
       .append('g')
       .attr('transform', d => 'scale(0,1)')

    rowsInner.transition().duration(500)
       .attr('transform', d => `scale(${1 / xScale})`)

    rows.transition().delay(500).duration(1000)
      .attr('transform', (d,i) => 
        `translate(${
          Math.round((maxLeft - (getLeft(i) || 0)) * (1/xScale) * width)
        }, ${
          Math.round(data[i].rect.offsetY + rowPadding(i))
        })`
      )
       
    const boxes = rowsInner.selectAll('rect')
      .data(d => stack.map(s => ({...s, i: s[d] } )))
      .enter()
      .append('rect')
      .attr('class', d => `likert-box-${d.index}`)
      .attr('y', 0)
      .attr('height', barHeight)
      .attr('x', d => Math.round(d['i'][0] * width))
      .attr('width', d => Math.round(
        d['i'][1]
          ? (d['i'][1] - d['i'][0]) * width
          : 0
      ))
      .style('fill', d => usePatterns ? fills[d.index].url() : fills[d.index])

    const shadows = rowsInner.selectAll('.box-label-s')
      .data(d => stack.map(s => ({...s, i: s[d] } )).filter(s => !isNaN(s['i'][1]) && (s['i'][1] - s['i'][0])>.1)  )
      .enter()
      .append('text')
      .attr('class', 'box-label-s')
      .attr('y', barHeight / 2 + 6)
      .attr('x', d => d['i'][0] * width + (d['i'][1] - d['i'][0]) * width / 2)
      .attr('opacity', 0)
      .text(d => Math.round(d['i'].data[d.key] * 100) + '%')
      .attr('style', `
        stroke: white;
        stroke-width: 4;
        text-anchor: middle;
      `)
      
    const labels = rowsInner.selectAll('.box-label')
      .data(d => stack.map(s => ({...s, i: s[d] } )).filter(s => !isNaN(s['i'][1]) && (s['i'][1] - s['i'][0])>.1)  )
      .enter()
      .append('text')
      .attr('class', 'box-label')
      .attr('y', barHeight / 2 + 6)
      .attr('x', d => d['i'][0] * width + (d['i'][1] - d['i'][0]) * width / 2)
      .attr('opacity', 0)
      .attr('style', `
        stroke: black;
        stroke-width: 1;
        text-anchor: middle;
      `)
      .text(d => Math.round(d['i'].data[d.key] * 100) + '%')

    shadows.transition().delay(1500).duration(500).attr('opacity', 0.9)
    labels.transition().delay(1700).duration(500).attr('opacity', 1)

    const refline = g.append('line')
      .attr('x1', center)
      .attr('x2', center)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#555555')

    boxes.on("mouseover", (d) => {
      console.log({d})
      tooltip.transition()
        .duration(200)
        .style("opacity", .9)
      tooltip.html(`<div>${d.key}<br/>${(d['i'].data[d.key] * 100).toFixed(0)}%</div>`)
        .style("left", (d3.event.offsetX) + "px")
        .style("top", (d3.event.offsetY - 28) + "px")
      })
    .on("mouseout", (d) => {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
      })
  }
)

// simpler component for legend box
export class LikertKey extends React.Component {
  constructor(props) {
    super(props)
    this.updateChart = this.updateChart.bind(this)
  }
  componentDidMount() {
    setTimeout(() => this.updateChart(), 100)
  }
  updateChart() {
    const { index, total, scale, width, height, options } = this.props
    const useOptions = {...defaultOptions, ...(options || {})}
    const colors = useOptions.colors
    const usePatterns = useOptions.usePatterns

    // reset
    this.svg.innerHTML = null
    this.svg.setAttribute('width', 0)
    const n = total || scale.length

    const useColors = colors || defaultColors

    const boxWidth = this.div.getBoundingClientRect().width
    const boxHeight = this.div.getBoundingClientRect().height
    const svg = d3.select(this.svg).attr('width', width)

    const pattern = usePatterns
      ? fillPatterns[offset(n, index)](polarity(n, index), useColors)
      : colorFills[offset(n, index)](polarity(n, index), useColors)

    if (usePatterns) svg.call(pattern)

    svg.append('rect')
      .attr('height', height || boxHeight)
      .attr('width', width || boxWidth)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', usePatterns ? pattern.url() : pattern)
  }
  render () {
    const { height, width, style } = this.props
    return (
      <div ref={elem => { this.div = elem }} style={style || {}}>
        <svg ref={elem => { this.svg = elem }} height={height || 0} width={width || 0}/>
      </div>
    )
  }
}

export const LikertLegend = ({ scale, height, colors }) => (
  <table style={{ width:'100%' }} className="likertLegend">
      <tbody>
      <tr style={{verticalAlign:'bottom', fontWeight:'normal'}}>
          {scale.map((answer,i) => <td key={i} style={{textAlign:'center'}}>{answer}</td> )} 
      </tr>
      <tr>
          {scale.map((answer,i) => 
          <td key={i} width={`${Math.floor(100 / scale.length)}%`}>
              <LikertKey
                index={i} 
                total={scale.length} 
                height={height || 10}
                colors={colors}
              />
          </td>
          )}
      </tr>
      </tbody>
  </table>
)
