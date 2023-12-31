<template>
  <div class="table-node" :style="[setCoordinate, setColor(node.type, 8620)]">
    <!--    表头：放置表名-->
    <div
      :id="`${node.name}${separator}`"
      class="table-node-name"
      :style="setColor(node.type, 17)"
    >
      {{ node.name }}
      <el-popconfirm title="是否删除此节点" @confirm="deleteItem(node.name)">
        <template #reference>
          <span>删除</span>
        </template>
      </el-popconfirm>
    </div>
    <!--表域：放置表字段-->
    <div :id="`${node.name}${separator}fields`" class="table-node-fields">
      <!-- 表名和字段名拼接后用于jsplumb绑定id与key确定节点（绘制端点和连线时用到,参考Index.vue的drawing方法） 请保证组合而成的id唯一，否则连线失败 -->
      <div
        v-for="field in node.fields"
        :id="`${node.name}${separator}${field.name}`"
        :key="`${node.name}${separator}${field.name}`"
        class="field"
      >
        <span>{{ field.name }}</span>
        <span>{{ field.code }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, CSSProperties } from "vue";
import colorFields from "./config/colorConfig";
import type { NodeItem } from "../interface";
import { definePropType } from "./utils/utils";
defineOptions({ name: "CoreIndexNode" });
const props = defineProps({
  node: {
    type: definePropType<NodeItem>(Object),
    default: {},
  },
  index: {
    type: Number,
    default: -1,
  },
});
const emits = defineEmits(["deleteNode"]);
const separator = ref("-");
const index = computed(() => props.index);

const setCoordinate = computed<CSSProperties>(() => {
  const style: CSSProperties = {};
  style.top = props.node.top + "px";
  style.left = props.node.left + "px";
  return style;
});
// 设置TableNode颜色：
// 如果是 table-node 仅设置边框，如果是table-node-name 设置背景颜色
const setColor = (t: any, flag: any) => {
  const style: CSSProperties = {};
  for (let item in colorFields) {
    if (t === colorFields[item].type) {
      // 如果flag是偶数（flag=8620 魔数纯粹自己开心）
      if ((flag & 1) === 0) {
        style.border = colorFields[item].color;
        style.borderStyle = "solid";
        style.borderWidth = "1px";
        return style;
      } else {
        // 如果flag是奇数
        style.backgroundColor = colorFields[item].color;
        return style;
      }
    }
  }
  return style;
};
const deleteItem = (nodeId: string) => {
  emits("deleteNode", nodeId, index.value);
};
</script>

<style lang="scss" scoped>
.table-node {
  position: absolute;
  cursor: move;
  width: 120px;
  border: 1px solid #000;
  align-items: center;
  z-index: 9995;
  border-radius: 3px 3px 0 0;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);

  .table-node-name {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    height: 24px;
    line-height: 24px;
    background-color: #91c051;
    color: white;
    font-size: 12px;
  }

  .table-node-fields {
    background-color: #fff;

    .field {
      display: flex;
      padding: 4px 5px;
      justify-content: space-between;
      transform: scale(0.916);
      font-family: verdana, sans serif;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis; /*行内文本太长后面的就省略*/
      word-break: break-all;
    }
  }
}
</style>
