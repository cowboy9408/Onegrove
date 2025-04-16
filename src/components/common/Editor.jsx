import useTheme from "@/hooks/useTheme";
import {
  BlockNoteSchema,
  combineByGroup,
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
  getMultiColumnSlashMenuItems,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { forwardRef, useImperativeHandle, useMemo } from "react";

/*
 * 파일 업로드
 * */
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
    /* 이미지 업로드 */
    uploadFile,

    /* multi column */
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

  /*
   * multi column
   * */
  const getSlashMenuItems = useMemo(() => {
    return async (query) =>
      filterSuggestionItems(
        combineByGroup(
          getDefaultReactSlashMenuItems(editor),
          getMultiColumnSlashMenuItems(editor)
        ),
        query
      );
  }, [editor]);

  return (
    <div className="">
      <BlockNoteView
        editor={editor}
        slashMenu={false}
        className="editor-container"
        theme={isDarkMode ? "dark" : "light"}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={getSlashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
});

export default Editor;
