import useTheme from "@/hooks/useTheme";
import { useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import {
  BlockNoteSchema,
  filterSuggestionItems,
  insertOrUpdateBlock,
  locales,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { HiOutlineGlobeAlt } from "react-icons/hi";

// 파일 업로드 핸들러
async function uploadFile(file) {
  const body = new FormData();
  body.append("file", file);
  const ret = await fetch("/api/blocknote/upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).url;
}


const insertAdditionalItem = (editor) => ({
  title: "텍스트사이즈 22px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 22px 텍스트사이즈을 입력합니다.", styles: { } }],
    }),
  aliases: ["textStyle22", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 22px 텍스트사이즈을 입력합니다.",
  description: "텍스트사이즈 22px을 입력합니다.",
});

const insertAdditionalItem2 = (editor) => ({
  title: "텍스트사이즈 20px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 20px 텍스트사이즈을 입력합니다.", styles: { } }],
    }),
  aliases: ["textStyle20", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 20px 텍스트사이즈을 입력합니다.",
  description: "텍스트사이즈 20px을 입력합니다.",
});

const insertAdditionalItem3 = (editor) => ({
  title: "텍스트사이즈 18px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 18px 텍스트사이즈을 입력합니다.", styles: { } }],
    }),
  aliases: ["textStyle18", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 18px 텍스트사이즈을 입력합니다.",
  description: "텍스트사이즈 18px을 입력합니다.",
});

const insertAdditionalItem4 = (editor) => ({
  title: "텍스트사이즈 16px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 16px 텍스트사이즈을 입력합니다.", styles: { } }],
    }),
  aliases: ["textStyle16", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 16px 텍스트사이즈을 입력합니다.",
  description: "텍스트사이즈 16px을 입력합니다.",
});

const insertAdditionalItem5 = (editor) => ({
  title: "텍스트사이즈 14px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 14px 텍스트사이즈을 입력합니다.", styles: { } }],
    }),
  aliases: ["textStyle14", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 14px 텍스트사이즈을 입력합니다.",
  description: "텍스트사이즈 14px을 입력합니다.",
});

const insertAdditionalItem6 = (editor) => ({
  title: "텍스트사이즈 13px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 13px 텍스트사이즈을 입력합니다.", styles: { } }],
    }),
  aliases: ["textStyle13", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 13px 텍스트사이즈을 입력합니다.",
  description: "텍스트사이즈 13px을 입력합니다.",
});

const insertAdditionalItem7 = (editor) => ({
  title: "텍스트사이즈 12px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 12px 텍스트사이즈을 입력합니다.", styles: { } }],
    }),
  aliases: ["textStyle12", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 12px 텍스트사이즈을 입력합니다.",
  description: "텍스트사이즈 12px을 입력합니다.",
});

const Editor = forwardRef(({ initialContent, readOnly = false }, ref) => {
  const { isDarkMode } = useTheme();

  const editor = useCreateBlockNote({
    uploadFile,
    schema: withMultiColumn(BlockNoteSchema.create()),
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.ko,
      multi_column: multiColumnLocales.ko,
    },
    ...(initialContent ? { initialContent } : {}),
  });

  // 외부에서 HTML 추출할 수 있도록 ref 노출
  useImperativeHandle(ref, () => ({
    getContent: async () => await editor.blocksToFullHTML(editor.document),
  }));

  // Slash 메뉴 항목 정의
  const getSlashMenuItems = useMemo(() => {
    return async (query) => {
      const defaultItems = getDefaultReactSlashMenuItems(editor);
      const customItems = [
        insertAdditionalItem(editor),
        insertAdditionalItem2(editor),
        insertAdditionalItem3(editor),
        insertAdditionalItem4(editor),
        insertAdditionalItem5(editor),
        insertAdditionalItem6(editor),
        insertAdditionalItem7(editor),
        ...defaultItems];
      return filterSuggestionItems(customItems, query);
    };
  }, [editor]);

  // HTML → 블록 변환 (초기 콘텐츠 설정)
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
        slashMenu={true}
        className="editor-container"
        theme={isDarkMode ? "dark" : "light"}
        editable={!readOnly}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getSlashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
});

export default Editor;