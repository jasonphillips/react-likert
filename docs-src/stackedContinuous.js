import React from 'react'
import { LikertLegend, TableWrapper } from '../src'
import { getRandSurveyData } from './helpers'

const scale = [
  'Never',
  'Rarely',
  'Occasionally',
  'Weekly',
  'Daily'
]

const options = {
  diverging: false,
  usePatterns: true,
  continuous: true,
  colors: ['#eeeeee', '#995555'], 
}

const data = getRandSurveyData(scale, 3)
const floatLegendStyle = { float: 'right', paddingLeft: '10px', fontSize: '0.75em' }

const StackedContinuousExample = props => (
  <div>
    <LikertLegend
      scale={scale}
      options={options}
      inline={true}
      size={12}
      style={{ textAlign: 'right' }}
    />

    <TableWrapper scale={scale} options={options}>
      {
        CellRenderer => 
          <table className="demo" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{textAlign: 'left'}}>How often do you think this? </th>
                <th style={{textAlign: 'left', width: '3em'}}>n </th>
                <th style={{textAlign: 'left'}}>mean </th>
                <td style={{width: '50%'}}> </td>
              </tr>
            </thead>
            <tbody>
              {
                data.map((d,i) => 
                  <tr key={i}>
                    <td>{d.prompt}</td>
                    <td>{d.n}</td>
                    <td>{d.mean}</td>
                    <CellRenderer value={d} />
                  </tr>
              )}
            </tbody>
          </table>
      }
    </TableWrapper>
  </div>
)

export default StackedContinuousExample

