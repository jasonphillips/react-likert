import React from 'react'
import { renderLikert } from './visualizations/LikertRenderer'

// adapte from _.js
const debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

class DOMContainer extends React.Component {
  constructor(props) {
    super(props)
    const { scale, options } = props
    let renderer = props.renderer || renderLikert

    this.CellRenderer = renderer(() => this.container, { scale, options })
  }
  render() {
    const { children } = this.props
    const CellRenderer = this.CellRenderer

    return (
      <div
        style={{position: 'relative'}} 
        ref={elem => {this.container = elem}}
      >
        { children(CellRenderer) }
      </div>
    )
  }
}

/**
 * simple key increment used to force complete redraw on screen resize
 */
class ScreenResizeWrapper extends React.Component {
  state = { key: 0 }
  constructor(props) {
    super(props)
    this.resize = debounce(this.forceResizing, 100)
  }
  getOptions = () => {
    // if smallOptions & smallBreakpoint, check size
    const { smallOptions, smallBreakpoint, options } = this.props
    return (smallOptions && smallBreakpoint)
      ? typeof(window)!=="undefined" && window.innerWidth < smallBreakpoint
        ? { ...options, ...smallOptions }
        : options
      : options
  }
  componentDidMount() {
    window.addEventListener('resize', this.resize); 
  }
  componentWillUnmount() { 
    window.removeEventListener('resize', this.resize); 
  }
  forceResizing = () => this.setState(state => ({ key: state.key + 1 }))
  render() {
    const options = this.getOptions()
    return <DOMContainer key={this.state.key} {...this.props} options={options} />
  }
}

export default ScreenResizeWrapper
