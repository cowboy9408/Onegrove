import useTheme from "@/hooks/useTheme";
import {
  BlockNoteSchema,
  filterSuggestionItems,
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
import { forwardRef, useImperativeHandle, useMemo } from "react";

async function uploadFile(file) {
  const body = new FormData();
  body.append("file", file);
  const ret = await fetch("/api/blocknote/upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).url;
}

const Editor = forwardRef(({ initialContent }, ref) => {
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

  useImperativeHandle(ref, () => ({
    getContent: async () => await editor.blocksToFullHTML(editor.document),
  }));

  const getSlashMenuItems = useMemo(() => {
    return async (query) =>
      filterSuggestionItems(
        getDefaultReactSlashMenuItems(editor),
        query
      );
  }, [editor]);

  return (
    <div>
      <BlockNoteView
        editor={editor}
        slashMenu={true} // ✅ Slash 메뉴 활성화
        className="editor-container"
        theme={isDarkMode ? "dark" : "light"}
      >
        {/* Slash 명령어 입력 시 보여줄 메뉴 */}
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getSlashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
});

export default Editor;
