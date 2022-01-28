import React from "react";
import "./App.css";

import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  DefaultLinkFactory,
  DefaultLinkModel,
  DefaultLinkWidget,
  LinkModel,
} from "@projectstorm/react-diagrams";

import { CanvasWidget } from "@projectstorm/react-canvas-core";

import { LinkWidget } from "@projectstorm/react-diagrams-core";
import "./styles.css";

export class AdvancedLinkModel extends DefaultLinkModel {
  constructor() {
    super({
      type: "advanced",
      width: 4,
    });
  }
}

export class AdvancedPortModel extends DefaultPortModel {
  createLinkModel() {
    return new AdvancedLinkModel();
  }
}

const CustomLinkArrowWidget = (props) => {
  const { point, previousPoint } = props;

  const angle =
    90 +
    (Math.atan2(
      point.getPosition().y - previousPoint.getPosition().y,
      point.getPosition().x - previousPoint.getPosition().x
    ) *
      180) /
      Math.PI;

  //translate(50, -10),
  return (
    <g
      className="arrow"
      transform={
        "translate(" +
        point.getPosition().x +
        ", " +
        point.getPosition().y +
        ")"
      }
    >
      <g style={{ transform: "rotate(" + angle + "deg)" }}>
        <g transform={"translate(0, -3)"}>
          <polygon
            points="0,10 8,30 -8,30"
            fill={props.color}
            onMouseLeave={() => {
              this.setState({ selected: false });
            }}
            onMouseEnter={() => {
              this.setState({ selected: true });
            }}
            data-id={point.getID()}
            data-linkid={point.getLink().getID()}
          ></polygon>
        </g>
      </g>
    </g>
  );
};

export class AdvancedLinkWidget extends DefaultLinkWidget {
  generateArrow(point, previousPoint) {
    return (
      <CustomLinkArrowWidget
        key={point.getID()}
        point={point}
        previousPoint={previousPoint}
        colorSelected={this.props.link.getOptions().selectedColor}
        color={this.props.link.getOptions().color}
      />
    );
  }

  render() {
    //ensure id is present for all points on the path
    var points = this.props.link.getPoints();
    var paths = [];
    this.refPaths = [];

    //draw the multiple anchors and complex line instead
    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          LinkWidget.generateLinePath(points[j], points[j + 1]),
          {
            "data-linkid": this.props.link.getID(),
            "data-point": j,
            onMouseDown: (event) => {
              this.addPointToLink(event, j + 1);
            },
          },
          j
        )
      );
    }

    //render the circles
    for (let i = 1; i < points.length - 1; i++) {
      paths.push(this.generatePoint(points[i]));
    }

    if (this.props.link.getTargetPort() !== null) {
      paths.push(
        this.generateArrow(points[points.length - 1], points[points.length - 2])
      );
    } else {
      paths.push(this.generatePoint(points[points.length - 1]));
    }

    return (
      <g data-default-link-test={this.props.link.getOptions().testName}>
        {paths}
      </g>
    );
  }
}

export class AdvancedLinkFactory extends DefaultLinkFactory {
  constructor() {
    super("advanced");
  }

  generateModel() {
    return new AdvancedLinkModel();
  }

  generateReactWidget(event) {
    return (
      <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />
    );
  }
}

const Diagram = () => {
  // create an instance of the engine with all the defaults
  let engine = createEngine();
  engine.getLinkFactories().registerFactory(new AdvancedLinkFactory());

  // create some nodes
  let node1 = new DefaultNodeModel("Source", "rgb(0,192,255)");
  let port1 = node1.addPort(new AdvancedPortModel(false, "out"));
  node1.setPosition(100, 100);

  let node2 = new DefaultNodeModel("Destination", "rgb(192,255,0)");
  let port2 = node2.addPort(new AdvancedPortModel(true, "in"));
  node2.setPosition(500, 350);

  let model = new DiagramModel();
  let link = new LinkModel();

  link.registerListener({
    linksUpdated: (e) => console.log("nodeupdate", e),
  });

  model.registerListener({
    linksUpdated: (e) => console.log("modelLinks", e),
  });

  model.addAll(port1.link(port2));

  link.setSourcePort(port1);
  link.setTargetPort(port2);
  // add everything else
  let models = model.addAll(node1, node2);

  models.forEach((element) => {
    element.registerListener({
      nodesUpdated: (e) => console.log("nodesUpdated", e),
      linksUpdated: (e) => console.log("linksUpdated", e),

      // the following maybe triggered

      zoomUpdated: (e) => console.log("zoomUpdated", e),
      gridUpdated: (e) => console.log("gridUpdated", e),
      offsetUpdated: (e) => console.log("offsetUpdated", e),
      entityRemoved: (e) => console.log("entityRemoved", e),
      selectionChanged: (e) => console.log("selectionChanged", e),

      sourcePortChanged: (e) => console.log("sourcePortChanged", e),
      targetPortChanged: (e) => console.log("targetPortChanged", e),
      positionChanged: (e) => console.log("positionChanged", e), // triggers frequently
    });
  });

  // load model into engine
  engine.setModel(model);

  return (
    <div className="app-wrapper">
      <div></div>
      <div className="csection">
        <CanvasWidget className="canvas" engine={engine} />
      </div>
    </div>
  );
};

export default Diagram;
