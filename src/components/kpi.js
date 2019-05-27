
import React from 'react';

/**
 * Simple KPI label
 * 
 * TODO: Make intervanl configurable
 * TODO: Clean up code debt
 * TODO: Remove hard codings
 * 
 * @author Kenny Goh
 */
export default class KPI extends React.Component {

    constructor(props) {
        console.log('KPI>constructor()')
        super(props);
        this.state = {
            label: props.label,
            className : props.className,
            value : props.value,
            colorClassName: this.getColor()
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            value: nextProps.value,
            colorClassName: this.getColor(nextProps.value)
        });
    }

    getColor=(value)=> {
        if (value >= 0 && value < 50) {
            return  'kpi-bad';
        }  
        else if (value >= 0 && value < 75) {
            return 'kpi-warning';
        }  
        return 'kpi-good';
    }

    render() {
        return ( <><span className={this.state.className}>{this.state.label}</span>: <span className={this.state.colorClassName}>[{this.state.value}%]</span></> );
    }
}