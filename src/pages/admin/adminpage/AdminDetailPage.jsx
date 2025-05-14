import Editor from "@/components/common/Editor";
import { useEffect, useRef, useState } from "react";

export default function AdminDetailPage() {
  const [content, setContent] = useState("");
  const editorRef = useRef();

  useEffect(() => {
    console.log(content);
  }, [content]);

  return (
    <div>
      <Editor ref={editorRef} />
      <button
        onClick={async () => console.log(await editorRef.current?.getContent())}
      >
        가져오기
      </button>
    </div>
  );
}
