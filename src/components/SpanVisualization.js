const React = require('react')
const d3 = require('d3')


function createSpanVizualizationFactory (renderLoop) {
  /**
   * returns a component for table rendering that is scoped to one 
   * shared rendering loop
   */
  return getContainer => additionalProps => {
    const scope = {
      components: new Set(),
      elements: [],
      pending: true,
    }

    const scopeToData = scope => {
      const rects = scope.elements.map(e => e.getBoundingClientRect())
      let data = Array.from(scope.components).map(c => c.props.value)
      const min = {x: d3.min(rects, r => r.left), y: d3.min(rects, r => r.top)}

      return {
        getContainer,
        min,
        width: d3.max(rects, r => r.right) - min.x,
        height: d3.max(rects, r => r.bottom) - min.y,
        data: data.map((d, i) => ({ ...d, 
          rect: {
            offsetX: rects[i].x - min.x,
            offsetY: rects[i].y - min.y,
          },
        })),
        ...(additionalProps || {}),
      }
    } 

    class D3LikertBars extends React.PureComponent {
      constructor(props) {
        super(props)
        this.registerElement = this._registerElement.bind(this)
        this.appendElement = this._appendElement.bind(this)
      }
      _registerElement(elem) {
        if (this.index) {
          scope.elements[this.index] = elem
          return;
        }
        this.index = this.appendElement(this, elem)
      }
      _appendElement(component, elem) {
        if (scope.components.has(component)) return;
        scope.components.add(component)
        scope.elements.push(elem)

        if (scope.pending) {
          // where the initial table layout is essentially synchronous,
          // this nextTick() should be sufficient 
          process.nextTick(() => {
            renderLoop(scopeToData(scope), true)
          });
          scope.pending = false
        }
        return scope.components.size - 1
      }
      // didmount - bind to window resize
      render() {
        const { value } = this.props

        // legible version of the data (accessibility)
        const text = Object.keys(value).map(key => 
          `${key}: ${Math.round(value[key] * 100.0)}%`
        ).join('; ')

        return (
          <td 
            ref={this.registerElement} 
            className="span-cells" 
            aria-label={text}
          >
            &nbsp;
          </td>
        )
      }
    }

    return D3LikertBars
  }
}

module.exports = createSpanVizualizationFactory