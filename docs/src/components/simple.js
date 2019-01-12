import React from 'react'
import { LikertKey, LikertLegend, TableWrapper } from '../../../src'
import { getRandSurveyData } from './helpers'

const scale = [
  'Strongly Disagree',
  'Disagree',
  'Undecided',
  'Agree',
  'Strongly Agree',
]

const data = getRandSurveyData(scale, 5)

const DivergingLikertExample = props => (
  <div>
    <LikertLegend
      scale={scale}
      inline={true}
      size={12}
      style={{ textAlign: 'right' }}
    />
    <TableWrapper scale={scale}>
      {
        CellRenderer => 
          <table className="demo" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{textAlign: 'left'}}>prompt </th>
                <th style={{textAlign: 'left', width: '3em'}}>n </th>
                <td style={{width: '50%'}}> </td>
                <th style={{textAlign: 'left'}}>mean </th>
                
              </tr>
            </thead>
            <tbody>
              {
                data.map(({ prompt, n, mean, ...values }, i) => 
                  <tr key={i}>
                    <td>{prompt}</td>
                    <td>{n}</td>
                    <CellRenderer value={values} />
                    <td style={{ textAlign: 'right' }}>{mean}</td>
                  </tr>
              )}
            </tbody>
          </table>
      }
    </TableWrapper>
  </div>
)

export default DivergingLikertExample
