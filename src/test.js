/*
var width = window.innerWidth;
var height = window.innerHeight;
var shadowOffset = 20;
var tween = null;
var blockSnapSize = 30;

var shadowRectangle = new Konva.Rect({
  x: 0,
  y: 0,
  width: blockSnapSize * 6,
  height: blockSnapSize * 3,
  fill: '#FF7B17',
  opacity: 0.6,
  stroke: '#CF6412',
  strokeWidth: 3,
  dash: [20, 2]
});

function newRectangle(x, y, layer, stage) {
  let rectangle = new Konva.Rect({
    x: x,
    y: y,
    width: blockSnapSize * 6,
    height: blockSnapSize * 3,
    fill: '#fff',
    stroke: '#ddd',
    strokeWidth: 1,
    shadowColor: 'black',
    shadowBlur: 2,
    shadowOffset: {x : 1, y : 1},
    shadowOpacity: 0.4,
    draggable: true
  });
  rectangle.on('dragstart', (e) => {
    shadowRectangle.show();
    shadowRectangle.moveToTop();
    rectangle.moveToTop();
  });
  rectangle.on('dragend', (e) => {
    rectangle.position({
      x: Math.round(rectangle.x() / blockSnapSize) * blockSnapSize,
      y: Math.round(rectangle.y() / blockSnapSize) * blockSnapSize
    });
    stage.batchDraw();
    shadowRectangle.hide();
  });
  rectangle.on('dragmove', (e) => {
    shadowRectangle.position({
      x: Math.round(rectangle.x() / blockSnapSize) * blockSnapSize,
      y: Math.round(rectangle.y() / blockSnapSize) * blockSnapSize
    });
    stage.batchDraw();
  });
  layer.add(rectangle);
}

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height
});

var gridLayer = new Konva.Layer();
var padding = blockSnapSize;
console.log(width, padding, width / padding);
for (var i = 0; i < width / padding; i++) {
  gridLayer.add(new Konva.Line({
    points: [Math.round(i * padding) + 0.5, 0, Math.round(i * padding) + 0.5, height],
    stroke: '#ddd',
    strokeWidth: 1,
  }));
}

gridLayer.add(new Konva.Line({points: [0,0,10,10]}));
for (var j = 0; j < height / padding; j++) {
  gridLayer.add(new Konva.Line({
    points: [0, Math.round(j * padding), width, Math.round(j * padding)],
    stroke: '#ddd',
    strokeWidth: 0.5,
  }));
}

var layer = new Konva.Layer();
shadowRectangle.hide();
layer.add(shadowRectangle);
newRectangle(blockSnapSize * 3, blockSnapSize * 3, layer, stage);
newRectangle(blockSnapSize * 10, blockSnapSize * 3, layer, stage);

stage.add(gridLayer);
stage.add(layer);


import React, { Component } from "react";
import Konva from "konva";
import { render } from "react-dom";
import { Stage, Layer, Star } from "react-konva";
// import KonvaContextMenu from "./KonvaContextMenu";
import Portal from "./Portal";
import ContextMenu from "./ContextMenu";

class App extends Component {
  state = { selectedContextMenu: null };
  handleOptionSelected = option => {
    console.log(option);
    this.setState({ selectedContextMenu: null });
  };
  handleContextMenu = e => {
    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
    const mousePosition = e.target.getStage().getPointerPosition();

    this.setState({
      selectedContextMenu: {
        type: "START",
        position: mousePosition
      }
    });
  };
  handleDragStart = e => {
    e.target.setAttrs({
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1
    });
  };
  handleDragEnd = e => {
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    });
  };
  render() {
    const { selectedContextMenu } = this.state;
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Star
            key="123"
            x={200}
            y={200}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#89b717"
            opacity={0.8}
            draggable
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.6}
            onDragStart={this.handleDragStart}
            onDragEnd={this.handleDragEnd}
            onclick={this.handleClick}
            onContextMenu={this.handleContextMenu}
          />
          {selectedContextMenu && (
            <Portal>
              <ContextMenu
                {...selectedContextMenu}
                onOptionSelected={this.handleOptionSelected}
              />
            </Portal>
          )}
        </Layer>
      </Stage>
    );
  }
}

render(<App />, document.getElementById("root"));
*/