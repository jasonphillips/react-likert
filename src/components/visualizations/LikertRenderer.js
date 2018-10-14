import makeScopedD3Factory from '../ScopedD3Base'
import React from 'react'
import { 
  defaultColors, 
  getColor, 
  getColorContinuous, 
  getFill,
  getFillContinuous,
} from './colorsPatterns'
const d3 = require('d3')

// general
const margin = {top: 0, right: 20, bottom: 0, left: 20}
const maxBarHeight = 50
const minRowPadding = 2
const total_height = 38

const defaultOptions = {
  colors: defaultColors,
  diverging: true,
  usePatterns: true,
  // this option only used in legend below
  continuous: false,
}

export const renderLikert = makeScopedD3Factory(
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

    let maxLeft = 0
    let xScale = 1
    let getLeft = () => 0

    if (useOptions.diverging) {
      // get max left (negative) offset of likert, for midpoint of stack
      maxLeft = stack.length % 2
        ? d3.max(stack[Math.ceil(stack.length / 2) - 1], a => a[0] + (a[1] - a[0]) / 2)
        : d3.max(stack[stack.length / 2 - 1], a => a[1])

      // and right
      const maxRight = stack.length % 2
        ? d3.max(stack[Math.ceil(stack.length / 2) - 1], a => 1 - (a[0] + (a[1] - a[0]) / 2))
        : d3.max(stack[stack.length / 2 - 1], a => 1 - a[1])

      // func for getting left offset of one row
      getLeft = (i) => stack.length % 2
        ? (a => a[0] + (a[1] - a[0]) / 2)(stack[Math.ceil(stack.length / 2) - 1][i])
        : stack[stack.length / 2 - 1][i][1]

      // get scaled range horizontally to fit all
      xScale = maxLeft + maxRight
    }

    const barHeight = Math.min.apply(null, data.map((d,i) => 
      (data[i+1] ? data[i+1].rect.offsetY : height) - data[i].rect.offsetY - minRowPadding * 2
    ).concat([maxBarHeight]))

    const rowPadding = (i) => (
      ((data[i+1] ? data[i+1].rect.offsetY : height) - data[i].rect.offsetY - barHeight) / 2
    )

    let fills = scale.map((s,i) => (!useOptions.diverging && useOptions.continuous)
      ? getColorContinuous(scale.length, i, colors)
      : getColor(scale.length, i, colors)
    )
    
    if (usePatterns) {
      fills = scale.map((s,i) => (!useOptions.diverging && useOptions.continuous)
        ? getFillContinuous(scale.length, i, colors)
        : getFill(scale.length, i, colors)
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
          maxLeft * (1/xScale) * width
         }, ${
          data[i].rect.offsetY + rowPadding(i)
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
          useOptions.diverging 
            ? (maxLeft - (getLeft(i) || 0)) * (1/xScale) * width
            : 0
        }, ${
          data[i].rect.offsetY + rowPadding(i)
        })`
      )
       
    const boxes = rowsInner.selectAll('rect')
      .data(d => stack.map(s => ({...s, i: s[d] } )))
      .enter()
      .append('rect')
      .attr('class', d => `likert-box-${d.index} box`)
      .attr('y', 0)
      .attr('height', barHeight)
      .attr('x', d => d['i'][0] * width)
      .attr('width', d => 
        d['i'][1]
          ? (d['i'][1] - d['i'][0]) * width
          : 0
      )
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

    if (useOptions.diverging) {
      const center =  maxLeft * (1/xScale) * width

      const refline = g.append('line')
        .attr('x1', center)
        .attr('x2', center)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#555555')
    }

    boxes.on("mouseover", (d) => {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9)
      tooltip.html(`<div>${d.key}<br/>${(d['i'].data[d.key] * 100).toFixed(0)}%</div>`)
        .style("left", Math.round(d3.event.layerX || d3.event.offsetX) + "px")
        .style("top", Math.round(d3.event.layerY || d3.event.offsetY - 28) + "px")
      })
    .on("mouseout", (d) => {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
      })
  }
)
