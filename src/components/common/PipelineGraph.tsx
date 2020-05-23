import React from "react";
import G6 from "@antv/g6";
import { Graph } from "@antv/g6";
import { NodeConfig, EdgeConfig } from "@antv/g6/lib/types";

interface Props {
  tasks: Object;
  pipeline: string;
}

interface TaskSpec {
  dependencies: Array<string>;
  description: string;
}

class PipelineGraph extends React.Component<Props, {}> {
  graph: Graph | null = null;

  componentDidMount() {
    const data = {
      nodes: new Array<NodeConfig>(),
      edges: new Array<EdgeConfig>(),
    };

    let name: string, task: TaskSpec;
    for ([name, task] of Object.entries(this.props.tasks)) {
      data.nodes.push({
        id: name,
        label: name,
        description: task["description"],
      });

      let deps: Array<string> = task["dependencies"];
      if (deps !== null)
        deps.map((t: string) => {
          data.edges.push({
            source: name,
            target: t,
            style: {
              startArrow: true,
            },
          });
        });
    }

    this.graph = new G6.Graph({
      container: this.props.pipeline,
      width: 1920,
      height: 500,
      layout: {
        type: "dagre",
      },
      defaultNode: {
        type: "modelRect",
        size: [270, 80],
        style: {
          radius: 5,
          stroke: "#69c0ff",
          fill: "#ffffff",
          lineWidth: 1,
          fillOpacity: 1,
        },

        labelCfg: {
          style: {
            fill: "#595959",
            fontSize: 14,
          },
          offset: 30,
        },

        preRect: {
          show: true,
          width: 4,
          fill: "#40a9ff",
          radius: 2,
        },

        linkPoints: {
          top: false,
          right: false,
          bottom: false,
          left: false,
          size: 3,
          lineWidth: 1,
          fill: "#72CC4A",
          stroke: "#72CC4A",
        },

        logoIcon: {
          show: true,
          x: 0,
          y: 0,
          img:
            "https://gw.alipayobjects.com/zos/basement_prod/4f81893c-1806-4de4-aff3-9a6b266bc8a2.svg",
          width: 16,
          height: 16,
          offset: 0,
        },

        stateIcon: {
          show: true,
          x: 0,
          y: 0,
          img:
            "https://gw.alipayobjects.com/zos/basement_prod/300a2523-67e0-4cbf-9d4a-67c077b40395.svg",
          width: 16,
          height: 16,
          offset: -5,
        },
      },
      modes: {
        default: ["drag-canvas", "drag-node", "zoom-canvas"],
      },
      fitView: true,
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
    return <div id={this.props.pipeline}></div>;
  }
}

export default PipelineGraph;
