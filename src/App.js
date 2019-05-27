/**
 * 
 * 
 * 
 * 
 */

import React from 'react';
import axios from 'axios';
import FlexLayout from "flexlayout-react";
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import ReactDataGrid from 'react-data-grid';
import GanttContainer from './components/ganttcontainer';
import KPI from './components/kpi';
import {Company} from './components/model';
import Helper from './components/helper';

import font from 'font-awesome/css/font-awesome.css'; // eslint-disable-line
import '../node_modules/flexlayout-react/style/light.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import './App.css';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    var company = this._createTestData();
    this.state = {
      model: FlexLayout.Model.fromJson(json),
      company: company,
      kpi_ontime: company.kpi_ontime,
      kpi_orders_planned: company.kpi_orders_planned,
      selectedOrderIndexes: [],
      selectedMachineIndexes: [],
      selectedOperationIndexes: [],
      optimising: false
    };
  }


  
  render() {
    return (
      <div id="container">
        <div className="app">
          <Navbar bg="light" expand="lg"   >
            <Navbar.Brand href="#home"><span>Job Shop Scheduling Demo</span></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <NavDropdown title="File" id="menuFile">
                  <NavDropdown.Item>Import from XML</NavDropdown.Item>
                  <NavDropdown.Item>Export to XML</NavDropdown.Item>
                  {/*<NavDropdown.Divider />*/}
                </NavDropdown>
                <NavDropdown title="Development" id="menuDeveloper">
                  <NavDropdown.Item>Enable designer mode</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>

          </Navbar>
          <div className="toolbar">
            <button className='' onClick={this.onPlanSelectedOrder} disabled={this.state.selectedOrderIndexes.length == 0}>Plan order</button>
            <button className='ml-1' onClick={this.onUnplanAll}>Unplan all</button>
            <button className='ml-1' onClick={this.onOptimize}>Optimise</button>
            <span className="ml-5 kpi-label">KPI</span>
            <KPI className="ml-2 kpi-label" label={"Planned"} value={this.state.kpi_orders_planned} ></KPI>
            <KPI className="ml-2 kpi-label" label={"On time"} value={this.state.kpi_ontime} ></KPI>
            {this.state.optimising ?
                <span> <i className="fa fa-spin fa-spinner"/> Optimising...</span>
                :
                <span></span>
             }

          </div>
          <div className="contents">
            <FlexLayout.Layout model={this.state.model} factory={this.factory.bind(this)} />
          </div>
        </div>
      </div>
    );
  }

    /**
   * Factory method to return the correct components to FlexLayout
   */
  factory(node) {
    var component = node.getComponent();
    node.setEventListener("resize", this._refresh)
    if (component === "gantt")        return this._buildGanttComponent();
    if (component === "orders")       return this._buildOrdersGrid();
    if (component === "operations")   return this._buildOperationsGrid();
    if (component === "machines")     return this._buildResourcesGrid();
    if (component === "text")         return this._buildEmptyPanel(node);
    return null;
  }

  /**
   * Event handler to plan orders
   */
  onPlanSelectedOrder = () => {
    let company = this.state.company;
    let indexes = this.state.selectedOrderIndexes;
    let orders = indexes.map(index => company.orders[index]);
    orders.forEach(each => each.plan());
    this._refresh();
  }

  /**
   * Event handler to unplan all orders
   */
  onUnplanAll = () => {
    let company = this.state.company;
    company.unplanAll();

    this._refresh();
  }


  /**
   * Event handler to run simplex optimizer
   */
  onOptimize = () => {

    this.setState({
      'optimising' : true
    })

    // Create a list of task dependencies. eg [['order1_t1','order_t2',.. ], ..]
    let fn_map_orders = (x) => { return x.operations.map(x => x.order.name + '_' + x.name) };
    let task_dependencies = this.state.company.orders.map(fn_map_orders);
 
    // Create a list of tasks eg [{name:"order1_t1", "operation":"Assembly", duration:10, delayCost:5 },..]
    let fn_map_tasks = (x) =>{return x.operations.map( y => { return { 'name'  : x.name + '_' + y.name,  'operation' : y.name,   'duration'  : x.qty,  'delayCost' : (1 / x.due) * 100 * x.qty }})}
    let tasks = Helper.flatten(this.state.company.orders.map(fn_map_tasks));
    
    // Create a list of resources eg [{'name':'machine1', 'operation': 'assembly', 'cost':10}, ..]
    let fn_map_resources = (x) => { return { 'name': x.name, 'operation': x.operationName,'cost': (1 / x.speed) * 100 } }
    let resources = this.state.company.resources.map(fn_map_resources);

    // TODO: replace hardcodings with variables
    let operations = [{ "name": "Assembly" }, { "name": "Painting" }] 

    // Construct requests data
    let request = { "task_dependencies": task_dependencies,"tasks": tasks, "resources": resources, "operations": operations }

    // TODO: replace hardcoding with configurable parameters
    axios.post(`http://localhost:5000/optimize`, request, {timeout:5000})
      .then(this.onOptimizeHandleResult)
      .catch(this.onOptimizeHandleError);
  }

  onOptimizeHandleResult=(result)=> {
    let company = this.state.company;
    company.unplanAll();
    result.data.forEach((each) => {
      let orders = each[0];
      let machine = each[1];
      let tokens = orders.split("_")
      let orderName = tokens[0];
      let opName = tokens[1];
      let matchingOrder = company.orders.find(x => x.name == orderName)
      if (matchingOrder) {
        let operation = matchingOrder.operations.find(x => x.name == opName)
        operation.planOnResource(machine)
      }
      this.setState({
        'company': company,
        'optimising' : false
      })
      this._refresh();
    })
  }

  onOptimizeHandleError=(error)=> {
    //  TODO: use feedback rather than dialog/alert
    alert(error);
    this.setState({
      'optimising' : false
    })
}

    /**
   * Event handler to update the KPIs
   */
  onRefreshKPI = () => {
    let company = this.state.company;
    this.setState({
      kpi_ontime: company.kpi_ontime,
      kpi_orders_planned: company.kpi_orders_planned
    });
  }

  /**
   * Event handler to select rows on resource table
   */
  onResourceRowsSelected = rows => {
    this.setState({
      selectedMachineIndexes: rows.map(r => r.rowIdx)
    })
  }

  /**
   * Event handler to deselect rows on resource table
   */
  onResourceRowsDeselected = rows => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({
      selectedMachineIndexes: this.state.selectedMachineIndexes.filter(
        i => rowIndexes.indexOf(i) === -1
      )
    });
  };

  /**
   * Event handler to select rows on order table
   */
  onOrderRowsSelected = rows => {
    // take only the value from "rows"... this contains the last selected row from the user
    this.setState({
      selectedOrderIndexes: rows.map(r => r.rowIdx)
    })
  };

  /**
   * Event handler to deselect rows on order table
   */
  onOrderRowsDeselected = rows => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({
      selectedOrderIndexes: this.state.selectedOrderIndexes.filter(
        i => rowIndexes.indexOf(i) === -1
      )
    });
  };

  /**
   * Event handler to select rows on operations table
   */
  onOperationRowsSelected = rows => {
    this.setState({
      selectedOperationIndexes: rows.map(r => r.rowIdx)
    })
  }

  /**
   * Event handler to deselect rows on operations table
   */
  onOperationRowsDeselected = rows => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({
      selectedOperationIndexes: this.state.selectedOperationIndexes.filter(
        i => rowIndexes.indexOf(i) === -1
      )
    });
  };


  /**
   * Helper method to create test data
   */
  _createTestData() {
    var company = new Company("Company");
    company.addResource("Machine1", "Assembly", 1);
    company.addResource("Machine2", "Assembly", 1);
    company.addResource("Machine3", "Painting", 1);
    company.addResource("Machine4", "Painting", 1);

    company.addOrder('order1', 1, 5);
    company.addOrder('order2', 1, 5);
    company.addOrder('order3', 1, 5);
    company.addOrder('order4', 2, 5);
    company.addOrder('order5', 1, 5);

    company.addOrder('order6', 2, 12);
    company.addOrder('order7', 1, 12);
    company.addOrder('order8', 2, 12);
    company.addOrder('order9', 2, 12);
    company.addOrder('order10', 1, 12);

    company.addOrder('order11', 2, 15);
    return company;
  }

  /**
   * Helper method to force the screen to refresh. Some components doesn't size properly after the 
   * flex layout was resized. This method is a workaround.
   */
  _refresh = (e) => {
    this.onRefreshKPI();
    // Refresh screen
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 50);
  }

  /**
   * Helper method to return operations from selected order 
   */
  _operationRowGetter = i => {
    if (this.state.selectedOrderIndexes.length > 0) {
      let rowIndex = this.state.selectedOrderIndexes[0]
      return this.state.company.orders[rowIndex].operations[i];
    }
    return null;
  }

  _buildOrdersGrid() {
    const columns = [
      { key: 'name', name: 'Name' },
      { key: 'qty', name: 'Qty' },
      { key: 'due', name: 'Due' },
      { key: 'end', name: 'End' },
      { key: 'plannedAsString', name: 'Planned' }
    ];
    return (<div className="panel">
      <ReactDataGrid
        columns={columns}
        rowKey="id"
        rowGetter={i => this.state.company.orders[i]}
        rowsCount={this.state.company.orders.length}
        enableCellSelect={false}
        enableRowSelect={"multi"}
        rowSelection={{
          showCheckbox: true,
          enableShiftSelect: false,
          onRowsSelected: this.onOrderRowsSelected,
          onRowsDeselected: this.onOrderRowsDeselected,
          selectBy: {
            indexes: this.state.selectedOrderIndexes
          }
        }}
      /></div>);
  }

  _buildOperationsGrid() {
    const columns = [
      { key: 'name', name: 'Name' },
      { key: 'start', name: 'Start' },
      { key: 'end', name: 'End' },
      { key: 'plannedAsString', name: 'Planned' }
    ];
    return (<div className="panel"><ReactDataGrid
      columns={columns}
      rowGetter={this._operationRowGetter}
      rowsCount={3}
      enableCellSelect={false}
      enableRowSelect={"single"}
      emptyRowsView={this.emptyRowsView}
      rowSelection={{
        showCheckbox: true,
        enableShiftSelect: false,
        onRowsSelected: this.onOperationRowsSelected,
        onRowsDeselected: this.onOperationRowsDeselected,
        selectBy: {
          indexes: this.state.selectedOperationIndexes
        }
      }}
    /></div>);

  }

  _buildResourcesGrid() {
    const columns = [
      { key: 'name', name: 'Name' },
      { key: 'operationName', name: 'Operation' },
      { key: 'speed', name: 'Speed' }];
    return (<div className="panel"><ReactDataGrid
      columns={columns}
      rowGetter={i => this.state.company.resources[i]}
      rowsCount={this.state.company.resources.length}
      enableCellSelect={false}
      enableRowSelect="single"
      rowSelection={{
        showCheckbox: true,
        enableShiftSelect: false,
        onRowsSelected: this.onResourceRowsSelected,
        onRowsDeselected: this.onResourceRowsDeselected,
        selectBy: {
          indexes: this.state.selectedMachineIndexes
        }
      }}
    /></div>);
  }

  _buildGanttComponent() {
    return (<GanttContainer onRefresh={this._refresh} resources={this.state.company.resources} />);
  }

  _buildEmptyPanel(node) {
    return (<div className="panel">Panel {node.getName()}</div>);
  }
}


var json = {
  global: { tabEnableClose: false },
  borders: [
  ],
  layout: {
    "type": "row",
    "children": [
      {
        "type": "row",
        "weight": 50,
        "children": [
          {
            "type": "row",
            "children": [
              {
                "type": "tabset",
                "weight": 25,
                "children": [
                  {
                    "type": "tab",
                    "name": "Order",
                    "component": "orders",
                  }
                ]
              },
              {
                "type": "tabset",
                "weight": 25,
                "children": [
                  {
                    "type": "tab",
                    "name": "Operation",
                    "component": "operations"
                  }
                ]
              },
              {
                "type": "tabset",
                "weight": 25,
                "children": [
                  {
                    "type": "tab",
                    "name": "Machine",
                    "component": "machines"
                  }
                ]
              }
            ]
          },
          {
            "type": "tabset",
            "weight": 100,
            "children": [
              {
                "type": "tab",
                "name": "Machine Gantt",
                "component": "gantt"
              }
            ]
          }
        ]
      }
    ]
  }
};



/*
            <button className='ml-1' >Test</button>
*/
