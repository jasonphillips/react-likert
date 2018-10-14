import React from 'react'
import { multiSelectionBars, TableWrapper } from '../src'
import { getRandSurveyData } from './helpers'

const data = getRandSurveyData(['Q'], 5)

const MultipleSelectBars = props => (
  <div>
    <TableWrapper renderer={multiSelectionBars}>
      {
        CellRenderer => 
          <table className="demo" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{textAlign: 'left'}}>prompt </th>
                <th style={{textAlign: 'left', width: '3em'}}>n </th>
                <td style={{width: '50%'}}> </td>                
              </tr>
            </thead>
            <tbody>
              {
                data.map(({ prompt, n, mean, ...values }, i) => 
                  <tr key={i}>
                    <td>{prompt}</td>
                    <td>{n}</td>
                    <CellRenderer value={{ percent: Math.random().toFixed(2) }} />
                  </tr>
              )}
            </tbody>
          </table>
      }
    </TableWrapper>
  </div>
)

export default MultipleSelectBars