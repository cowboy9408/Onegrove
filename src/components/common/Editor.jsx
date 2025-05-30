import useTheme from "@/hooks/useTheme";
import { useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import api from "@/lib/apiClient";
import {
  BlockNoteSchema,
  filterSuggestionItems,
  insertOrUpdateBlock,
  locales,
  defaultBlockSpecs,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";
import {
  FormattingToolbarController,
  blockTypeSelectItems,
  useCreateBlockNote,
  FormattingToolbar,
} from "@blocknote/react";
import {
  multiColumnDropCursor,
  locales as multiColumnLocales,
  withMultiColumn,
} from "@blocknote/xl-multi-column";
import { HiOutlineGlobeAlt } from "react-icons/hi";

import { RiAlertFill } from "react-icons/ri";

import { Alert } from "./Editor/textType.jsx";


// 파일 업로드 핸들러
async function uploadFile(selectedFile) {
  console.log("[Upload] 업로드 필드:", selectedFile);

  let classification = "default"; // 기본 분류 설정 editor?

  if (!selectedFile) {
    console.warn("파일이 선택되지 않았습니다.");
    return;
  }
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (selectedFile.size > maxSize) {
    alert("20MB가 넘는 이미지는 등록할 수 없습니다.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("classification", classification);

  console.log("업로드할 파일:", selectedFile);

  try {
    console.log("업로드할 form:", formData);
    const res = await api.post("/api/v1/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    console.log("업로드 전체 응답:", res);
    console.log("업로드 응답 .data:", res.data);
    console.log("업로드 응답 .data.data:", res.data?.data);

    const result = res.data;
    console.log("Upload 응답 result:", result);
    console.log("업로드 응답 result:", result);

    if (result.name && result.path) {
      const uploadedFile = {
        id: result.id ?? null,
        originalName: selectedFile.name,
        name: result.name,
        size: result.size,
        extension: "." + selectedFile.name.split(".").pop(),
        mime: result.mime || selectedFile.type,
        classification: classification,
        path: result.path,
        status: "C", //신규 등록이면 반드시 C
        field: result.name,
      };
      console.log("서버 업로드 완료:", result.name, uploadedFile);

      return await result.path;
    } else {
      console.error("파일 업로드 실패", result);
    }
  } catch (err) {
    if (err.isAuthFailed) {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      // 필요시 로그인 모달 오픈 등 UI 처리
    } else {
      console.error("파일 업로드 에러", err);
      alert("파일 업로드 중 문제가 발생했습니다.");
    }
  }
}

const insertAdditionalItem = (editor) => ({
  title: "텍스트사이즈 22px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 22px 텍스트사이즈를 입력합니다.", class: "f22" }],
    }),
  aliases: ["textStyle22", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 22px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 22px을 입력합니다.",
});

const insertAdditionalItem2 = (editor) => ({
  title: "텍스트사이즈 20px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 20px 텍스트사이즈를 입력합니다.", class: "f20" }],
    }),
  aliases: ["textStyle20", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 20px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 20px을 입력합니다.",
});

const insertAdditionalItem3 = (editor) => ({
  title: "텍스트사이즈 18px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 18px 텍스트사이즈를 입력합니다.", class: "f18" }],
    }),
  aliases: ["textStyle18", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 18px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 18px을 입력합니다.",
});


const insertAdditionalItem4 = (editor) => ({
  title: "텍스트사이즈 17px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 13px 텍스트사이즈를 입력합니다.", class: "f17" }],
    }),
  aliases: ["textStyle13", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 13px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 13px을 입력합니다.",
});

const insertAdditionalItem5 = (editor) => ({
  title: "텍스트사이즈 16px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 16px 텍스트사이즈를 입력합니다.", class: "f16" }],
    }),
  aliases: ["textStyle16", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 16px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 16px을 입력합니다.",
});

const insertAdditionalItem6 = (editor) => ({
  title: "텍스트사이즈 14px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 14px 텍스트사이즈를 입력합니다.", class: "f14" }],
    }),
  aliases: ["textStyle14", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 14px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 14px을 입력합니다.",
});

const insertAdditionalItem7 = (editor) => ({
  title: "텍스트사이즈 12px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 12px 텍스트사이즈를 입력합니다.", class: "f12" }],
    }),
  aliases: ["textStyle12", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 12px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 12px을 입력합니다.",
});

const insertAdditionalItem8 = (editor) => ({
  title: "텍스트사이즈 10px",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "폰트사이즈 10px 텍스트사이즈를 입력합니다.", class: "f10" }],
    }),
  aliases: ["textStyle10", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "폰트사이즈 10px 텍스트사이즈를 입력합니다.",
  description: "텍스트사이즈 10px을 입력합니다.",
});

const insertAdditionalItem9 = (editor) => ({
  title: "캡션 텍스트",
  onItemClick: () =>
    insertOrUpdateBlock(editor, {
      type: "paragraph",
      content: [{ type: "text", text: "캡션 텍스트 입력합니다.", class: "f10" }],
    }),
  aliases: ["textStyle12", "hw"],
  group: "textStyle",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "캡션 텍스트를 입력합니다.",
  description: "캡션 텍스트를 입력합니다.",
});


const Editor = forwardRef(({ initialContent, readOnly = false }, ref) => {
  const { isDarkMode } = useTheme();

  const editor = useCreateBlockNote({
    uploadFile,
    schema: withMultiColumn(BlockNoteSchema.create({
      blockSpecs: {
        // Adds all default blocks.
        ...defaultBlockSpecs,
        // Adds the Alert block.
        alert: Alert,
      },
    })),
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.ko,
      multi_column: multiColumnLocales.ko,
      placeholders: {
        ...locales.ko.placeholders,
        // We override the empty document placeholder
        emptyDocument: "텍스트를 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
        // We override the default placeholder
        default: "텍스트를 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
        // We override the heading placeholder
        heading: "제목을 입력하거나 명령을 입력하려면 '/'를 입력하세요.",
      },
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
        insertAdditionalItem8(editor),
        insertAdditionalItem9(editor),
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
        className="relative editor-container !pt-[80px]"
        theme={isDarkMode ? "dark" : "light"}
        editable={!readOnly}
      >
        <div className="absolute top-[10px] z-50 bg-white">
          <FormattingToolbar
            editor={editor}
            blockTypeSelectItems={[
              ...blockTypeSelectItems(editor.dictionary),
              {
                name: "Alert",
                type: "alert",
                icon: RiAlertFill,
                isSelected: (block) => block.type === "alert",
              },
            ]}
          />
        </div>
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getSlashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
});

export default Editor;
