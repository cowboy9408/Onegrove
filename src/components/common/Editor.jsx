import useTheme from "@/hooks/useTheme";
import { useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import api from "@/lib/apiClient";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  filterSuggestionItems,
  insertOrUpdateBlock,
  locales,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  FormattingToolbarController,
  FormattingToolbar,
  blockTypeSelectItems,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { MdOutlineFormatColorText } from "react-icons/md";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Alert } from "./Editor/textType.jsx";
import "./Editor/styles.css";

// 파일 업로드 핸들러
async function uploadFile(selectedFile) {
  if (!selectedFile) return;

  const maxSize = 20 * 1024 * 1024;
  if (selectedFile.size > maxSize) {
    alert("20MB가 넘는 이미지는 등록할 수 없습니다.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("classification", "default");

  try {
    const res = await api.post("/api/v1/file/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return res.data?.path;
  } catch (err) {
    alert("파일 업로드 중 문제가 발생했습니다.");
    console.error("파일 업로드 에러", err);
  }
}

// 커스텀 inlineContentSpecs: props.className 사용
const customInlineContentSpecs = {
  ...defaultInlineContentSpecs,
  text: {
    ...defaultInlineContentSpecs.text,
    parseDOM: [
      {
        tag: "span",
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return {};
          const className = node.getAttribute("class");
          return className ? { props: { className } } : {};
        },
      },
    ],
    toDOM: (node) => {
      const className = node.props?.className;
      return ["span", { class: className }, 0];
    },
  },
};

// 캡션 텍스트 명령
const insertCaptionText = (editor) => ({
  title: "캡션 텍스트",
  onItemClick: async () => {
    await editor.insertBlocks([
      editor.schema.blockSpecs.paragraph.create({
        content: [
          editor.schema.inlineContentSpecs.text.create({
            text: "캡션 텍스트를 입력합니다.",
            props: { className: "f10" },
          }),
        ],
      }),
    ]);
  },
  aliases: ["caption"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "캡션 텍스트를 입력합니다.",
  description: "캡션 텍스트를 입력합니다.",
});

// Editor 컴포넌트
const Editor = forwardRef(({ initialContent, readOnly = false }, ref) => {
  const { isDarkMode } = useTheme();

  const editor = useCreateBlockNote({
    uploadFile,
    schema: withMultiColumn(
      BlockNoteSchema.create({
        blockSpecs: { ...defaultBlockSpecs, alert: Alert },
        inlineContentSpecs: customInlineContentSpecs,
      })
    ),
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.ko,
      multi_column: multiColumnLocales.ko,
      placeholders: {
        ...locales.ko.placeholders,
        emptyDocument:
          "텍스트를 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
        default: "텍스트를 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
        heading: "제목을 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
      },
    },
    ...(initialContent ? { initialContent } : {}),
  });

  useImperativeHandle(ref, () => ({
    getContent: async () => await editor.blocksToFullHTML(editor.document),
  }));

  const getSlashMenuItems = useMemo(() => {
    return async (query) => {
      if (!editor) return [];

      const defaultItems = getDefaultReactSlashMenuItems(editor);

      const customItems = [
        // ...fontSizeItems.map((fn) => fn(editor)),
        insertCaptionText(editor),
      ];

      return filterSuggestionItems([...defaultItems, ...customItems], query);
    };
  }, [editor]);

  useEffect(() => {
    async function loadInitialHTML() {
      if (typeof initialContent === "string" && initialContent.trim()) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(initialContent);
          editor.replaceBlocks(editor.document, blocks);
        } catch (err) {
          console.error("HTML to blocks 변환 실패:", err);
        }
      }
    }
    loadInitialHTML();
  }, [initialContent, editor]);

  return (
    <div>
      <BlockNoteView
        editor={editor}
        slashMenu
        formattingToolbar={false}
        className="editor-container relative"
        theme={isDarkMode ? "light" : "light"}
        editable={!readOnly}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar
              blockTypeSelectItems={[
                ...blockTypeSelectItems(editor.dictionary),
                {
                  name: "폰트사이즈 변경",
                  type: "alert",
                  icon: MdOutlineFormatColorText,
                  isSelected: (block) => block.type === "alert",
                },
              ]}
            />
          )}
        />
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) => {
            if (!editor) return [];

            const defaultItems = getDefaultReactSlashMenuItems(editor);
            const lastBasicBlockIndex = defaultItems.findLastIndex(
              (item) => item.group === "기본 블록"
            );

            const alertItem = {
              title: "폰트사이즈 변경",
              subtext: "폰트사이즈를 변경합니다.",
              onItemClick: () =>
                insertOrUpdateBlock(editor, {
                  type: "alert",
                }),
              aliases: [
                "alert",
                "notification",
                "emphasize",
                "warning",
                "error",
                "info",
                "success",
              ],
              group: "기본 블록",
              icon: <MdOutlineFormatColorText />,
            };

            if (lastBasicBlockIndex >= 0) {
              defaultItems.splice(lastBasicBlockIndex + 1, 0, alertItem);
            } else {
              defaultItems.push(alertItem);
            }

            return filterSuggestionItems(defaultItems, query);
          }}
        />
      </BlockNoteView>
    </div>
  );
});

export default Editor;
