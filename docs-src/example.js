import React from 'react'
import { makeDivergingLikert, LikertKey } from '../src'

const scale = [
  'Strongly Disagree',
  'Disagree',
  'Undecided',
  'Agree',
  'Strongly Agree'
]

const inlineBlockStyle = { float: 'left', paddingRight: '10px', fontSize: '0.75em' }

export class DivergingLikertExample extends React.Component {
  constructor(props) {
    super(props)
    this.DivergingLikert = makeDivergingLikert(() => this.container)({ scale })
  }
  render() {
    const DivergingLikert = this.DivergingLikert

    return (
      <div
        style={{position: 'relative'}} 
        ref={elem => {this.container = elem}}
      >
        {/*
            Use <LikertKey /> to draw a box with correct color / pattern
            for your legend
        */}
        
        {scale.map((choice, i) => 
          <div key={choice} style={inlineBlockStyle}>
            {choice} 
            <LikertKey
              scale={scale} 
              index={i} 
              height={15} 
              width={15} 
              style={inlineBlockStyle}
            />
          </div>
        )}
        <div style={{ clear: 'both' }} />

        <table className="demo">
          <thead>
            <tr>
              <th style={{textAlign: 'left'}}> </th>
              <td style={{width: '50%'}}> </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>I am the very model of a modern major general.</td>
              <DivergingLikert
                value={{
                  "Strongly Disagree": 0.8,
                  "Agree": 0.2,
                }}
              />
            </tr>
            <tr>
              <td>I've information vegetable, animal, and mineral.</td>
              <DivergingLikert
                value={{
                  "Disagree": 0.23,
                  "Agree": 0.2,
                  "Strongly Agree": 0.57,
                }}
              />
            </tr>
            <tr>
              <td>I know the kings of England, and I quote the fights historical.</td>
              <DivergingLikert
                value={{
                  "Strongly Disagree": 0.1,
                  "Disagree": 0.43,
                  "Agree": 0.02,
                  "Strongly Agree": 0.45,
                }}
              />
            </tr>
            <tr>
              <td>From Marathon to Waterloo, in order categorical.</td>
              <DivergingLikert
                value={{
                  "Strongly Disagree": 0.3,
                  "Disagree": 0.1,
                  "Agree": 0.25,
                  "Strongly Agree": 0.35,
                }}
              />
            </tr>
            <tr>
              <td>I'm very well acquainted, too, with matters mathematical.</td>
              <DivergingLikert
                value={{
                  "Strongly Disagree": 0.05,
                  "Disagree": 0.05,
                  "Agree": 0.60,
                  "Strongly Agree": 0.30,
                }}
              />
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
