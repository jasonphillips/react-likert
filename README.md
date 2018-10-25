## React-Likert

[![npm version](https://badge.fury.io/js/react-likert.svg)](http://badge.fury.io/js/react-likert) 

React components for rendering Likert-like visualizations within a table.

View the [demo](http://jasonphillips.github.io/react-likert/) for a few examples.

### Why?

While various chart options exist for this kind of survey question, none of them can easily integrate into a true table while offering key features like diverging bars and good defaults. Typically, our survey results will be presented most cleanly in a table format within which the Likert visualization is only one part alongside various other statistics. This tool makes that possible without compromising or splitting between a table and chart. 

### What?

I've taken a somewhat unorthodox approach to rendering:  using the included `<TableWrapper/>`, you replace the cells in the desired column with the `<CellRenderer/>` it provides. This renderer creates normal table cells (with aria attributes to indicate the value of the cell for accessiblity), then draws a single svg over that entire table region and animates it with D3. This offers the benefits of a single chart alongside the stability and accessibility of a true table.  

### How?

A simple syntax example: 

```javascript
import React from 'react'
import { TableWrapper } from 'react-likert'

const scale = [
  'Strongly Disagree',
  'Disagree',
  'Undecided',
  'Agree',
  'Strongly Agree',
]

const data = [
  {
    prompt: 'Likerts are useful', 
    responded: 35,
    'Strongly Disagree': 0.3, 
    'Disagree': 0.25, 
    'Undecided': 0, 
    'Agree': 0.22, 
    'Strongly Agree': 0.23 
  },
  { 
    prompt: 'D3 is still a viable choice in React projects',
    responded: 38,
    'Strongly Disagree': 0.1, 
    'Disagree': 0.22, 
    'Undecided': 0.05, 
    'Agree': 0.45, 
    'Strongly Agree': 0.18 
    },
  // etc
]

const DivergingLikertExample = props => (
  <div>
    <TableWrapper scale={scale}>
      {
        CellRenderer => 
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{textAlign: 'left'}}>prompt </th>
                <th style={{textAlign: 'left', width: '3em'}}>n </th>
                <td style={{width: '50%'}}> </td>                
              </tr>
            </thead>
            <tbody>
              {
                data.map(({ prompt, responded, ...values }, i) => 
                  <tr key={i}>
                    <td>{prompt}</td>
                    <td>{responded}</td>
                    <CellRenderer value={values} />
                  </tr>
              )}
            </tbody>
          </table>
      }
    </TableWrapper>
  </div>
)
```

### Components

#### `<TableWrapper>`

Required as parent of the `<table>` you will draw; requires a `scale` prop at minium (with a flat list of Likert choices in the order you wish them displayed), but will also accept `options` object (see section below). Provides a `CellRenderer` to its child (in the render-prop or function-as-child pattern), which will be bound to this table context so that rendering of each Likert can be coordinated as a single visualization. 

```jsx
<TableWrapper scale={scale} options={{ usePatterns: false }}>
  {CellRenderer => 
      <table>
        ... // see below for usage of CellRenderer  
      </table>
  }
</TableWrapper>
```

Note that the `scale` is assumed to be a symmetrical Likert (unless using `continuous: true` option; see below), so that the positive / negative values divide either evenly or with a "neutral" middle term when the count is odd. 

Example scales:

  `[ 'Strongly Disagree', 'Disagree', 'Undecided', 'Agree', 'Strongly Agree' ]`    
  `[ 'Very Unlikely', 'Unlikely', 'Likely', 'Very Likely' ]`  

#### `<CellRenderer>`

This component is not a direct export of the library, and is provided only by the `TableWrapper` invoked as shown above. Use it to render the entire table cell where you want the Likert, passing a `value` object with keys matching the scale you passed to the `TableWrapper`, as floats adding up to 1.

```jsx
{CellRenderer => 
  <table>
    <thead>
      <tr>
        <th>prompt </th>
        <th>result </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Is this library useful?</td>
        <CellRenderer value={{"Disagree": 0.23, "Agree": 0.77 }} />
      </tr>
      <tr>
        <td>Would you recommend it?</td>
        <CellRenderer value={{"Disagree": 0.55, "Agree": 0.45 }} />
      </tr>
    </tbody>
  </table>
}
```

#### `<LikertLegend>`

Draws a simple legend for your Likert, for use outside of the table. Requires the `scale`, optionally accepts `inline` (Boolean; if true, renders as spans inline), a `size` in pixels for the squares, and any additional styles to apply.

```jsx
<LikertLegend
  scale={scale}
  inline={true}
  size={12}
  style={{ textAlign: 'right' }}
/>
```

### Options

The `options` object should be passed as a prop to the `<TableWrapper>`, and offers a number of customizations (see examples and their source code for context).

| Key            | Type                         | Description                                                               |
| -------------- | ---------------------------- | ------------------------------------------------------------------        |
| `diverging`    | `Boolean`                    | Whether to draw as diverging bars; if `false`, renders as normal stacked. |
| `usePatterns`  | `Boolean`                    | By default, patterns are applied to the segments; pass `false` to disable.|
| `continuous`   | `Boolean`                    | If set to `true`, a continuous scale will be drawn (no pos/neg polarity). |
| `colors`       | `Array`                      | Custom colors; the order depends on the type of chart, see below.         |

The `colors` take one of two forms. For the default diverging type of chart, you must pass three items with two nested arrays:
   
   `[ neutral, [left-main, left-highlight], [right-main, right-highlight]]`
   
   e.g.
   `['#888', ['#800e84', '#ad72b5'], ['#006f30','#48bf6f']]`
   
For a "continuous" chart, where the scale does not have a left / right polarity and simply increases, you only pass two values:

   `[ left, right ]`
   
   e.g.
   `['#eeeeee', '#995555']`
   
Once again, check the examples for usage in context.   



