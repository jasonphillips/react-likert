## React-Likert

React components for rendering Likert-like visualizations within a table.

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

View the [demo](http://jasonphillips.github.io/react-likert/) to get started with a few examples.

