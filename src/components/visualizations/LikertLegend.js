import React from 'react'
import { 
  defaultColors, 
  getColor, 
  getColorContinuous, 
  getFill,
  getFillContinuous,
} from './colorsPatterns'
const d3 = require('d3')

const defaultOptions = {
  colors: defaultColors,
  usePatterns: true,
  continuous: false,
}

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
      ? useOptions.continuous
        ? getFillContinuous(n, index, useColors)
        : getFill(n, index, useColors)
      : useOptions.continuous
        ? getColorContinuous(n, index, useColors)
        : getColor(n, index, useColors)

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

export const LikertLegend = ({ scale, options, inline, size, style }) => (
  <div style={style || {}}>
      {scale.map((choice, i) => 
        // loop through scale, draw box / label for each
        <div 
          key={choice} 
          style={{
            display: inline ? 'inline-block' : 'block', 
            fontSize: `${size || 15}px`,
            paddingLeft: '1em',
          }}
        >
          <LikertKey
            scale={scale} 
            options={options}
            index={i} 
            height={size || 15} 
            width={size || 15} 
            style={{ display: 'inline-block' }}
          />
          &nbsp; {choice}
        </div>
      )}
    </div>
)