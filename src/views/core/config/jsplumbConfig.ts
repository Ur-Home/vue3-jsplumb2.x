import colorFields from "./colorConfig";

const commConfig: any = {
  grid: [10, 10],
  Container: "jsplump-core",
  //四种样式：Bezier/Straight/Flowchart/StateMachine
  // Connector: ["Bezier", { curviness: 10 }],
  Connector: ["Straight", {stub: [20, 50], gap: 10}],
  // Connector: ["Flowchart", { stub: [20, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
  // Connector: ["StateMachine"],
  // 连线的端点
  Endpoint: ["Dot", { radius: 1 }],
  // 端点的样式
  EndpointStyle: {
    fill: "#fff",
    outlineWidth: 1,
  },
  // 通常连线的样式
  PaintStyle: {
    stroke: colorFields[2].color,
    strokeWidth: 2,
  },
  //hover激活连线的样式
  HoverPaintStyle: {
    stroke: colorFields[3].color,
    strokeWidth: 2,
  },
  MaxConnections: 1, // 设置连接点最多可以连接几条线 -1不限
  // 绘制箭头
  Overlays: [
    [
      "Arrow",
      {
        width: 8,
        length: 10,
        location: 1,
      },
    ],
  ],
  LogEnabled: true, //是否打开jsPlumb的内部日志记录
  // 动态锚点、位置自适应
  Anchors: [
    "Top",
    "TopCenter",
    "TopRight",
    "TopLeft",
    "Right",
    "RightMiddle",
    "Bottom",
    "BottomCenter",
    "BottomRight",
    "BottomLeft",
    "Left",
    "LeftMiddle",
  ],
  // 鼠标不能拖动删除线
  ConnectionsDetachable: false,
  // 删除线的时候节点不删除
  DeleteEndpointsOnDetach: false,
};

export default commConfig;
