import React from 'react';
import { Rect, Text } from 'react-konva';
import Constants from './constants'

/**
 * TODO: Clean up code debt
 * TODO: Remove hard codings
 * @author Kenny Goh
 */
export default class GanttNode extends React.Component {
  state = {
    color: 'lightgreen',
    start: 0,
    duration: 0,
    prev_x: 0,
    prev_Y: 0,
    prev_width: 0,
    prev_height: 0,
    prev_zindex: 0,
    seq: 0
  };

  constructor(props) {
    super(props);
    this.state.start = props.start;
    this.state.duration = props.duration;
    this.state.level = props.level;
    this.state.seq = props.seq;
    this.state.text = props.text;
  }

  onDragStart = e => {
    var rect = this.refs.rect;
    var x = rect.x();
    var y = rect.y();
    var zindex = rect.zIndex();
    this.props.showShadowRect(true, x, y, rect.width(), rect.height());
    rect.zIndex(1000);
    this.setState({
      prev_x: x,
      prev_y: y,
      prev_width: rect.width(),
      prev_height: rect.height(),
      prev_zindex: zindex
    });
  }

  onDragEnd = e => {
    var rect = this.refs.rect
    this.props.showShadowRect(false, 0, 0, 0, 0)
    rect.x(this.state.prev_x);
    rect.y(this.state.prev_y);
    rect.zIndex(this.state.prev_zindex)
    this.setState({
      prev_x: 0,
      prev_y: 0,
      prev_width: 0,
      prev_height: 0,
      prev_zindex: 0
    });
  }

  componentDidMount() {
  }

  render() {
    return (
      <>
        <Text
          name={'label'}
          fontSize={11}
          text={this.state.text}
          x={Constants.XOFFSET + 5 + (this.state.start * Constants.XGRIDSIZE)}
          y={Constants.YOFFSET + (this.props.row * Constants.YGRIDSIZE) + (this.props.level * 20) + 5} />
        <Rect
          name="node"
          ref={"rect"}
          id={this.props.row + ':' + this.props.seq}
          x={Constants.XOFFSET + (this.state.start * Constants.XGRIDSIZE) + 2}
          y={Constants.YOFFSET + (this.props.row * Constants.YGRIDSIZE) + (this.props.level * 20) + 2}
          width={(this.state.duration * Constants.XGRIDSIZE) - 3}
          height={Constants.YGRIDSIZE - 3}
          stroke={'darkgreen'}
          strokeWidth={1}
          draggable  
          fill={"rgba(0, 255, 0, 0.5)"}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd} />
          </>
    );
  }
}


