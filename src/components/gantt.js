
import React from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import Constants from './constants'
import GanttRow from './ganttrow'
import Helper from './helper'

/**
 * GanttChart View with Drag and Drop functionality.
 * 
 * 
 * TODO: Clean up code debt
 * TODO: Remove hard codings
 * @author Kenny Goh
 */
export default class Gantt extends React.Component {
  state = {
  }

  /**
   * 
   */
  constructor(props) {
    console.log('Gantt->constructor()') 
    super(props);
    this.state = {
      data: props.data,
      rows: props.data.length,
    };
    this.prev_dragged_task = '';
    this.prev_dropped_task = '';
  }

  componentDidMount() {
    var shadowRect = this.refs.shadowRect;
    shadowRect.hide();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({data: nextProps.data});
  }

  showShadowRect = (show, x, y, width, height) => {
    var shadowRect = this.refs.shadowRect;
    shadowRect.x(x);
    shadowRect.y(y);
    shadowRect.width(width);
    shadowRect.height(height);

    if (show) {
      shadowRect.show();
    }
    else {
      shadowRect.hide();
      this.forceUpdate()
    }
  }

  /**
   * 
   */
  _createLabelsAndGrids = () => {
    let divs = []
    let columns = Constants.TEST_NUMOF_DAYS;
    let rows = this.state.rows;

    // Shade employee cell
    divs.push(<Rect
      x={0}
      y={Constants.YOFFSET}
      width={Constants.XOFFSET}
      height={rows * Constants.YGRIDSIZE}
      fill={'#E8E8E8'}
    />);


    // Render vertical bars
    var height = Constants.YOFFSET + (this.state.rows * Constants.YGRIDSIZE)
    for (let i = 0; i < columns + 1; i++) {
      divs.push(<Line points={[Constants.XOFFSET + Math.round(i * Constants.XGRIDSIZE) + 0.5, Constants.YOFFSET, Constants.XOFFSET + Math.round(i * Constants.XGRIDSIZE) + 0.5, height]}
        stroke={'lightGrey'}
        strokeWidth={1} />);

    }

    divs.push(<Text
      text="Time in Hours"
      fontStyle={'bold'}
      fontSize={12}
      x={(Constants.XOFFSET + (Constants.TEST_NUMOF_DAYS * Constants.XGRIDSIZE)) / 2}
      y={3}
    />)

    // Render time label
    for (var i = 0; i <= Constants.TEST_NUMOF_DAYS; i++) {
      divs.push(<Text
        text={i}
        fontSize={12}
        x={Constants.XOFFSET + ((i * Constants.XGRIDSIZE) - (Constants.XGRIDSIZE / 2))}
        y={Constants.TIME_LABEL_Y_OFFSET}
      />);
    }

    let width = Constants.XOFFSET + (Constants.TEST_NUMOF_DAYS * Constants.XGRIDSIZE);
    let lastIndex = -1
    this.state.data.map((element, index) => {
      // Render horiz bars
      let y = (index * Constants.YGRIDSIZE) + Constants.YOFFSET
      divs.push(<Line points={[0, y, width, y]}
        stroke={'lightGrey'}
        strokeWidth={0.5} />);
      // Render Resource label           
      divs.push(<Text x={5}
        y={(index * Constants.YGRIDSIZE) + Constants.YOFFSET + 6 }
        fontSize={15}
        fontStyle={'bold'}
        text={element.name + ' (' + element.operationName + ')'} />)
      lastIndex = index;
    });
    let y = (lastIndex * Constants.YGRIDSIZE) + Constants.YGRIDSIZE + Constants.YOFFSET
    divs.push(<Line points={[0, y, width, y]}
      stroke={'lightGrey'}
      strokeWidth={0.5} />);

    return divs
  }

  /**
   * 
   */
  _createRows = () => {
    console.log(this.state.data.length)
    var divs = []
    this.state.data.map((element, index) => {
      divs.push(<GanttRow key={index} showShadowRect={this.showShadowRect} text={element.name } row={index} tasksData = {element.tasks} />)
    });
    return divs
  }

  onDragStart = (e) => {
    var target = e.target;
    this.prev_dragged_task = target.id();
  }

  onDragMove = (e) => {
    var target = e.target;
    var targetRect = e.target.getClientRect();
    var elements = this.refs.group
    let self = this;
    elements.children.each(function (each) {
      // do not check intersection with itself
      if (each === target) {
        return;
      }
      if (each.name() == "label" || target.name() == "label") {
        return;
      }
      if (Helper.haveIntersection(targetRect,each.getClientRect()) ) {
        each.fill('red');
        self.prev_dropped_task = each.id()
      } else {
        self.prev_dropped_task = ''  
        each.fill('rgba(0, 255, 0, 0.5)')
      }
    });
  }

  onDragEnd = (e) => {

    var dragged_task = this.prev_dragged_task;
    var dropped_task = this.prev_dropped_task;

    if (dragged_task && dropped_task) {
        this.props.onReplanTask(dragged_task, dropped_task)
    } 
    else {
      let rows = this.state.rows;
      let y = this.refs.stage.getPointerPosition().y
      // find rows
      for (var i = 0; i < rows; i++) {
        let rowStart = + Constants.YOFFSET + (i * Constants.YGRIDSIZE);
        let rowEnd = rowStart + Constants.YGRIDSIZE;
        if (y >= rowStart && y < rowEnd) {
          this.props.onReplanTaskToRow(i, dragged_task);
        }
      }
    }

    var group = this.refs.group
    group.children.each(function (each) {
      if (each.name() == "node") {
        each.fill('rgba(0, 255, 0, 0.5)')
      }
    });

    this. prev_dragged_task = '';
    this.prev_dropped_task ='';
    
  }

  render() {
    return (
       <Stage  ref="stage" width={window.innerWidth} height={400}>
        <Layer ref="layer">
          <Rect ref={"shadowRect"}
            x={0}
            y={0}
            width={Constants.XGRIDSIZE}
            height={Constants.YGRIDSIZE}
            fill={'#FF7B17'}
            opacity={0.7}
            stroke={'#CF6412'}
            strokeWidth={1}
            dash={[20, 2]} />
          {this._createLabelsAndGrids()}
          <Group ref="group" onDragStart={this.onDragStart}
                             onDragMove={this.onDragMove}
                             onDragEnd={this.onDragEnd}>
            {this._createRows()}
          </Group>
        </Layer>
        </Stage>
    );
  }
}


