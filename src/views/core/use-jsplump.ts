import panzoom from "panzoom";
import type { ConnectInfoItem } from "../interface";
import { uniqueTargetSource } from './utils/utils'

export const useJsplump = (
  jsplumbInstance: any,
  separator: string,
  commConfig: any,
  commGrid: any,
  jsonNodes: any,
  flowWrapRef: any
) => {
  //添加端点
  const addEndpoint = (elID: any, anchorArr: any) => {
    //AnchorArr 可能有多个锚点需要添加
    anchorArr.forEach((anchor: any) => {
      jsplumbInstance.addEndpoint(elID, {
        anchors: anchor,
        uuid: elID.concat(separator, anchor),
      });
    });
  };
  //将端点连线
  const connectEndpoint = (from: any, to: any) => {
    jsplumbInstance.connect(
      {
        uuids: [from, to],
      },
      commConfig
    );
  };
  //封装拖动，添加辅助对齐线功能
  const draggableNode = (nodeID: string) => {
    jsplumbInstance.draggable(nodeID, {
      grid: commGrid,
      drag: (params: any) => {},
      start: () => {},
      stop: (params: any) => {
        changeNodePosition(nodeID, params.pos);
      },
    });
  };
  const changeNodePosition = (nodeID: string, pos: any) => {
    jsonNodes.some((v: any) => {
      if (nodeID === v.name) {
        v.left = pos[0];
        v.top = pos[1];
        return true;
      } else {
        return false;
      }
    });
  };
  //初始化缩放功能
  const initPanZoom = () => {
    const mainContainer = jsplumbInstance.getContainer();
    const mainContainerWrap = mainContainer.parentNode;
    const pan = panzoom(mainContainer, {
      smoothScroll: false,
      bounds: true,
      zoomDoubleClickSpeed: 1,
      minZoom: 0.5,
      maxZoom: 2,
      //设置滚动缩放的组合键，默认不需要组合键
      beforeWheel: (e) => {
        // console.log(e)
        // let shouldIgnore = !e.ctrlKey
        // return shouldIgnore
      },
      beforeMouseDown: function (e) {
        // allow mouse-down panning only if altKey is down. Otherwise - ignore
        let shouldIgnore = e.ctrlKey;
        return shouldIgnore;
      },
    });
    jsplumbInstance.mainContainerWrap = mainContainerWrap;
    jsplumbInstance.pan = pan;
    // 缩放时设置jsPlumb的缩放比率
    pan.on("zoom", (e: any) => {
      const { x, y, scale } = e.getTransform();
      jsplumbInstance.setZoom(scale);
    });
    pan.on("panend", (e: any) => {
      //   const { x, y, scale } = e.getTransform();
    });
    // 平移时设置鼠标样式
    mainContainerWrap.style.cursor = "move";
    mainContainerWrap.addEventListener("mousedown", function wrapMousedown() {
      mainContainerWrap.style.cursor = "grabbing";
      mainContainerWrap.addEventListener("mouseout", function wrapMouseout() {
        mainContainerWrap.style.cursor = "move";
      });
    });
    mainContainerWrap.addEventListener("mouseup", function wrapMouseup() {
      mainContainerWrap.style.cursor = "move";
    });
  };
  //初始化节点位置  （以便对齐,居中）
  const fixNodesPosition = () => {
    if (jsonNodes && flowWrapRef.value) {
      const nodeWidth = 120;
      const nodeHeight = 40;
      let wrapInfo = flowWrapRef.value.getBoundingClientRect();
      let maxLeft = 0,
        minLeft = wrapInfo.width,
        maxTop = 0,
        minTop = wrapInfo.height;
      let nodePoint = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };
      let fixTop = 0,
        fixLeft = 0;
      jsonNodes.forEach((el: any) => {
        // let top = Number(el.top.substring(0, el.top.length -2))
        // let left = Number(el.left.substring(0, el.left.length -2))
        let top = el.top;
        let left = el.left;
        maxLeft = left > maxLeft ? left : maxLeft;
        minLeft = left < minLeft ? left : minLeft;
        maxTop = top > maxTop ? top : maxTop;
        minTop = top < minTop ? top : minTop;
      });
      nodePoint.left = minLeft;
      nodePoint.right = wrapInfo.width - maxLeft - nodeWidth;
      nodePoint.top = minTop;
      nodePoint.bottom = wrapInfo.height - maxTop - nodeHeight;

      fixTop =
        nodePoint.top !== nodePoint.bottom
          ? (nodePoint.bottom - nodePoint.top) / 2
          : 0;
      fixLeft =
        nodePoint.left !== nodePoint.right
          ? (nodePoint.right - nodePoint.left) / 2
          : 0;

      jsonNodes.map((el: any) => {
        let top = Number(el.top) + fixTop;
        let left = Number(el.left) + fixLeft;
        el.top = Math.round(top / 20) * 20;
        el.left = Math.round(left / 20) * 20;
      });
    }
  };
  // 点击删除线
  const mouseoverLineShowDelete = () => {
    // 添加点击事件监听器到每个连线
    jsplumbInstance.bind("dblclick", function (connection: any, originalEvent: any) {

      const clickedSourceId = connection.sourceId;
      const clickedTargetId = connection.targetId;

      // 获取所有连线
      const connections = jsplumbInstance.getAllConnections();

      // 遍历每个连线
      connections.forEach((conn: any) => {
        if (
          conn.sourceId === clickedSourceId &&
          conn.targetId === clickedTargetId
        ) {
          // 删除具有相同 sourceId 和 targetId 的连线
          setTimeout(() => {
            jsplumbInstance.deleteConnection(conn);
          }, 1);
        }
      });
    });
  };
  // 删除节点
  const deleteNode = (nodeId: string, index: number) => {
    // console.log(nodeId);
    // console.log(index);
    // console.log(jsonNodes);
    jsonNodes.splice(index, 1);
    jsplumbInstance.remove(nodeId);
  };

  // 回显连接线
  const parseConnectEndpoint = (connectionArray: ConnectInfoItem[]) => {
    for (let i = 0; i < connectionArray.length; i++) {
      let connectionInfo = connectionArray[i];

      // 使用 jsPlumb.connect 方法创建连接
      jsplumbInstance.connect(
        {
          source: connectionInfo.source,
          target: connectionInfo.target,
        },
        commConfig
      );
    }
  };
  // 保存
  const saveJsplumb = () => {
    const connections = jsplumbInstance.getConnections();

    // 创建一个空数组用于保存连接线信息
    let connectionArray: ConnectInfoItem[] = [];

    // 遍历连接数组
    for (let i = 0; i < connections.length; i++) {
      let connection = connections[i];
      // 创建一个对象来保存连接的信息
      let connectionInfo = {
        source: connection.source.id,
        target: connection.target.id,
      };

      // 将连接信息添加到数组中
      connectionArray.push(connectionInfo);
    }
    const newArray = uniqueTargetSource(connectionArray)
    // 打印连接线信息数组
    console.log("connectionArray", newArray);
    console.log("jsonNodes", jsonNodes);
  };
  return {
    parseConnectEndpoint,
    addEndpoint,
    connectEndpoint,
    draggableNode,
    initPanZoom,
    fixNodesPosition,
    mouseoverLineShowDelete,
    deleteNode,
    saveJsplumb,
  };
};
