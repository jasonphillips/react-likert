import createSpanVizualizationFactory from './SpanVisualization'
const d3 = require('d3')

/**
 * accepts a render function that will recieve:
 *   (spanData: object, svg: DOMElement, tooltip: DOMElement)
 * - creates those and positions, sizes them 
 */

const makeScopedD3Factory = renderLoop => createSpanVizualizationFactory(
  (spanData, redraw) => {
    const {
      getContainer,
      question,
      data,
      min, 
      height, 
      width,
    } = spanData
    
    const container = getContainer()
    const offset = container.getBoundingClientRect()

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('left', min.x - offset.left)
      .style('top', min.y - offset.top)

    const g = svg.append('g').attr('transform', 'translate(0,0)')

    const tooltipDiv = d3.select(container)
      .append('div')
      .attr('style', `
        position: absolute; 
        left: ${min.x - offset.left}px; 
        top:  ${min.y - offset.top}px;
      `)

    const tooltip = tooltipDiv.append('div')
      .attr('style', `
        position: absolute;
      `)
      .append('div')
      .attr('class', 'd3-tooltip')
      .attr('style', `
        position: absolute;
        text-align: center;
        width: 90px;
        padding: 4px;
        font: 12px sans-serif;
        background: #333;
        color: white;
        border: 0px;
        pointer-events: none;
        opacity: 0;
      `)

    renderLoop({spanData, svg, g, tooltip})
  }, 
)

export default makeScopedD3Factory