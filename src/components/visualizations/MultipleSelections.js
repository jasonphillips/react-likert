import makeScopedD3Factory from '../ScopedD3Base'
const d3 = require('d3');

// general
const margin = {top: 0, right: 10, bottom: 0, left: 10};

const defaultOptions = {
  maxBarHeight: 15,
  minRowPadding: 2,
}

export const multiSelectionBars = makeScopedD3Factory(
  ({spanData, svg, g, tooltip}) => {
    let {
      getContainer,
      colors,
      options,
      data,
      min, 
      height, 
      width,
    } = spanData

    const opts = {...defaultOptions, ...(options || {})}
    const colorFunction = i => colors[i] ? colors[i] : '#944'
    
    // establish margin up front, replace top-level g 
    g = g.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    width = width - margin.left - margin.right

    const xScale = 100.0

    const barHeight = Math.min.apply(null, data.map((d,i) => 
      (data[i+1] ? data[i+1].rect.offsetY : height) - data[i].rect.offsetY - opts.minRowPadding * 2
    ).concat([opts.maxBarHeight]))

    const rowPadding = (i) => (
      ((data[i+1] ? data[i+1].rect.offsetY : height) - data[i].rect.offsetY - barHeight) / 2
    )

    // 25/50/75 grid lines for x
    g.call(
      d3.axisBottom(
        d3.scaleLinear().domain([0,100]).range([0,width])
      ).tickValues([25,50,75]).tickSize(height).tickFormat(d=>d)
    )
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick').attr('opacity', 0.2))

    const rowsInd = (new Array(data.length)).fill().map((d,i) => i)

    const rows = g.selectAll('g.row')
      .data(rowsInd)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d,i) => 
        `translate(0, ${
          data[i].rect.offsetY + rowPadding(i)
         })`
       )

    const rowsInner = rows
       .append('g')
       .attr('transform', d => 'scale(0,1)')

    rowsInner.transition().delay(300).duration(1000)
       .attr('transform', d => `scale(1)`)
       
    const boxes = rowsInner.selectAll('rect')
      .data(i => [{i, d: data[i] }])
      .enter()
      .append('rect')
      .attr('class', 'box')
      .attr('y', 0)
      .attr('height', barHeight)
      .attr('x', 0)
      .attr('fill', ({i}) => colorFunction(i))
      .attr('width', ({d}) => (
        d.percent
          ? (d.percent * 100 * 1/xScale * width)
          : 0
      ))

    const labelText = rowsInner.selectAll('text')
      .data(i => [{i, d: data[i] }])
      .enter()
      .append('text')
      .attr('dominant-baseline', 'hanging')
      .attr('text-anchor', ({d}) => d.percent > .90 ? 'end' : 'start')
      .attr('fill', ({d}) => d.percent > .9 ? 'white' : 'black')
      .attr('y', 0)
      .attr('x', ({d}) => (
        d.percent
          ? (d.percent * 100 * 1/xScale * width) + (d.percent > .9 ? -2 : 2)
          : 0
      ))
      .style('font-size', `${Math.round(barHeight)}px`)
      .text(({d}) => Math.round(d.percent ? d.percent * 100 : 0) + '% ')

    boxes.on("mouseover", ({d, i}) => {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`
        <div class="tip">
          ${(d.percent * 100).toFixed(0)}%
        </div>
      `)
        .style("left", Math.round(d3.event.layerX || d3.event.offsetX) + "px")
        .style("top", Math.round(d3.event.layerY || d3.event.offsetY - 28) + "px");
      })
    .on("mouseout", (d) => {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      });
  }
)

