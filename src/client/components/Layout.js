import React from 'react'
import styled from 'styled-components'
import {clearFix} from 'polished'

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => `repeat(${props.cols || 3}, 1fr)`};
  grid-column-gap: 15px;
`

export const Box = styled.div`
  background: #fff;
  border: 2px solid #eee;
  border-top: none;
  margin-top: 15px;
  ${clearFix()};
  & > h3 {
    margin: 0px;
    padding: 10px;
    border-top: 2px solid
      ${props =>
        props.green
          ? '#028800'
          : props.orange
            ? '#E36C04'
            : '#44a7ff'};
  }
`

export const SelectButton = styled.button`
  background: ${props => (props.selected ? '#44A7FF' : '#eee')};
  color: ${props => (props.selected ? '#fff' : '#000')};
  padding: 5px;
  margin: 5px;
  font-size: 130%;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`

export const Float = styled.div`
  float: ${props => (props.right ? 'right' : 'left')};
`

export const ClearFix = styled.div`
  ${clearFix()};
`

export const Button = styled.button`
  background: ${props =>
    props.green
      ? '#028800'
      : props.blue
        ? '#44A7FF'
        : props.red
          ? '#DD0000'
          : '#ccc'};
  color: #fff;
  border: none;
  margin: 5px;
  padding: 10px;
  cursor: pointer;
`

export const Data = styled.div`
  display: grid;
  grid-template-columns: minmax(100px, auto) 1fr;
  grid-gap: 2px;
  margin: 3px;
`

export const ItemName = styled.div`
  background: #ddd;
  padding: 10px;
`

export const ItemValue = styled.div`
  background: #eee;
  font-family: courier;
  padding: 10px;
  overflow: hidden;
`
