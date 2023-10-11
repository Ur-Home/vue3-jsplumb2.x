<template>
  <div class="app-container" id="jsplump-core">
    <span class="save-btn" @click="saveJsplumb">保存</span>
    <span class="add-btn" @click="addJsplump">添加</span>
    <div id="flowWrap" ref="flowWrapRef" class="flow-wrapper">
      <div id="table-flow">
        <NodePanel
          v-for="(node, index) in fieldNodes"
          :id="node.name"
          :key="node.name"
          :node="node"
          :index="index"
          @deleteNode="deleteNode"
        />
      </div>
    </div>
  </div>
  <div class="function-list">
    <el-card>
      <h3>功能清单</h3>
      <p>1. 拖拽节点</p>
      <p>2. 一个source可以连接多个target</p>
      <p>3. 双击连接线删除</p>
      <p>4. 删除节点</p>
      <p>5. 添加表</p>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import NodePanel from "./node.vue";
import { jsPlumb } from "jsplumb";
import commConfig from "./config/jsplumbConfig";
import { useJsplump } from "./use-jsplump";
import sampleData from "./config/sampleData.json";
import { onMounted, ref, nextTick } from "vue";
import type { ConnectInfoItem, NodeItem } from "../interface";

defineOptions({ name: "CoreIndex" });
const jsplumbInstance = ref();
const fieldNodes = ref<NodeItem[]>([]);
//表名和列名的分割符号
const separator = ref("-");
//specified anchor
const anchorArr = ref(["Left", "Right"]);
//节点移动最小距离
const commGrid = ref([5, 5]);
const flowWrapRef = ref();
const initConnectLineData = ref<ConnectInfoItem[]>([
  {
    source: "users-age",
    target: "products-age",
  },
  {
    source: "users-name",
    target: "products-name",
  },
  {
    source: "orders-age",
    target: "products-class",
  },
]);

jsplumbInstance.value = jsPlumb.getInstance();
fieldNodes.value = sampleData.nodes;
onMounted(() => {
  //设置jsplumb实例、设置jsplumb默认配置、设置jsplumb容器
  // console.log("Onmounted", jsplumbInstance.value);
  fixNodesPosition();
  //nextTick 立即更新DOM
  nextTick(() => {
    initialize();
  });
});

const {
  parseConnectEndpoint,
  saveJsplumb,
  // connectEndpoint,
  draggableNode,
  initPanZoom,
  fixNodesPosition,
  mouseoverLineShowDelete,
  deleteNode,
} = useJsplump(
  jsplumbInstance.value,
  separator.value,
  commConfig,
  commGrid.value,
  fieldNodes.value,
  flowWrapRef
);

const addJsplump = () => {
  const obj = {
    name: "test",
    type: "test",
    fields: [
      {
        name: "age",
        code: "int",
      },
      {
        name: "name",
        code: "int",
      },
      {
        name: "class",
        code: "int",
      },
      {
        name: "grade",
        code: "int",
      },
    ],
    top: 200,
    left: 851,
  };
  const state = isHasTable(obj, fieldNodes.value);
  if (!state) {
    fieldNodes.value.push(obj);
    setTimeout(() => {
      addTableAfterOperate(obj.name, obj);
    }, 500);
  } else {
    ElMessage.warning('已存在此表，不可重复添加')
  }
};
const isHasTable = (item: any, array: any[]): boolean => {
  const result = array.filter((i: any) => i.name === item.name);
  return result.length > 0 ? true : false;
};
const initialize = () => {
  // @ts-ignore
  jsPlumb.ready(() => {
    //设置jsplumb实例、设置jsplumb默认配置、设置jsplumb容器
    jsplumbInstance.value.importDefaults(commConfig);
    jsplumbInstance.value.setContainer("table-flow");

    // 先清除一下画布,防止缓存
    jsplumbInstance.value.reset();

    drawing();

    // 会使整个jsPlumb立即重绘。
    jsplumbInstance.value.setSuspendDrawing(false, true);
    loadEasyFlow();
    initPanZoom();
    mouseoverLineShowDelete();
    if (initConnectLineData.value) {
      parseConnectEndpoint(initConnectLineData.value);
    }
  });
};
// 设置可以连线的元素
const loadEasyFlow = () => {
  let arr: any = [];
  fieldNodes.value.forEach((item: any) => {
    item.fields.forEach((itemChild: any) => {
      arr.push(document.querySelectorAll(`#${item.name}-${itemChild.name}`));
      jsplumbInstance.value.batch(function () {
        arr.forEach((trList: any) => {
          trList.forEach((tr: any) => {
            jsplumbInstance.value.makeSource(tr, {
              anchor: ["Left", "Right"], // 设置端点位置
              endpoint: "Dot",
            });
            jsplumbInstance.value.makeTarget(tr, {
              anchor: ["Left", "Right"], // 设置端点位置
              endpoint: "Dot",
            });
          });
        });
      });
    });
  });
};
// 绘制
const drawing = () => {
  if (fieldNodes.value.length !== 0) {
    //1 绘制节点信息
    fieldNodes.value.forEach((node: any) => {
      //使节点可拖动
      draggableNode(node.name);
      // node.fields.forEach((field: any) => {
      //   //表字段添加端点
      //   addEndpoint(
      //     node.name.concat(separator.value, field.name),
      //     anchorArr.value
      //   );
      //   //表头添加端点
      //   // addEndpoint(node.name.concat(separator.value,), anchorArr.value)
      // });
    });
  }
};
// 新增表之后的操作
const addTableAfterOperate = (name: string, item: any) => {
  draggableNode(name);
  let arr: any = [];
  item.fields.forEach((itemChild: any) => {
    arr.push(document.querySelectorAll(`#${item.name}-${itemChild.name}`));
    jsplumbInstance.value.batch(function () {
      arr.forEach((trList: any) => {
        trList.forEach((tr: any) => {
          jsplumbInstance.value.makeSource(tr, {
            anchor: ["Left", "Right"], // 设置端点位置
            endpoint: "Dot",
          });
          jsplumbInstance.value.makeTarget(tr, {
            anchor: ["Left", "Right"], // 设置端点位置
            endpoint: "Dot",
          });
        });
      });
    });
  });
};
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  display: flex;
  width: 90%;
  height: 750px;
  margin: 20px auto;
  border: 1px solid #ccc;
  background: url("../../assets/point.png") repeat;
  .save-btn,
  .add-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 12px;
    width: 80px;
    height: 26px;
    line-height: 26px;
    text-align: center;
    color: #fff;
    cursor: pointer;
    background-color: #00c853;
    border-radius: 5px;
    z-index: 11111;
  }
  .add-btn {
    right: 100px;
    background-color: #7b72db;
  }
  .flow-wrapper {
    height: 100%;
    position: relative;
    overflow: hidden;
    outline: none !important;
    flex-grow: 1;

    #table-flow {
      position: relative;
      // 调大width目的是暂时解决节点拖动到table-flow区域外时(如flow-wrapper)节点宽度自动变窄的问题
      width: 1000%;
      height: 100%;

      .auxiliary-line-x {
        position: absolute;
        border: 0.5px dashed #2ab1e8;
        z-index: 9999;
      }

      .auxiliary-line-y {
        position: absolute;
        border: 0.5px dashed #2ab1e8;
        z-index: 9999;
      }
    }
  }
}
</style>

<style lang="scss">
// 下面是鼠标移动到连线上时激活的样式
.jtk-connector.jtk-hover {
  z-index: 9999;
  path {
    cursor: pointer !important;
  }
}
.function-list {
  margin: 20px auto;
  width: 90%;
}
</style>
