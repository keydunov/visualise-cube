import cc from "classcat";
import React from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

import styles from "./Node.module.scss";

import { ModelNodeData } from "~/util/types";

const ModelNode = ({ data }: ModelNodeProps) => {

  const members = [...data.dimensions, ...data.measures];

  const isDimension = (name) => data.dimensions.map((dim) => dim.name).includes(name)

  return (
    <table
      className="font-sans bg-white border-2 border-separate border-black rounded-lg"
      style={{ minWidth: 200, maxWidth: 500, borderSpacing: 0 }}
    >
      <Handle
        key={`${data.name}-target`}
        className={cc([styles.handle, styles.left])}
        type="target"
        id={`${data.name}-target`}
        position={Position.Left}
        isConnectable={false}
      />
      <Handle
        key={`${data.name}-source`}
        className={cc([styles.handle, styles.right])}
        type="source"
        id={`${data.name}-source`}
        position={Position.Right}
        isConnectable={false}
      />
      <thead title={data.documentation}>
        <tr>
          <th
            className="p-2 font-extrabold bg-gray-200 border-b-2 border-black rounded-t-md"
            colSpan={4}
          >
            {data.name}
            {!!data.dbName && (
              <span className="font-mono font-normal">
                &nbsp;({data.dbName})
              </span>
            )}
          </th>
        </tr>
      </thead>
      <tbody>
        {members.map((col) => (
          <tr key={col.name} className={styles.row} style={{ backgroundColor: `${isDimension(col.name) ? 'rgba(102, 93, 232, 0.7)' : 'rgba(218, 52, 102, 0.7)'}`}} title={col.documentation}>
            <td className="p-2 font-mono font-semibold border-t-2 border-r-2 border-gray-300">
              {col.name}
              {/* <button
                type="button"
                className={cc([
                  "relative",
                  "p-2",
                  { "cursor-pointer": isTarget(col) || isSource(col) },
                ])}
                onClick={() => {
                  if (!isTarget(col) && !isSource(col)) return;

                  focusNode(col.type);
                }}
              >
              </button> */}
            </td>
            <td className={`p-2 font-mono border-t-2 border-r-2 border-gray-300`}>
              {col.type}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export interface ModelNodeProps {
  data: ModelNodeData;
}

export default ModelNode;
