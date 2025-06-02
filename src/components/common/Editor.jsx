import useTheme from "@/hooks/useTheme";
import { useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import api from "@/lib/apiClient";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  filterSuggestionItems,
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

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
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

// 폰트 사이즈 명령
const fontSizeItems = [22, 20, 18, 17, 16, 14, 12, 10].map((size) => (editor) => ({
  title: `텍스트사이즈 ${size}px`,
  onItemClick: async () => {
    await editor.insertBlocks([
      editor.schema.blockSpecs.paragraph.create({
        content: [
          editor.schema.inlineContentSpecs.text.create({
            text: `${size}px 텍스트사이즈를 입력합니다.`,
            props: { className: `f${size}` },
          }),
        ],
      }),
    ]);
  },
  aliases: [`textStyle${size}`],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: `${size}px 텍스트사이즈`,
  description: `${size}px 텍스트사이즈를 입력합니다.`,
}));


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
        blockSpecs: { ...defaultBlockSpecs },
        inlineContentSpecs: customInlineContentSpecs,
      })
    ),
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.ko,
      multi_column: multiColumnLocales.ko,
      placeholders: {
        ...locales.ko.placeholders,
        emptyDocument: "텍스트를 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
        default: "텍스트를 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
        heading: "제목을 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
      },
    },
    ...(initialContent ? { initialContent } : {}),
  });

  // 외부에서 HTML 추출
  useImperativeHandle(ref, () => ({
    getContent: async () => await editor.blocksToFullHTML(editor.document),
  }));

  // 슬래시 메뉴 항목 정의
  const getSlashMenuItems = useMemo(() => {
    return async (query) => {
      const defaultItems = getDefaultReactSlashMenuItems(editor);
      const customItems = [
        ...fontSizeItems.map((fn) => fn(editor)),
        insertCaptionText(editor)
      ];
      return filterSuggestionItems([
        // ...customItems,
        ...defaultItems
      ], query);
    };
  }, [editor]);

  // 초기 HTML → 블록 파싱
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
        className="relative editor-container !pt-[80px]"
        theme={isDarkMode ? "dark" : "light"}
        editable={!readOnly}
      >
        <div className="absolute top-[10px] z-50 bg-white">
          <FormattingToolbar
            editor={editor}
            blockTypeSelectItems={blockTypeSelectItems(editor.dictionary)}
          />
        </div>
        <SuggestionMenuController triggerCharacter="/" getItems={getSlashMenuItems} />
      </BlockNoteView>
    </div>
  );
});

export default Editor;
