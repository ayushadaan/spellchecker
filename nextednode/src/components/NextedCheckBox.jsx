import React, { useState } from "react";
import { data } from "../data";

const RenderElement = ({ data, checked, setChecked }) => {
  const handleChange = (isChecked, node) => {
    setChecked((prev) => {
      const updated = { ...prev, [node.id]: isChecked };

      // Recursively check children and update their states
      const updateChildren = (node) => {
        node.children?.forEach((child) => {
          updated[child.id] = isChecked;
          child.children && updateChildren(child);
        });
      };

      updateChildren(node);

      // Check if all children are checked
      const verifyChecked = (node) => {
        if (!node.children) {
          console.log(`Checking leaf node: ${node.name}`);

          return updated[node.id] || false;
        }
        console.log(node.children);
        console.log(node.name);

        const allChecked = node.children.every((child) => {
          console.log(`Checking child: ${child.name}`);
          return verifyChecked(child);
        });
        console.log(allChecked ? "all checked" : "not all checked");
        updated[node.id] = allChecked;
        console.log(`Setting ${node.name} to ${allChecked}`);
        return allChecked;
      };

      data.forEach((node) => verifyChecked(node));
      console.log(verifyChecked(node));

      return updated;
    });
  };
  console.log(checked);

  return data.map((node) => {
    return (
      <div key={node.id}>
        <input
          type="checkBox"
          name={node.name}
          id={node.name}
          checked={checked[node.id] || false}
          onChange={(e) => handleChange(e.target.checked, node)}
        />
        <label htmlFor={node.name}>{node.name}</label>
        {node?.children && node.children.length > 0 && (
          <div style={{ paddingLeft: "20px" }}>
            <RenderElement
              data={node.children}
              checked={checked}
              setChecked={setChecked}
            />
          </div>
        )}
      </div>
    );
  });
};

const NextedCheckBox = () => {
  const [checked, setChecked] = useState({});

  return (
    <div>
      {data && (
        <RenderElement data={data} checked={checked} setChecked={setChecked} />
      )}
    </div>
  );
};

export default NextedCheckBox;
