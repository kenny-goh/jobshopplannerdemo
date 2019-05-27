import React from 'react';
import Gantt from './gantt'

/**
 * TODO: Clean up code debt
 * TODO: Remove hard codings
 * @author Kenny Goh
 */
export default class GanttContainer extends React.Component {

    state = {
        resources: []
    }

    /**
     * 
     */
    constructor(props) {
        super(props)
        this.replanTask = this.replanTask.bind(this);
        this.replanTaskToRow = this.replanTaskToRow.bind(this);
        this.state.resources = props.resources;
    }

    /**
     * 
     * @param {*} nextProps 
     */
    componentWillReceiveProps(nextProps) {
        this.setState({ 
            resources : nextProps.resources
        });
    }

    /**
     * 
     * @param {*} taskDraggedID 
     * @param {*} taskDroppedOnID 
     */
    replanTask(taskDraggedID, taskDroppedOnID) {
        
            let resources = this.state.resources;
            let fromParams = taskDraggedID.split(":")
            let toParams = taskDroppedOnID.split(":")
            let fromResource = resources[parseInt(fromParams[0])]
            let toResource = resources[parseInt(toParams[0])]

            let fromSeq = fromParams[1];
            let toSeq = toParams[1];
            console.log(fromParams[0], fromSeq, toParams[0], toSeq)
            let fromTask = fromResource.tasks[fromSeq];
            let toTask = toResource.tasks[toSeq];

            let precondition = toResource.checkAllowedToPlan(fromTask)
            if (precondition)
            {
                alert(precondition)
            } 
            else {
                fromResource.removeTask(fromTask);
                toResource.addTask(fromTask);
                this.setState({ resources: [] });   // Workaround for state not refreshing
                this.setState({ resources: resources });
                this.props.onRefresh();
            }   
      
    }

    /**
     * 
     * @param {*} row 
     * @param {*} taskDraggedID 
     */
    replanTaskToRow(row, taskDraggedID) {

            let resources = this.state.resources;
            let fromParams = taskDraggedID.split(":")
            let fromResource = resources[parseInt(fromParams[0])]
            let toResource = resources[row]

            let fromSeq = fromParams[1];
            let fromTask = fromResource.tasks[fromSeq];

    
            let precondition = toResource.checkAllowedToPlan(fromTask)
            if (precondition)
            {
                alert(precondition)
            } 
            else {
                fromResource.removeTask(fromTask);
                toResource.addTask(fromTask);
                this.setState({ resources: [] });   // Workaround for state not refreshing
                this.setState({ resources: resources });
                this.props.onRefresh();
            }   
        
    }


    render() {
        return (
            <Gantt data={this.state.resources}
                onReplanTask={this.replanTask}
                onReplanTaskToRow={this.replanTaskToRow} />
        );
    }

}

