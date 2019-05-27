import React from 'react';
import GanttNode from './ganttnode'


/**
 * TODO: Clean up code debt
 * TODO: Remove hard codings
 * @author Kenny Goh
 */
export default class GanttRow extends React.Component {
  state = {
  }
  constructor(props) {
    console.log('GanttRow->constructor()')
    super(props);
    this.state.text = this.props.text
    this.state.tasksData = this.props.tasksData
  }


  createNodes = () => {
    var row = this.props.row
    let rows = []
    this.state.tasksData.map((element, index) => {
      element.level = 0;
    });

    this.state.tasksData.map((element) => {
        this.state.tasksData.map((element2) => {
          if (element == element2) {
            return;
          }
          else if (element.start >= element2.start &&
                   element.start < (element2.start + element2.duration) &&
                   element.level == element2.level) {         
              element.level = element2.level + 1;
          }
        });
    });
    this.state.tasksData.map((element, index) => {
      rows.push(<GanttNode 
        row={row}
        seq={index}
        showShadowRect={this.props.showShadowRect}
        text={element.operation.order.name + '\n' + element.operation.name}
        start={element.start}
        level = {element.level}
        duration={element.duration} />);
    });
    
    return rows;
  }

  render() {
    return(
      // shortcut for Fragments
      <>
        {this.createNodes()}
      </>
    );
  }
}

//text={element.operation.order.name[5] + '-' + element.operation.name[0] + element.operation.index}