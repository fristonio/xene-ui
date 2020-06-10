import React from "react";
import G6 from "@antv/g6";
import { Graph } from "@antv/g6";
import { EdgeConfig, ModelConfig } from "@antv/g6/lib/types";
import GGroup from "@antv/g-canvas/lib/group";
import { Point } from "@antv/g-base/lib/types";
import { IShape } from "@antv/g-canvas/lib/interfaces";
import { getColorFromStatus } from "./../../utils/utils";

interface Props {
  tasks: Array<Task>;
  pipeline: string;
}

export interface Task {
  id: string;
  name: string;
  dependencies: Array<string>;
  description: string;
  status: string;
  steps: Array<Step>;
}

export interface Step {
  name: string;
  status: string;
  time: number;
  logFile: string;
  type: string;
}

interface GraphModelConfig extends ModelConfig, Task {}

class PipelineGraphVerbose extends React.Component<Props, {}> {
  graph: Graph | null = null;

  container: React.RefObject<HTMLDivElement> = React.createRef();

  componentDidMount() {
    const data = {
      nodes: new Array<GraphModelConfig>(),
      edges: new Array<EdgeConfig>(),
    };

    let task: Task;
    for (task of this.props.tasks) {
      data.nodes.push(task as GraphModelConfig);

      let deps: Array<string> = task.dependencies;
      if (deps !== null)
        deps.map((t: string) => {
          data.edges.push({
            source: task.name,
            target: t,
          });
        });
    }

    G6.registerNode(
      "card-node",
      {
        drawShape: function drawShape(
          cfg?: GraphModelConfig,
          group?: GGroup
        ): IShape {
          if (cfg === undefined) return {} as IShape;

          const color = getColorFromStatus(cfg.status);
          const r = 2;
          const shape = group?.addShape("rect", {
            attrs: {
              x: 0,
              y: 0,
              width: 150,
              height: 40 + cfg.steps.length * 20,
              stroke: color,
              radius: r,
              fill: "#fff",
            },
            name: "main-box",
            draggable: true,
          });

          group?.addShape("rect", {
            attrs: {
              x: 0,
              y: 0,
              width: 150,
              height: 20,
              fill: color,
              radius: [r, r, 0, 0],
            },
            name: "title-box",
            draggable: true,
          });

          group?.addShape("image", {
            attrs: {
              x: 4,
              y: 2,
              height: 16,
              width: 16,
              cursor: "pointer",
              img:
                "https://gw.alipayobjects.com/mdn/rms_8fd2eb/afts/img/A*0HC-SawWYUoAAAAAAAAAAABkARQnAQ",
            },
            name: "node-icon",
          });

          group?.addShape("text", {
            attrs: {
              textBaseline: "top",
              y: 5,
              x: 24,
              lineHeight: 20,
              text: cfg?.name,
              fill: "#fff",
            },
            name: "label",
          });

          cfg?.steps.forEach((item: Step, index: number) => {
            const c = getColorFromStatus(item.status);

            group?.addShape("circle", {
              attrs: {
                x: 20,
                y: 41 + index * 20,
                r: 3,
                cursor: "pointer",
                fill: c,
              },
              name: `index-status-${index}`,
            });

            group?.addShape("text", {
              attrs: {
                textBaseline: "top",
                y: 35 + index * 20,
                x: 30,
                lineHeight: 20,
                text: item.name,
                fill: "rgba(0,0,0, 0.4)",
              },
              name: `index-title-${index}`,
            });
          });

          if (shape === undefined) return {} as IShape;

          return shape;
        },
      },
      "single-node"
    );

    let width = this.container.current?.scrollWidth;
    width = width !== undefined ? width : 1500;
    let height = this.container.current?.scrollHeight;
    height = height !== undefined ? height || 500 : 500;
    this.graph = new G6.Graph({
      container: this.props.pipeline,
      width: width,
      height: height,
      defaultEdge: {
        type: "cubic-horizontal",
        style: {
          startArrow: true,
          stroke: "#aaa",
          lineWidth: 0.8,
        },
      },
      defaultNode: {
        shape: "card-node",
      },
      layout: {
        type: "dagre",
        rankdir: "RL",
        preventOverlap: true,
      },
      modes: {
        default: ["drag-canvas", "drag-node", "zoom-canvas"],
      },
      nodeStateStyles: {
        hover: {
          lineWidth: 2,
          stroke: "#1890ff",
          fill: "#e6f7ff",
        },
      },
    });

    this.graph.data(data);
    this.graph.render();
    this.graph.fitView();

    let c: Point = {
      x: width / 2,
      y: height / 2,
    };
    this.graph.zoom(0.7, c);

    interface event {
      item: any;
    }
    this.graph.on("node:mouseenter", (evt: event) => {
      const { item } = evt;
      this.graph?.setItemState(item, "hover", true);
    });

    this.graph.on("node:mouseleave", (evt: event) => {
      const { item } = evt;
      this.graph?.setItemState(item, "hover", false);
    });
  }

  componentWillUnmount() {
    this.graph?.destroy();
    this.graph = null;
  }

  render() {
    return (
      <div
        id={this.props.pipeline}
        ref={this.container}
        className="pipeline-graph-container"
      ></div>
    );
  }
}

export { PipelineGraphVerbose };
