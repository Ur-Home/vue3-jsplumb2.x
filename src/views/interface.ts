// 表字段
export interface FieldItem {
  name: string;
  code: string;
}

export interface NodeItem {
  name: string;
  type: string;
  fields: FieldItem[];
  top: number;
  left: number;
}

// 回显的数据对象类型
export interface ConnectInfoItem {
  source: string;
  target: string;
}

export interface JsPlumbOption {
  
}