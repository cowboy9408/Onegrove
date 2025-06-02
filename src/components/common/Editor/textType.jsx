import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import { MdCancel, MdCheckCircle, MdError, MdOutlineFormatColorText } from "react-icons/md";

import "./styles.css";

// The types of alerts that users can choose from.
export const alertTypes = [
  {
    title: "폰트사이즈 28px",
    value: "f28",
    icon: MdOutlineFormatColorText,
  },
  {
    title: "폰트사이즈 24px",
    value: "f24",
    icon: MdOutlineFormatColorText,
  },
  {
    title: "폰트사이즈 22px",
    value: "f22",
    icon: MdOutlineFormatColorText,
  },
  {
    title: "폰트사이즈 20px",
    value: "f20",
    icon: MdOutlineFormatColorText,
  },
  {
    title: "폰트사이즈 18px",
    value: "f18",
    icon: MdOutlineFormatColorText,
  },
  {
    title: "폰트사이즈 16px",
    value: "f16",
    icon: MdOutlineFormatColorText,
  },
  {
    title: "폰트사이즈 14px",
    value: "f14",
    icon: MdOutlineFormatColorText,
  },
  {
    title: "폰트사이즈 12px",
    value: "f12",
    icon: MdOutlineFormatColorText,
  },
];

// The Alert block.
export const Alert = createReactBlockSpec(
  {
    type: "alert",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "f22",
        values: ["f28", "f24", "f22", "f20", "f18", "f16", "f14", "f12"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const alertType = alertTypes.find(
        (a) => a.value === props.block.props.type
      );
      const Icon = alertType.icon;

      return (
        <div className="fontsize" data-alert-type={props.block.props.type}>
          {/* Icon which opens a menu to choose the Alert type */}
          <Menu withinPortal={false}>
            <Menu.Target>
              <div className="alert-icon-wrapper" contentEditable={false}>
                <Icon
                  className="alert-icon"
                  data-alert-icon-type={props.block.props.type}
                  size={32}
                />
              </div>
            </Menu.Target>
            {/* Dropdown to change the Alert type */}
            <Menu.Dropdown>
              <Menu.Label>폰트사이즈 리스트</Menu.Label>
              <Menu.Divider />
              {alertTypes.map((type) => {
                const ItemIcon = type.icon;

                return (
                  <Menu.Item
                    key={type.value}
                    leftSection={
                      <ItemIcon
                        className="alert-icon"
                        data-alert-icon-type={type.value}
                      />
                    }
                    onClick={() =>
                      props.editor.updateBlock(props.block, {
                        type: "alert",
                        props: { type: type.value },
                      })
                    }
                  >
                    {type.title}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
          {/* Rich text field for user to type in */}
          <div className="inline-content" ref={props.contentRef} />
        </div>
      );
    },
  }
);