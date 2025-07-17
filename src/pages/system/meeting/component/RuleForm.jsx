import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Textarea from "@/components/common/Textarea";
import Editor from "@/components/common/Editor";

const RuleForm = forwardRef(function RuleForm(
  { data, setData, lang, menu },
  ref
) {
  const editorRef = useRef();

  const [formData, setFormData] = useState({
    title: data?.title || "",
    content: data?.content || "",
  });

  // 외부에서 submit() 가능하도록 ref 연결
  useImperativeHandle(ref, () => ({
    submit: async (onError) => {
      if (!formData.title.trim()) {
        onError("제목을 입력해주세요.");
        return null;
      }

      const content = await editorRef.current?.getContent();
      if (!content || content.trim() === "") {
        onError("내용을 입력해주세요.");
        return null;
      }

      return {
        id: data?.id || null,
        lang: lang.toUpperCase(),
        menuCode: menu,
        title: formData.title,
        content,
        showYn: "Y", // 고정값 예시
        type: "BASIC", // 고정값 예시
      };
    },
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div className="space-y-6">
      <Textarea
        label="제목"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        maxLength={100}
        placeholder="제목을 입력해주세요"
      />
      <Editor ref={editorRef} initialContent={formData.content} />
    </div>
  );
});

export default RuleForm;
